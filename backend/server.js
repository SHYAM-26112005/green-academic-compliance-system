import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import generatedReportRoutes from './routes/generatedReportRoutes.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL // Production frontend URL
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.endsWith('.render.com')) {
            return callback(null, true);
        }
        return callback(null, true); // For now, allowing all during setup, but keeping logic
    },
    credentials: true
}));
app.use(express.json());

// Test Route
app.get('/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is reachable!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

// Routes
app.use('/', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/generated-reports', generatedReportRoutes);

// Example protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Success! You have accessed a protected route.',
        user: req.user
    });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
});