import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import '../styles/Categories.css';

const Categories = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (title) => {
        navigate(`/category/${encodeURIComponent(title)}`);
    };

    return (
        <section className="categories-section">
            <div className="container">
                <h2 className="section-title">Shop by <span className="highlight">Category</span></h2>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="category-tile"
                            onClick={() => handleCategoryClick(category.title)}
                        >
                            <div className="category-content">
                                <div className="category-header">
                                    <h3 className="category-title">{category.title}</h3>
                                </div>
                                <div className="category-footer">
                                    <span className="shop-text">Shop Collection</span>
                                    <div className="arrow-circle">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
