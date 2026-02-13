import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Energy', 'Water', 'Waste', 'Carbon']
    },
    description: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        required: true,
        enum: ['Compliant', 'Non-Compliant', 'Pending']
    },
    date: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
