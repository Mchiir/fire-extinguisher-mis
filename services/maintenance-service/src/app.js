/**
 * Express application setup for the Maintenance Service.
 * Configures middleware, routes, Swagger docs, and error handling.
 */
import express from 'express';
// import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import swaggerSpec from './swagger/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Maintenance service is running',
    data: { service: 'maintenance-service' },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/maintenance', maintenanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
