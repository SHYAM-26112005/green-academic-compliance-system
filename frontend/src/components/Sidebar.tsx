import { Home, ClipboardCheck, FileText, Menu, X, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'Compliance', icon: ClipboardCheck, path: '/compliance' },
        { name: 'Reports', icon: FileText, path: '/reports' },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const handleUnlinkGoogleAccount = async () => {
        if (!window.confirm("Are you sure you want to unlink your Google account? Your data will remain intact, but you will need to log in with an email and password from now on.")) {
            return;
        }
        
        try {
            const userStr = localStorage.getItem('user');
            
            if (!userStr) {
                alert("User session not found. Please log in again.");
                return;
            }
            
            const user = JSON.parse(userStr);
            
            const API = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${API}/remove-google-account`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            });
            
            if (response.ok) {
                alert("Google account successfully unlinked!\\n\\nNOTE: If you originally created this account using Google Sign-In, please click 'Forgot Password?' on the login screen to set up a new password for your email address.");
                logout();
                navigate('/login');
                setIsOpen(false);
            } else {
                const data = await response.json();
                alert(data.error || "Failed to unlink Google account.");
            }
        } catch (error) {
            console.error("Error unlinking account:", error);
            alert("An error occurred while unlinking your account.");
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md"
                onClick={toggleSidebar}
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-green-900 text-white transition-transform transform md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-center h-16 border-b border-green-800">
                    <h1 className="text-xl font-bold tracking-wider">GreenComp</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center px-4 py-3 rounded-lg transition-colors duration-200",
                                    isActive
                                        ? "bg-green-700 text-white shadow-lg"
                                        : "text-green-100 hover:bg-green-800 hover:text-white"
                                )
                            }
                            onClick={() => setIsOpen(false)} // Close on navigate (mobile)
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-green-800 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-green-300">&copy; 2026 GreenComp</p>
                    </div>

                    {token && (
                        <div className="space-y-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-2 bg-red-600/20 text-red-100 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-all text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                            <button
                                onClick={handleUnlinkGoogleAccount}
                                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white border border-red-700 rounded-lg hover:bg-red-700 transition-all text-xs font-medium"
                            >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete Account
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
