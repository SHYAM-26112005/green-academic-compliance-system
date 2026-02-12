import ReportsGenerator from '../components/ReportsGenerator';

const ReportsPage = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-green-900">Reports</h1>
                <p className="text-gray-600 mt-2">Generate and download environmental compliance reports.</p>
            </header>

            <ReportsGenerator />
        </div>
    );
};

export default ReportsPage;
