import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PromoBanners.css';

const PromoBanners = () => {
    const navigate = useNavigate();

    return (
        <section className="promo-banners">
            <div className="container">
                <div className="promo-banner-grid">
                    <div className="promo-card" style={{ backgroundImage: `url('/src/assets/images/banner1.png')` }}>
                        {/* Content removed for pure banner image */}
                    </div>
                    <div className="promo-card" style={{ backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop')` }}>
                        <div className="promo-content">
                            <span className="promo-tag">New Season</span>
                            <h2>Daily <br /> <span className="highlight">Vitality Pack</span></h2>
                            <p>Premium multivitamins for your active lifestyle.</p>
                            <button className="btn-glass" onClick={() => navigate('/category/Vitamins')}>
                                <span>Explore</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanners;
