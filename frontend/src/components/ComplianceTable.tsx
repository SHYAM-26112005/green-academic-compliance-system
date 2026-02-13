import { MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

const complianceData = [
    { id: 1, category: 'Waste Management', item: 'Hazardous Waste Disposal', status: 'Compliant', date: '2023-10-15', auditor: 'Jane Doe' },
    { id: 2, category: 'Energy', item: 'Solar Panel Maintenance', status: 'Pending Review', date: '2023-10-20', auditor: 'John Smith' },
    { id: 3, category: 'Water', item: 'Water Quality Testing', status: 'Non-Compliant', date: '2023-10-12', auditor: 'Jane Doe' },
    { id: 4, category: 'Air', item: 'Air Quality Monitoring', status: 'Compliant', date: '2023-10-18', auditor: 'Mike Johnson' },
    { id: 5, category: 'Safety', item: 'Fire Extinguisher Check', status: 'Compliant', date: '2023-10-01', auditor: 'Sarah Wilson' },
];

const statusStyles = {
    'Compliant': 'bg-green-100 text-green-800',
    'Non-Compliant': 'bg-red-100 text-red-800',
    'Pending Review': 'bg-yellow-100 text-yellow-800',
};

const ComplianceTable = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <div className="p-6 border-b border-green-50 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-green-900">Compliance Records</h2>
                <button className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                    Add New Record
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-green-50 text-green-900">
                        <tr>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Compliance Item</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Last Audit</th>
                            <th className="px-6 py-4 font-medium">Auditor</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {complianceData.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-700">{record.category}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{record.item}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-3 py-1 rounded-full text-sm font-medium", statusStyles[record.status as keyof typeof statusStyles])}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{record.date}</td>
                                <td className="px-6 py-4 text-gray-600">{record.auditor}</td>
                                <td className="px-6 py-4 text-gray-400 cursor-pointer hover:text-green-700">
                                    <MoreHorizontal size={20} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComplianceTable;
