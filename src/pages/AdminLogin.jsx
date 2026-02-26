import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user, isAuthenticated } = auth || {};

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Auth context loading state handling
    if (!auth || auth.loading) {
        return <div className="admin-loading">Checking authentication...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.post('/auth/signin', { emailOrPhone, password });

            if (data.user.role !== 'admin') {
                setError('Access Denied: You do not have administrator privileges.');
                setLoading(false);
                return;
            }

            login(data.user, data.token);
            navigate('/admin-dashboard', { replace: true });
        } catch (err) {
            console.error("Login API error:", err);
            setError(err.message || 'Invalid admin credentials');
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card animate-fade-in">
                <div className="login-header">
                    <div className="admin-icon">💠</div>
                    <h1>HealthKart Admin</h1>
                    <p>Secure Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && <div className="error-alert">{error}</div>}

                    <div className="form-group">
                        <label>Admin Email</label>
                        <div className="input-with-icon">
                            <span className="icon">📧</span>
                            <input
                                type="text"
                                placeholder="Enter admin email"
                                value={emailOrPhone}
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <span className="icon">🔒</span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-submit-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>

                    <div className="login-footer">
                        <button type="button" onClick={() => navigate('/')} className="back-link">
                            ← Return to Website
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
