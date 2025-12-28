import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import { router } from '../src/routes/index.js';
import { errorHandler } from '../src/utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const onboardingUploadsDir = path.join(uploadsDir, 'onboarding');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(onboardingUploadsDir)) {
  fs.mkdirSync(onboardingUploadsDir, { recursive: true });
}

const app = express();

// Important for Replit deployment
const PORT = parseInt(process.env.PORT || '3000', 10);

// Use dynamic server URL for Swagger in production
const serverUrl =
  process.env.NODE_ENV === 'production'
    ? '/'
    : `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Everspeak Backend API',
      version: '1.0.0',
      description: 'A professional Node.js + Express backend API with organized folder structure',
      contact: { name: 'API Support' }
    },
    servers: [
      {
        url: serverUrl,
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// --- FIXED CORS SECTION ---
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://165.22.44.109:3000',
      'http://165.22.44.109',
      'https://everspeak.almaseo.com',
      /\.replit\.app$/,
      /\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.dev$/,
      /\.ngrok-free\.app$/,
      /\.ngrok-free\.dev$/,
      /\.ngrok\.io$/,
      /^https:\/\/.*\.ngrok-free\.app$/,
      /^https:\/\/.*\.ngrok-free\.dev$/,
      /^https:\/\/.*\.ngrok\.io$/,
      /^exp:\/\/.*$/,  // Expo development
      /\.expo\.dev$/,
      /^https:\/\/.*\.expo\.dev$/,
    ];

    const isAllowed = allowed.some(rule =>
      typeof rule === 'string'
        ? origin === rule
        : rule.test(origin)
    );

    if (isAllowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// Needed for reverse proxy (DigitalOcean, Replit, etc.)
app.set('trust proxy', 1);

// Rate limiter - disable all validation to avoid ERR_ERL_PERMISSIVE_TRUST_PROXY
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  validate: false, // Disable all validation
});

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
const publicPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'public')
    : path.join(__dirname, '..', 'public');

const assetsPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'attached_assets')
    : path.join(__dirname, '..', 'attached_assets');

app.use(express.static(publicPath));
app.use('/attached_assets', express.static(assetsPath));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api', router);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Everspeak Backend is running on port ${PORT}`);
  console.log(`🌐 Web UI available at ${serverUrl}`);
  console.log(`📚 Swagger Docs available at ${serverUrl}api-docs`);
});
