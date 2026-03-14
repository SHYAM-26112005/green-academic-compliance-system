import { useEffect, useState, useMemo } from 'react';
import { FileText, CheckCircle, AlertTriangle, Loader2, RefreshCw, X, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';

interface Report {
    _id: string;
    department: string;
    category: string;
    description: string;
    score: number;
    status: string;
    date: string;
    createdAt: string;
}

const Dashboard = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const API = import.meta.env.VITE_API_BASE_URL;
    const API_URL = `${API}/api/reports`;

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if backend is running first
            const pingURL = `${API}/ping`;
            const isBackendUp = await fetch(pingURL)
                .then(res => res.ok)
                .catch(() => false);

            if (!isBackendUp) {
                throw new Error('Backend server not reachable. Make sure the backend is running.');
            }

            const response = await fetch(API_URL);

            // Safe JSON parsing: check content-type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. Please ensure your backend is correctly serving the API.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch reports from the database.');
            }

            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while connecting to the backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const stats = useMemo(() => {
        const total = reports.length;
        const compliant = reports.filter(r => r.status === 'Compliant').length;
        const pending = reports.filter(r => r.status === 'Pending').length;
        const energyReports = reports.filter(r => r.category === 'Energy');

        const energyScore = energyReports.length > 0
            ? (energyReports.reduce((acc, r) => acc + r.score, 0) / energyReports.length).toFixed(1)
            : 0;

        return {
            total,
            compliantRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
            pending,
            energyScore
        };
    }, [reports]);

    const recentActivity = useMemo(() => {
        return [...reports]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [reports]);

    const chartData = useMemo(() => {
        const monthlyData: Record<string, { total: number; count: number }> = {};

        reports.forEach(report => {
            const date = new Date(report.date || report.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { total: 0, count: 0 };
            }
            monthlyData[month].total += report.score;
            monthlyData[month].count += 1;
        });

        return Object.keys(monthlyData).map(month => ({
            name: month,
            score: Math.round(monthlyData[month].total / monthlyData[month].count)
        }));
    }, [reports]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                <p className="text-gray-600 animate-pulse font-medium">Connecting to backend...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-red-100 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto my-12">
                <div className="bg-red-50 p-4 rounded-full">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Unavailable</h2>
                    <p className="text-gray-600 font-medium">{error}</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="relative flex items-center justify-center w-full py-2">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-4xl font-black text-green-950 tracking-tight">System Dashboard</h1>
                    <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live compliance monitoring
                    </p>
                </div>
                <button
                    onClick={fetchReports}
                    className="absolute right-0 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                    title="Refresh Data"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Total Reports"
                    value={stats.total.toString()}
                    icon={FileText}
                    trend="Reports in database"
                    trendUp={true}
                    color="blue"
                />
                <DashboardCard
                    title="Compliance Rate"
                    value={`${stats.compliantRate}%`}
                    icon={CheckCircle}
                    trend="Target is 100%"
                    trendUp={stats.compliantRate > 80}
                    color="green"
                />
                <DashboardCard
                    title="Pending Reviews"
                    value={stats.pending.toString()}
                    icon={AlertTriangle}
                    trend="Needs attention"
                    trendUp={false}
                    color="yellow"
                />
            </div>

            {/* Recent Activity / Visualizations */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            Real-time
                        </span>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((report) => (
                                <div
                                    key={report._id}
                                    onClick={() => setSelectedReport(report)}
                                    className="group flex items-start p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200 bg-white shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                        <FileText className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-gray-900">
                                                New Compliance Report Generated
                                            </p>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {report.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Department: <span className="text-gray-700 font-semibold">{report.department}</span>
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No activity reported yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Compliance Score Trend</h3>
                    <div className="h-72">
                        {reports.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#065f46', fontWeight: 800 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 600 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        dot={{ fill: '#10b981', strokeWidth: 3, r: 6, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                                Insufficient data for trends
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Detail Modal */}
            {selectedReport && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="relative h-32 bg-gradient-to-br from-green-600 to-green-800 p-6 flex items-end">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight leading-none">Report Details</h3>
                                    <p className="text-green-100 text-sm mt-1 font-medium opacity-90">{selectedReport.category} Compliance</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedReport.department}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full animate-pulse ${
                                            selectedReport.status === 'Compliant' ? 'bg-green-500' :
                                            selectedReport.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                        <p className="text-lg font-bold text-gray-900">{selectedReport.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between border border-gray-100">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compliance Score</p>
                                    <p className="text-3xl font-black text-green-700">{selectedReport.score}<span className="text-sm font-bold text-gray-400 ml-1">/100</span></p>
                                </div>
                                <div className="w-16 h-16 relative">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="32" cy="32" r="28"
                                            fill="none" strokeWidth="8"
                                            className="stroke-gray-200"
                                        />
                                        <circle
                                            cx="32" cy="32" r="28"
                                            fill="none" strokeWidth="8"
                                            strokeDasharray={`${(selectedReport.score / 100) * 176} 176`}
                                            className="stroke-green-600"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                <div className="bg-white border-2 border-gray-50 rounded-2xl p-4 text-gray-600 italic leading-relaxed shadow-sm">
                                    "{selectedReport.description || 'No detailed description provided for this audit report.'}"
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between text-gray-400">
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(selectedReport.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded">ID: {selectedReport._id.slice(-6)}</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-6 flex justify-end">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
