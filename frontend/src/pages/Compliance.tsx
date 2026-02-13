import ComplianceReport from '../components/ComplianceReport';

const CompliancePage = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-green-900">Compliance Tracking</h1>
                <p className="text-gray-600 mt-2">Manage and track environmental compliance requirements for your institution.</p>
            </header>

            <ComplianceReport />
        </div>
    );
};

export default CompliancePage;
