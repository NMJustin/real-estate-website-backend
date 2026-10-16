import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://ingata-real-estate.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.get('/', (_req, res) => {
	res.json({
		success: true,
		message: 'Ingata Real Estate API is running',
		health: '/api/v1/health',
	});
});

app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
