import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articles } from '../data/articles';
import { ArrowLeft, Clock, User, Tag, Share2 } from 'lucide-react';
import '../styles/ArticleDetail.css';

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = articles.find(a => a.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!article) {
        return (
            <div className="article-not-found">
                <div className="container">
                    <h2>Article Not Found</h2>
                    <p>The article you are looking for does not exist or has been moved.</p>
                    <Link to="/" className="back-btn">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="article-detail-page">
            <div className="article-hero" style={{ backgroundImage: `url(${article.image})` }}>
                <div className="article-hero-overlay"></div>
                <div className="container">
                    <div className="article-hero-content">
                        <Link to="/" className="back-link">
                            <ArrowLeft size={20} /> Back to Insights
                        </Link>
                        <div className="article-meta-top">
                            <span className="article-category-tag">{article.category}</span>
                            <span className="article-date"><Clock size={16} /> {article.date}</span>
                        </div>
                        <h1 className="article-title-main">{article.title}</h1>
                        <div className="article-author-info">
                            <div className="author-avatar">{article.author.charAt(0)}</div>
                            <span className="author-name">By {article.author}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="article-body-section">
                <div className="container">
                    <div className="article-container-inner">
                        <div className="article-main-content">
                            <div
                                className="article-text-content"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />

                            <div className="article-footer-actions">
                                <div className="article-tags">
                                    <span className="tag-label"><Tag size={16} /> Tags:</span>
                                    <span className="tag-item">Fitness</span>
                                    <span className="tag-item">Wellness</span>
                                    <span className="tag-item">{article.category}</span>
                                </div>
                                <button className="share-article-btn">
                                    <Share2 size={18} /> Share Article
                                </button>
                            </div>
                        </div>

                        <aside className="article-sidebar">
                            <div className="sidebar-card newsletter-signup">
                                <h3>Stay Updated</h3>
                                <p>Get the latest fitness insights delivered to your inbox weekly.</p>
                                <form className="sidebar-form">
                                    <input type="email" placeholder="Your email address" />
                                    <button type="submit">Subscribe</button>
                                </form>
                            </div>

                            <div className="sidebar-card related-articles">
                                <h3>Related Reads</h3>
                                <div className="related-list">
                                    {articles.filter(a => a.id !== article.id).slice(0, 2).map(item => (
                                        <Link key={item.id} to={`/article/${item.id}`} className="related-item">
                                            <div className="related-img">
                                                <img src={item.image} alt={item.title} />
                                            </div>
                                            <div className="related-info">
                                                <h4>{item.title}</h4>
                                                <span>{item.category}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetail;
