import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CompliancePage from './pages/Compliance';
import ReportsPage from './pages/Reports';
import AuthDemo from './pages/AuthDemo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="auth-demo" element={<AuthDemo />} />
        <Route path="*" element={<div className="p-8">404: Page Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
