import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import paymentRoutes from './routes/paymentRoutes';
import webhookRoutes from './routes/webhookRoutes';
import websiteRoutes from './routes/websiteRoutes';
import logRoutes from './routes/logRoutes';
import adminRoutes from './routes/adminRoutes';
import { startLeadWorker } from './config/queue';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Connect to Database
const startServer = async () => {
    try {
        await connectDB();

        // Start Background Worker
        startLeadWorker();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error: any) {
        console.error('CRITICAL: Server failed to start:', error.message);
        process.exit(1);
    }
};

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000'
];

// Security Middleware (CORS should be early)
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false, // Less restrictive for development
}));
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5000 // Further increased to handle recovery from infinite loop
});
app.use('/api/', limiter);

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get('/', (req, res) => {
    res.send('SaaS Automation Backend Running...');
});

// Start Server at the very end
startServer();
