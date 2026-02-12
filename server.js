import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow frontend to access backend
app.use(express.json()); // Parse JSON bodies

// Mock Database
const users = [];


// Routes



// 0.5 Compliance Reports Endpoints
const reports = [
    { id: 1, department: 'Science Block', category: 'Energy', description: 'Solar panel efficiency check', score: 95, status: 'Compliant', date: '2023-10-25' },
    { id: 2, department: 'Library', category: 'Waste', description: 'Recycling bin audit', score: 40, status: 'Non-Compliant', date: '2023-10-28' },
];

// GET /reports
app.get('/reports', (req, res) => {
    res.json(reports);
});

// POST /reports
app.post('/reports', (req, res) => {
    const { department, category, description, score, status, date } = req.body;

    if (!department || !category || !status) {
        return res.status(400).json({ error: 'Department, Category, and Status are required' });
    }

    const newReport = {
        id: Date.now(),
        department,
        category,
        description: description || '',
        score: Number(score) || 0,
        status,
        date: date || new Date().toISOString().split('T')[0]
    };

    reports.unshift(newReport);
    console.log('New Report Added:', newReport);
    res.status(201).json({ message: 'Report added successfully', report: newReport });
});

// 1. POST /register
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = { id: Date.now(), email, password };
    users.push(newUser);

    console.log('User registered:', newUser);
    res.status(201).json({ message: 'Registration successful', user: { email: newUser.email, id: newUser.id } });
});

// 2. POST /login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User logged in:', user);
    res.json({ message: 'Login successful', token: 'fake-jwt-token-123', user: { email: user.email, id: user.id } });
});

// 3. GET /data (Protected mock)
app.get('/data', (req, res) => {
    // In a real app, you would verify the token here
    res.json({
        message: 'Secure data fetched successfully',
        data: [
            { id: 1, name: 'Compliance Report A', status: 'Active' },
            { id: 2, name: 'Safety Audit', status: 'Pending' },
            { id: 3, name: 'Waste Manifest', status: 'Completed' }
        ]
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
