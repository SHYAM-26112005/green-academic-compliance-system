import { useState } from 'react';
import { Server, User, Database, Lock, AlertCircle } from 'lucide-react';

const AuthDemo = () => {
    // State for forms
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for UI feedback
    const [user, setUser] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper to reset messages
    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    // 1. Handle Registration
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            setSuccess(result.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            setUser(result.user);
            setSuccess(result.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Fetch Data
    const fetchData = async () => {
        clearMessages();
        setLoading(true);
        setData(null);

        try {
            const response = await fetch('http://localhost:5000/data');
            const result = await response.json();

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-green-900 flex items-center">
                    <Server className="mr-3" /> Backend Integration Demo
                </h1>
                <p className="text-gray-600 mt-2">
                    Demonstrating React ↔ Express communication with fetch, hooks, and error handling.
                </p>
            </header>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
                    <Lock className="mr-2" size={20} />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Authentication Forms */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                        <User className="mr-2" size={20} /> Authentication
                    </h2>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                                placeholder="test@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                                placeholder="••••••"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Login'}
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="flex-1 bg-white text-green-700 border border-green-700 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Register
                            </button>
                        </div>
                    </form>

                    {user && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Current User</p>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Data Fetching */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                        <Database className="mr-2" size={20} /> Data Fetching
                    </h2>

                    <p className="text-gray-600 mb-4">
                        Click the button below to fetch protected data from receiving endpoint <code>GET /data</code>.
                    </p>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6 disabled:opacity-50"
                    >
                        {loading ? 'Fetching...' : 'Fetch Backend Data'}
                    </button>

                    {data ? (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-green-600 font-semibold mb-2">{data.message}</p>
                            <div className="space-y-2">
                                {data.data.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                            No data fetched yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthDemo;
