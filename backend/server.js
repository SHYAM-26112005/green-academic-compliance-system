import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET || !MONGO_URI) {
    console.error('FATAL ERROR: JWT_SECRET or MONGO_URI is not defined in .env');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: true, // Allow any origin to connect (useful for cross-device testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connectivity Ping
app.get('/ping', (req, res) => res.json({ status: 'ok', message: 'Backend is reachable!' }));

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('   Make sure your MongoDB server is running on port 27017.');
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB runtime error:', err);
});

// Middleware to check DB connection
const dbCheck = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database is not connected. Please ensure MongoDB is running on port 27017.'
        });
    }
    next();
};

app.use(dbCheck);

// Routes
app.use('/', authRoutes);
app.use('/api/reports', reportRoutes);

// Example protected route for demonstration
import { authenticateToken } from './middleware/auth.js';
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Success! You have accessed a protected route.', user: req.user });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📡 Local:            http://localhost:${PORT}`);
    console.log(`🌐 Network:          http://<your-ip>:${PORT}`);
    console.log(`💡 Tip: Use 'ipconfig' to find your local IP address`);
});
