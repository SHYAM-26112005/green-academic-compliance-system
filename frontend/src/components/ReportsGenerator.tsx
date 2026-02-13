import { FileDown, FileBarChart, Filter } from 'lucide-react';

const reports = [
    { id: 1, title: 'Annual Sustainability Report 2023', type: 'PDF', date: '2023-12-01', size: '2.4 MB' },
    { id: 2, title: 'Q3 Waste Management Audit', type: 'CSV', date: '2023-10-15', size: '1.1 MB' },
    { id: 3, title: 'Energy Consumption Analysis', type: 'PDF', date: '2023-09-30', size: '3.8 MB' },
    { id: 4, title: 'Water Usage Report', type: 'Excel', date: '2023-08-20', size: '900 KB' },
];

const ReportsGenerator = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generator Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 lg:col-span-1 h-fit">
                <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                    <FileBarChart className="mr-2" /> Generate Report
                </h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border">
                            <option>Sustainability Overview</option>
                            <option>Waste Management</option>
                            <option>Energy Consumption</option>
                            <option>Water Usage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border">
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                            <option>Custom Range</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="format" className="text-green-600 focus:ring-green-500" defaultChecked />
                                <span className="ml-2 text-sm text-gray-700">PDF</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="format" className="text-green-600 focus:ring-green-500" />
                                <span className="ml-2 text-sm text-gray-700">Excel</span>
                            </label>
                        </div>
                    </div>
                    <button type="button" className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition-colors font-medium">
                        Generate Report
                    </button>
                </form>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl shadow-sm border border-green-100 lg:col-span-2 overflow-hidden">
                <div className="p-6 border-b border-green-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-green-900">Recent Reports</h2>
                    <button className="text-gray-500 hover:text-green-700">
                        <Filter size={20} />
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {reports.map((report) => (
                        <div key={report.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <div className="bg-green-50 p-3 rounded-lg mr-4 text-green-700">
                                    <FileBarChart size={24} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                                    <p className="text-sm text-gray-500">{report.date} • {report.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mr-4">
                                    {report.type}
                                </span>
                                <button className="text-gray-400 hover:text-green-700 transition-colors">
                                    <FileDown size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsGenerator;
