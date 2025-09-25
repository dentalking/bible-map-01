import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import routes
import personsRouter from './routes/persons';
import locationsRouter from './routes/locations';
import eventsRouter from './routes/events';
import journeysRouter from './routes/journeys';
import themesRouter from './routes/themes';
import searchRouter from './routes/search';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'BibleMap API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      persons: '/api/persons',
      locations: '/api/locations',
      events: '/api/events',
      journeys: '/api/journeys',
      themes: '/api/themes',
      search: '/api/search'
    }
  });
});

// Mount API routes
app.use('/api/persons', personsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/journeys', journeysRouter);
app.use('/api/themes', themesRouter);
app.use('/api/search', searchRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    status: 404
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', err);

  res.status(status).json({
    error: message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;