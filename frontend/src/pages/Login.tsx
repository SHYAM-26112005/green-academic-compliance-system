import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create/Select a project and go to APIs & Services > Credentials
// 3. Create an OAuth 2.0 Client ID for a "Web application"
// 4. IMPORTANT: Add Authorized JavaScript Origin: http://localhost:5175
// 5. Paste the Client ID below OR better yet, in d:\green-academic-compilance-3\frontend\.env
const getClientId = () => {
  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envId && envId !== "YOUR_GOOGLE_CLIENT_ID_HERE" && envId !== "PASTE_YOUR_REAL_GOOGLE_CLIENT_ID_HERE") {
    return envId;
  }
  return "304464803223-5mdbj0kqjooh423h4mclrqh9ra2gfpm9.apps.googleusercontent.com";
};

const clientId = getClientId();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Empty string means use relative path


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (clientId === "PASTE_YOUR_REAL_GOOGLE_CLIENT_ID_HERE" || !clientId) {
      console.warn("Google Client ID is missing or using placeholder. Google Login will fail with 401 error.");
    }
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).message) {
      setInfoMessage((location.state as any).message);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Unable to connect to backend. Please ensure the backend server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      // Use the login function from AuthContext
      login(data.token, data.user);

      navigate('/dashboard');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Connection failed. Please ensure the backend server is running and accessible.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setInfoMessage(data.message);
      setIsResetting(false);
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Unable to connect to backend.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google login failed.');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isResetting ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isResetting ? 'Enter your details to change password' : 'Sign in to your account'}
          </p>
        </div>

        {infoMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center text-center">
            {error}
          </div>
        )}

        {!isResetting ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => setIsResetting(false)}
                className="w-full bg-white text-gray-600 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {!isResetting && (
          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log("Login Success:", credentialResponse);
                    handleGoogleSuccess(credentialResponse);
                  }}
                  onError={() => {
                    console.log("Login Failed");
                    setError('Google sign-in was unsuccessful.');
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
