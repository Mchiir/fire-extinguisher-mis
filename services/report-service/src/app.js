/**
 * Express application setup for the Report Service.
 * Aggregates data from other microservices — no local database.
 */
import express from 'express';
// import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import reportRoutes from './routes/reportRoutes.js';
import swaggerSpec from './swagger/swagger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Report service is running',
    data: { service: 'report-service' },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
