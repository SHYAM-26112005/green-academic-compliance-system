import mongoose from 'mongoose';

const generatedReportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PDF', 'Excel', 'CSV']
    },
    reportType: {
        type: String,
        required: true
    },
    dateRange: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const GeneratedReport = mongoose.model('GeneratedReport', generatedReportSchema);

export default GeneratedReport;
