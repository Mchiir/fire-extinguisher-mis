/**
 * Express application setup for the Auth Service.
 * Configures middleware, routes, Swagger docs, and error handling.
 */
import express from 'express';
// import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import swaggerSpec from './swagger/swagger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Auth service is running', data: { service: 'auth-service' } });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
