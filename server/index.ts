import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import { router } from '../src/routes/index.js';
import { errorHandler } from '../src/utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:3000',
      'http://localhost:5000',
      /\.replit\.app$/,
      /\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.dev$/
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

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

// Needed for Replit's reverse proxy
app.set('trust proxy', true);

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

app.use(express.static(publicPath));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api', router);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Everspeak Backend is running on port ${PORT}`);
  console.log(`🌐 Web UI available at ${serverUrl}`);
  console.log(`📚 Swagger Docs available at ${serverUrl}api-docs`);
});
