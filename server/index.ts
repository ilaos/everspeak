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
const PORT = parseInt(process.env.PORT || '3000', 10);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Everspeak Backend API',
      version: '1.0.0',
      description: 'A professional Node.js + Express backend API with organized folder structure',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  /\.replit\.dev$/,
  /\.replit\.app$/,
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) {
      return callback(null, true);
    }
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxy for Replit deployment (enables correct IP tracking for rate limiting)
app.set('trust proxy', true);

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
// In dev: server/index.ts -> ../public
// In prod: dist/index.js -> ./public
const publicPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api', router);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Everspeak Backend is running on port ${PORT}`);
  console.log(`🌐 Web UI available at http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
