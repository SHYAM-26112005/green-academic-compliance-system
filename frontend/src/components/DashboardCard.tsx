import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'green' | 'blue' | 'yellow' | 'red';
}

const colorStyles = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
};

const DashboardCard = ({ title, value, icon: Icon, trend, trendUp, color = 'green' }: DashboardCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-lg", colorStyles[color])}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={clsx("text-sm font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
};

export default DashboardCard;
