import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is reachable!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

// Routes
app.use('/', authRoutes);
app.use('/api/reports', reportRoutes);

// Example protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Success! You have accessed a protected route.',
        user: req.user
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});