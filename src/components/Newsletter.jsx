import React from 'react';
import '../styles/Newsletter.css';

const Newsletter = () => {
    return (
        <section className="newsletter-section">
            <div className="container">
                <div className="newsletter-content">
                    <div className="newsletter-text">
                        <h2>Join the <span className="highlight">Community</span></h2>
                        <p>Subscribe to our newsletter for exclusive offers, fitness tips, and new product launches.</p>
                    </div>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email address" required />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
