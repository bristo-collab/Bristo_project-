import React from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import '../styles/FitnessTips.css';

const FitnessTips = () => {
    return (
        <section className="tips-section">
            <div className="container">
                <h2 className="section-title">Fitness <span className="highlight">Insights</span></h2>
                <div className="tips-grid">
                    {articles.map((tip) => (
                        <div key={tip.id} className="tip-card card-effect">
                            <div className="tip-image-container">
                                <img src={tip.image} alt={tip.title} className="tip-image" />
                                <span className="tip-category">{tip.category}</span>
                            </div>
                            <div className="tip-content">
                                <h3 className="tip-title">{tip.title}</h3>
                                <p className="tip-desc">{tip.desc}</p>
                                <Link to={`/article/${tip.id}`} className="read-more">Read Full Article &rarr;</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FitnessTips;
