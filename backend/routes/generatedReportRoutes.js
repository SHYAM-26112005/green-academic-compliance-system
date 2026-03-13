import express from 'express';
import GeneratedReport from '../models/GeneratedReport.js';

const router = express.Router();

// GET all generated reports
router.get('/', async (req, res) => {
    try {
        const reports = await GeneratedReport.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching generated reports', error: error.message });
    }
});

// POST a new generated report record
router.post('/', async (req, res) => {
    try {
        const { name, type, reportType, dateRange, size, date } = req.body;

        const newReport = new GeneratedReport({
            name,
            type,
            reportType,
            dateRange,
            size,
            date
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: 'Error saving report record', error: error.message });
    }
});

// DELETE a generated report record
router.delete('/:id', async (req, res) => {
    try {
        const deletedReport = await GeneratedReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report record not found' });
        }
        res.status(200).json({ message: 'Report record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report record', error: error.message });
    }
});

export default router;
