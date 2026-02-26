import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import bannerImg from '../assets/images/banner1.png';

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            badge: 'BEST SELLER',
            title: 'Build Strength <span class="highlight">Every Day</span>',
            subtitle: 'Premium whey protein for muscle growth and recovery.',
            image: bannerImg,
            ctaPrimary: 'SHOP NOW',
            category: 'Whey Protein',
            // Using standard cover behavior as it is a banner image
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        },
        {
            id: 3,
            title: 'Subscribe & <span class="highlight">Save Bigger</span>',
            subtitle: 'Get your favorite supplements delivered monthly at discounted prices.',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
            ctaPrimary: 'Subscribe Now',
            ctaSecondary: 'How it Works',
            action: 'subscription',
            customGradient: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
            customBgPosition: 'center',
            backgroundSize: 'cover'
        }
    ];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const handleCTA = (action, category) => {
        if (action === 'subscription') {
            const el = document.querySelector('.subscription-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (category) {
            navigate(`/category/${encodeURIComponent(category)}`);
        } else {
            navigate('/search?q=');
        }
    };

    return (
        <section className="hero">
            <div className="hero-slider">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: slide.customGradient
                                ? `${slide.customGradient}, url(${slide.image})`
                                : `linear-gradient(to right, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.7) 40%, rgba(10, 10, 10, 0) 100%), url(${slide.image})`,
                            backgroundPosition: slide.customBgPosition || 'right center',
                            backgroundSize: slide.backgroundSize || 'cover'
                        }}
                    >
                        <div className="container hero-content">
                            <div className="hero-text-container">
                                {slide.badge && <span className="hero-badge animate-text">{slide.badge}</span>}
                                <h1 className="hero-title animate-text" dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
                                <p className="hero-subtitle animate-text delay-100">{slide.subtitle}</p>
                                <div className="hero-cta animate-text delay-200">
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleCTA(slide.action, slide.category)}
                                    >
                                        <span>{slide.ctaPrimary}</span>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                    </button>
                                    {slide.ctaSecondary && (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handleCTA(slide.actionSecondary || 'view-offers', slide.category)}
                                        >
                                            <span>{slide.ctaSecondary}</span>
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="slider-controls">
                <button className="control-btn prev" onClick={prevSlide}>&larr;</button>
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
                <button className="control-btn next" onClick={nextSlide}>&rarr;</button>
            </div>
        </section>
    );
};

export default Hero;
