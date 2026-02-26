import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/SignUp.css';

const SignUp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();

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
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [userId, setUserId] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Block non-numeric characters
            if (/\D/.test(value)) return;
            // Block extra digits (max 10)
            if (value.length > 10) return;

            setFormData({ ...formData, [name]: value });

            // Real-time validation
            if (value.length > 0 && value.length !== 10) {
                setErrors((prev) => ({ ...prev, phone: "Phone number must be exactly 10 digits" }));
            } else {
                setErrors((prev) => ({ ...prev, phone: "" }));
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
        if (!formData.fullName) tempErrors.fullName = "Full Name is required";
        if (!formData.email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email is invalid";
        if (!formData.phone) tempErrors.phone = "Phone is required";
        else if (formData.phone.length !== 10) tempErrors.phone = "Phone number must be exactly 10 digits";
        if (!formData.password) tempErrors.password = "Password is required";
        else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
        if (formData.confirmPassword !== formData.password) tempErrors.confirmPassword = "Passwords do not match";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await api.post('/auth/signup', {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
                });

                if (response.userId) {
                    setUserId(response.userId);
                    setShowOTP(true);
                    alert(`OTP sent! (Check Backend Console for code: ${response.devOtp})`);
                }
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 4) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');

        try {
            const response = await api.post('/auth/verify-otp', {
                userId: userId,
                otp: otpValue
            });

            if (response.success) {
                alert("Sign Up Successful! Please login to continue.");

                // Redirect to Login, but pass the 'from' state so Login knows where to go next
                const from = location.state?.from || '/';
                navigate('/login', { state: { from } });
            }
        } catch (error) {
            alert(error.message);
            setOtp(['', '', '', '', '']);
            setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-wrapper">
                <div className="signup-visual">
                    <div className="visual-content">
                        <h2>Start Your <br /> Journey.</h2>
                        <p>Join the community of fitness enthusiasts and achieve your goals.</p>
                    </div>
                    <div className="visual-overlay"></div>
                </div>

                <div className="signup-form-section">
                    <div className="signup-container animate-fade-in">
                        <h2 className="signup-title">Create Account</h2>
                        <p className="signup-subtitle">Join HealthKart for exclusive offers</p>

                        {!showOTP ? (
                            <form onSubmit={handleSendOTP} className="signup-form">
                                <div className="form-group animate-slide-up delay-100">
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={errors.fullName ? 'error-input' : ''}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                                </div>

                                <div className="form-group animate-slide-up delay-100">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">✉</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error-input' : ''}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-group animate-slide-up delay-200">
                                    <label>Phone Number</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📱</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? 'error-input' : ''}
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>

                                <div className="form-row animate-slide-up delay-200">
                                    <div className="form-group">
                                        <label>Password</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔒</span>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={errors.password ? 'error-input' : ''}
                                                placeholder="******"
                                            />
                                        </div>
                                        {errors.password && <span className="error-text">{errors.password}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔒</span>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={errors.confirmPassword ? 'error-input' : ''}
                                                placeholder="******"
                                            />
                                        </div>
                                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                                    </div>
                                </div>

                                <div className="form-checkbox animate-slide-up delay-300">
                                    <input type="checkbox" id="terms" required />
                                    <label htmlFor="terms">I agree to the <a href="#">Terms & Conditions</a></label>
                                </div>

                                <button type="submit" className="btn-submit animate-slide-up delay-300">Continue to Verify</button>

                                <p className="login-link animate-slide-up delay-300">Already have an account? <Link to="/login">Login</Link></p>
                            </form>
                        ) : (
                            <div className="otp-container animate-fade-in">
                                <h3>Verify Mobile Number</h3>
                                <p>Enter the 5-digit code sent to +91 {formData.phone}</p>

                                <div className="otp-inputs">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                        />
                                    ))}
                                </div>

                                <button onClick={handleSubmit} className="btn-submit">Verify & Sign Up</button>
                                <button onClick={() => setShowOTP(false)} className="btn-link">Change Number</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
