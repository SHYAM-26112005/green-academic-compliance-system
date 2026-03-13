import { useEffect, useState, useMemo } from 'react';
import { FileText, CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if backend is running first
            const isBackendUp = await fetch(`${API_BASE_URL.replace('/api', '')}/ping`)
                .then(res => res.ok)
                .catch(() => false);

            if (!isBackendUp) {
                throw new Error('Backend server not reachable. Make sure the backend is running.');
            }

            const response = await fetch(`${API_BASE_URL}/reports`);

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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-green-950 tracking-tight">System Dashboard</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live compliance monitoring
                    </p>
                </div>
                <button
                    onClick={fetchReports}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
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
                                <div key={report._id} className="group flex items-start p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200 bg-white shadow-sm hover:shadow-md">
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
                                        <p className="text-xs text-gray-500 mt-1">
                                            Department: <span className="text-gray-700 font-semibold">{report.department}</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                            {new Date(report.createdAt).toLocaleString()}
                                        </p>
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
        </div>
    );
};

export default Dashboard;
