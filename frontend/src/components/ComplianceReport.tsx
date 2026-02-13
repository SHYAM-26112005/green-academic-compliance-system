import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface Report {
    _id?: string;
    id?: number; // Keep for compatibility if needed, but we'll use _id mostly
    department: string;
    category: 'Energy' | 'Water' | 'Waste' | 'Carbon';
    description: string;
    score: number;
    status: 'Compliant' | 'Non-Compliant' | 'Pending';
    date: string;
}

const statusColorMap = {
    'Compliant': 'bg-green-100 text-green-800 border-green-200',
    'Non-Compliant': 'bg-red-100 text-red-800 border-red-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const ComplianceReport = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        department: '',
        category: 'Energy',
        description: '',
        score: '',
        status: 'Compliant',
        date: new Date().toISOString().split('T')[0]
    });

    const API_URL = '/api/reports';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch reports');
            const data = await response.json();
            setReports(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const newReport = {
            department: formData.department,
            category: formData.category,
            description: formData.description,
            score: Number(formData.score),
            status: formData.status,
            date: formData.date
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReport),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit report');
            }

            const savedReport = await response.json();
            setReports(prev => [savedReport, ...prev]);
            setSuccess('Report successfully saved to database!');
            setShowModal(false);
            setFormData({
                department: '',
                category: 'Energy',
                description: '',
                score: '',
                status: 'Compliant',
                date: new Date().toISOString().split('T')[0]
            });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                <div className="p-6 border-b border-green-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-green-900">Compliance Audits</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm"
                    >
                        <Plus size={20} className="mr-2" /> Add New Report
                    </button>
                </div>

                {/* Messages */}
                {error && <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">{error}</div>}
                {success && <div className="p-4 bg-green-50 text-green-700 border-b border-green-100">{success}</div>}

                {/* List View */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-green-50 text-green-900">
                            <tr>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium">Score</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && reports.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No reports found in database.</td></tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id || report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{report.department}</td>
                                        <td className="px-6 py-4 text-gray-600">{report.category}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{report.description}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{report.score}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold border", statusColorMap[report.status])}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{report.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-green-50/50">
                            <h2 className="text-xl font-bold text-green-900">New Compliance Report</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600" disabled={loading}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g. Science Block"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="Energy">Energy</option>
                                        <option value="Water">Water</option>
                                        <option value="Waste">Waste</option>
                                        <option value="Carbon">Carbon</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="Compliant">Compliant</option>
                                        <option value="Non-Compliant">Non-Compliant</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    placeholder="Brief details about the audit..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                                    <input
                                        type="number"
                                        name="score"
                                        value={formData.score}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplianceReport;
