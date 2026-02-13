import { FileText, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const Dashboard = () => {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-green-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of academic environmental compliance.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Reports"
                    value="12"
                    icon={FileText}
                    trend="+2 this month"
                    trendUp={true}
                    color="blue"
                />
                <DashboardCard
                    title="Compliant Items"
                    value="85%"
                    icon={CheckCircle}
                    trend="+5%"
                    trendUp={true}
                    color="green"
                />
                <DashboardCard
                    title="Pending Reviews"
                    value="4"
                    icon={AlertTriangle}
                    trend="-1"
                    trendUp={true}
                    color="yellow"
                />
                <DashboardCard
                    title="Energy Saved"
                    value="12%"
                    icon={TrendingUp}
                    trend="vs last year"
                    trendUp={true}
                    color="green"
                />
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-green-500 bg-green-50/50">
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">New Compliance Report Generated</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trends</h3>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        Chart Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
