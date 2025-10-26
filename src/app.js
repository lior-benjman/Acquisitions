import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';
import usersRoutes from '#routes/users.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(publicDir));

app.use(
    morgan('combined', {
        stream: { write: message => logger.info(message.trim()) },
    })
);

app.get('/', (req, res) => {
    logger.info('Serving DevOps blog homepage');
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/sign-in', (req, res) => {
    res.sendFile(path.join(publicDir, 'signin.html'));
});

app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(publicDir, 'signup.html'));
});

app.use('/api', securityMiddleware);

app.get('/health', (req, res) => {
    res
        .status(200)
        .json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
});

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Acquisitions API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

export default app;
