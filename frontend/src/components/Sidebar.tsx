import { Home, ClipboardCheck, FileText, Menu, X, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

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
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-600/20 text-red-100 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-all text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </button>
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
