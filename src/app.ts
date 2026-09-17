import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
	res.json({
		success: true,
		message: 'Nihohange Real Estate API is running',
		health: '/api/v1/health',
	});
});

app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
