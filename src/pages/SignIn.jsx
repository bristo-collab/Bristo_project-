import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Smartphone, Chrome } from 'lucide-react';
import '../styles/SignIn.css';

const SignIn = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isPhone, setIsPhone] = useState(false);

    // Auto-redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'emailOrPhone') {
            // Check if input is purely numeric
            const isNumeric = /^\d*$/.test(value);
            setIsPhone(isNumeric && value.length > 0);

            if (isNumeric) {
                // If it's numeric, enforce max 10 digits
                if (value.length > 10) return;

                setFormData({ ...formData, [name]: value });

                // Real-time phone validation
                if (value.length > 0 && value.length !== 10) {
                    setErrors((prev) => ({ ...prev, emailOrPhone: "Phone number must be exactly 10 digits" }));
                } else {
                    setErrors((prev) => ({ ...prev, emailOrPhone: "" }));
                }
            } else {
                // It's likely an email, allow standard input
                setFormData({ ...formData, [name]: value });
                setErrors((prev) => ({ ...prev, emailOrPhone: "" }));
            }
        } else {
            setFormData({ ...formData, [name]: value });
            if (errors[name]) {
                setErrors({ ...errors, [name]: '' });
            }
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.emailOrPhone) tempErrors.emailOrPhone = "Email or Phone is required";
        if (!formData.password) tempErrors.password = "Password is required";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await api.post('/auth/signin', {
                    emailOrPhone: formData.emailOrPhone,
                    password: formData.password
                });

                if (response.token) {
                    if (response.user.role === 'admin') {
                        login(response.user, response.token);
                        navigate('/admin-dashboard', { replace: true });
                        return;
                    }

                    console.log("Login successful:", response.user);
                    login(response.user, response.token);
                    navigate('/', { replace: true });
                }
            } catch (error) {
                setErrors({
                    ...errors,
                    password: error.message || "Invalid credentials"
                });
            }
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-wrapper">
                <div className="signin-visual">
                    <div className="visual-content">
                        <h2>Unlock Your <br /> Potential.</h2>
                        <p>Join thousands of athletes achieving their dreams with HealthKart.</p>
                    </div>
                    <div className="visual-overlay"></div>
                </div>

                <div className="signin-form-section">
                    <div className="signin-container animate-fade-in">
                        <div className="signin-header">
                            <h2 className="signin-title">Welcome Back</h2>
                            <p className="signin-subtitle">Please sign in to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="signin-form">
                            <div className="form-group animate-slide-up delay-100">
                                <label>Email or Mobile Number</label>
                                <div className={`input-wrapper ${errors.emailOrPhone ? 'error-border' : ''}`}>
                                    <span className="input-icon">
                                        {isPhone ? <Smartphone size={20} /> : <Mail size={20} />}
                                    </span>
                                    <input
                                        type="text"
                                        name="emailOrPhone"
                                        value={formData.emailOrPhone}
                                        onChange={handleChange}
                                        placeholder="Enter email or mobile"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.emailOrPhone && <span className="error-text">{errors.emailOrPhone}</span>}
                            </div>

                            <div className="form-group animate-slide-up delay-200">
                                <label>Password</label>
                                <div className={`input-wrapper ${errors.password ? 'error-border' : ''}`}>
                                    <span className="input-icon">
                                        <Lock size={20} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <span className="error-text">{errors.password}</span>}
                            </div>

                            <div className="form-options animate-slide-up delay-300">
                                <label className="remember-me">
                                    <input type="checkbox" id="remember" />
                                    <span className="checkmark"></span>
                                    <span className="remember-text">Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>

                            <button type="submit" className="btn-submit animate-slide-up delay-300">
                                Sign In
                            </button>

                            <div className="divider animate-slide-up delay-300">
                                <span>OR CONTINUE WITH</span>
                            </div>

                            <div className="social-login animate-slide-up delay-300">
                                <button type="button" className="social-btn google-btn">
                                    <span className="social-icon">G</span>
                                </button>
                                <button type="button" className="social-btn facebook-btn">
                                    <span className="social-icon">f</span>
                                </button>
                            </div>

                            <p className="signup-link animate-slide-up delay-300">Don't have an account? <Link to="/signup">Sign Up</Link></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
