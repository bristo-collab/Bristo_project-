import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Footer.css';

const Footer = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();


    // Hide Footer on Auth & Admin Pages
    if (location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/admin-login' ||
        location.pathname.startsWith('/admin-dashboard') ||
        (isAuthenticated && user?.role === 'admin')) {
        return null;
    }


    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-column brand-info">
                        <Link to="/" className="footer-brand">
                            <span className="brand-text">Health<span className="brand-accent">Kart</span></span>
                        </Link>
                        <p className="brand-desc">
                            India's leading destination for health and fitness supplements.
                            We provide authentic products from global brands to help you reach your goals.
                        </p>
                        <div className="social-links-premium">
                            <a href="#" className="social-pill" aria-label="Facebook">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                            </a>
                            <a href="#" className="social-pill" aria-label="Instagram">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10.5 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"></path></svg>
                            </a>
                            <a href="#" className="social-pill" aria-label="Twitter">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Shop Categories</h4>
                        <ul>
                            <li><Link to="/category/Proteins">Proteins</Link></li>
                            <li><Link to="/category/Gainers">Mass Gainers</Link></li>
                            <li><Link to="/category/Vitamins">Vitamins & Wellness</Link></li>
                            <li><Link to="/category/Fit Foods">Health Foods</Link></li>
                            <li><Link to="/category/Accessories">Fitness Accessories</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Customer Care</h4>
                        <ul>
                            <li><Link to="/track-order">Track Your Order</Link></li>
                            <li><a href="#">Shipping Policy</a></li>
                            <li><a href="#">Returns & Exchange</a></li>
                            <li><a href="#">Store Locator</a></li>
                            <li><a href="#">Contact Support</a></li>
                        </ul>
                    </div>

                    <div className="footer-column contact-info">
                        <h4>Get In Touch</h4>
                        <div className="contact-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>Gurugram, Haryana, India</span>
                        </div>
                        <div className="contact-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span>support@healthkart.com</span>
                        </div>
                        <div className="contact-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span>+91 123 456 7890</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-premium">
                    <p>&copy; 2024 HealthKart. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Sitemap</a>
                    </div>
                    <div className="payment-icons">
                        {/* Placeholder for payment icons */}
                        <div className="payment-pill">VISA</div>
                        <div className="payment-pill">UPI</div>
                        <div className="payment-pill">RUPAY</div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
