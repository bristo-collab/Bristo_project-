import React from 'react';
import { brands } from '../data/brands';
import '../styles/Brands.css';

const Brands = () => {
    const popularBrands = brands.filter(b => b.popular);

    return (
        <section className="brands-section animate-fade-in">
            <div className="container">
                <div className="brands-header">
                    <h2 className="section-title">Trusted <span className="highlight">Global Brands</span></h2>
                    <p className="section-subtitle">Authentic supplements from the world's most trusted manufacturers.</p>
                </div>

                <div className="brands-grid">
                    {popularBrands.map((brand) => (
                        <div
                            key={brand.id}
                            className="brand-card"
                        // Navigation disabled for premium layout
                        >
                            <div className="brand-logo-container">
                                <img
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    className="brand-logo-img"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Brands;
