import express from 'express';
import Report from '../models/Report.js';

const router = express.Router();

// GET all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
});

// POST a new report
router.post('/', async (req, res) => {
    try {
        const { department, category, description, score, status, date } = req.body;

        const newReport = new Report({
            department,
            category,
            description,
            score,
            status,
            date
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: 'Error saving report', error: error.message });
    }
});

export default router;
