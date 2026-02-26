import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../data/productImages';
import '../styles/Wishlist.css';

const WishlistPage = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleBuyNow = (product) => {
        // Bypass cart and redirect directly to checkout with product details
        navigate('/checkout', { state: { buyNowItem: { ...product, quantity: 1 } } });
    };

    return (
        <div className="wishlist-page animate-fade-in">
            <div className="container">
                <div className="breadcrumbs">
                    <Link to="/">Home</Link> &gt; <span className="current">Wishlist</span>
                </div>

                <div className="wishlist-header">
                    <h1>My Wishlist <span className="item-count">({wishlistItems.length} items)</span></h1>
                    {wishlistItems.length > 0 && (
                        <button className="clear-all-btn" onClick={clearWishlist}>Clear All</button>
                    )}
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="wishlist-grid">
                        {wishlistItems.map((product) => (
                            <div key={product.id} className="wishlist-item card-effect">
                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromWishlist(product.id)}
                                    title="Remove from Wishlist"
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>

                                <div className="wishlist-image-container" onClick={() => navigate(`/search?q=${product.name}`)}>
                                    <img
                                        src={getProductImage(product.image, product.name)}
                                        alt={product.name}
                                        className="wishlist-image"
                                        onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Product'; }}
                                    />
                                    {product.tags && product.tags[0] && (
                                        <span className="wishlist-tag">{product.tags[0]}</span>
                                    )}
                                </div>

                                <div className="wishlist-details">
                                    <div className="wishlist-meta">
                                        <span className="wishlist-brand">{product.brand}</span>
                                        <div className="wishlist-rating">
                                            <span className="star">★</span> {product.rating}
                                        </div>
                                    </div>
                                    <h3 className="wishlist-name" onClick={() => navigate(`/search?q=${product.name}`)}>{product.name}</h3>
                                    <div className="wishlist-price-section">
                                        <span className="wishlist-current-price">₹{product.price.toLocaleString()}</span>
                                        <span className="wishlist-old-price">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
                                    </div>
                                    <div className="wishlist-actions">
                                        <button className="btn-wishlist-cart">Add to Cart</button>
                                        <button className="btn-wishlist-buy" onClick={() => handleBuyNow(product)}>Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-wishlist">
                        <div className="empty-icon">
                            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Seems like you haven't added anything to your wishlist yet.</p>
                        <Link to="/" className="btn-shop-now">Explore Products</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
