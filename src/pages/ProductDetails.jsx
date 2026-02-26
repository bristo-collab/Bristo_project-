import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { getProductImage } from '../data/productImages';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { checkPincodeService } from '../utils/pincodeService';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart, applyPincode } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { isAuthenticated, user } = useAuth();
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', userName: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [selectedWeight, setSelectedWeight] = useState('');
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
    const [pincode, setPincode] = useState('');
    const [pincodeResult, setPincodeResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const imageRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await api.get(`/products/${productId}`);
                setProduct(data);
                setActiveImage(getProductImage(data.image, data.name));
                if (data.flavors?.length > 0) setSelectedFlavor(data.flavors[0]);
                if (data.weight) setSelectedWeight(data.weight);
            } catch (error) {
                console.error('Failed to fetch product:', error);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [productId]);

    const handleMouseMove = (e) => {
        if (!imageRef.current) return;
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    const handleMouseLeave = () => {
        setZoomPos({ ...zoomPos, show: false });
    };

    const handleAddToCart = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cartIcon = document.querySelector('.cart-trigger');

        if (cartIcon) {
            const targetRect = cartIcon.getBoundingClientRect();
            const flyer = document.createElement('div');
            flyer.className = 'flying-cart';
            flyer.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>`;

            flyer.style.left = `${rect.left + rect.width / 2}px`;
            flyer.style.top = `${rect.top}px`;
            flyer.style.setProperty('--target-x', `${targetRect.left - (rect.left + rect.width / 2)}px`);
            flyer.style.setProperty('--target-y', `${targetRect.top - rect.top}px`);

            document.body.appendChild(flyer);
            setTimeout(() => flyer.remove(), 800);
        }

        addToCart({ ...product, quantity: 1, selectedFlavor, selectedWeight });
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }

        const buyNowItem = {
            ...product,
            quantity: 1,
            selectedFlavor,
            selectedWeight
        };

        // Redirect directly to checkout with product data, bypassing cart
        navigate('/checkout', { state: { buyNowItem } });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.comment.trim() || !reviewForm.rating) return;

        const nameToUse = isAuthenticated ? user.fullName : reviewForm.userName;
        if (!nameToUse) {
            alert("Please provide your name.");
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await api.post(`/products/${productId}/reviews`, {
                userName: nameToUse,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });

            if (response.success) {
                setProduct({
                    ...product,
                    rating: response.product.rating,
                    reviews: response.product.reviews,
                    reviewItems: response.product.reviewItems
                });
                setReviewForm({ rating: 5, comment: '', userName: '' });
                alert("Review submitted successfully!");
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handlePincodeCheck = async (e) => {
        e.preventDefault();
        if (!pincode) return;

        setIsVerifying(true);
        try {
            const result = await applyPincode(pincode);
            setPincodeResult(result);
        } catch (error) {
            setPincodeResult({ success: false, error: 'Service temporarily unavailable.' });
        } finally {
            setIsVerifying(false);
        }
    };

    if (!product) return <div className="product-loading">Loading...</div>;

    return (
        <div className="product-details-page">
            <div className="container">
                <div className="breadcrumbs">
                    <Link to="/">Home</Link> &gt;
                    <Link to={`/category/${product.category}`}>{product.category}</Link> &gt;
                    <span className="current">{product.name}</span>
                </div>

                <div className="product-main-layout">
                    {/* Left: Image Gallery */}
                    <div className="product-gallery">
                        <div className="thumbnails-list">
                            {[product.image, ...Array(3).fill(product.image)].map((imgKey, idx) => (
                                <div
                                    key={idx}
                                    className={`thumb-item ${activeImage === getProductImage(imgKey, product.name) ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveImage(getProductImage(imgKey, product.name))}
                                >
                                    <img src={getProductImage(imgKey, product.name)} alt={`${product.name} thumb ${idx}`} />
                                </div>
                            ))}
                        </div>
                        <div
                            className="main-image-container"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            ref={imageRef}
                        >
                            <img src={activeImage} alt={product.name} className="main-product-img" />
                            {zoomPos.show && (
                                <div
                                    className="zoom-lens"
                                    style={{
                                        backgroundImage: `url(${activeImage})`,
                                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-info-section">
                        <div className="info-header">
                            <Link to={`/brand/${product.brand}`} className="brand-link">{product.brand}</Link>
                            <h1 className="product-title">{product.name}</h1>
                            <div className="rating-row">
                                <div className="stars">★ {product.rating}</div>
                                <div className="reviews-count">{product.reviews} reviews</div>
                                <div className="verified-badge">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    100% Authentic
                                </div>
                            </div>
                        </div>

                        <div className="price-container">
                            <span className="current-price">₹{product.price.toLocaleString()}</span>
                            <span className="old-price">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
                            <span className="discount-tag">20% OFF</span>
                        </div>

                        <div className="product-options luxury-options">
                            {product.flavors?.length > 0 && (
                                <div className="option-group">
                                    <label className="luxury-label">Flavor Profile</label>
                                    <div className="flavor-pills">
                                        {product.flavors.map(flavor => (
                                            <button
                                                key={flavor}
                                                className={`option-pill luxury-pill ${selectedFlavor === flavor ? 'active' : ''}`}
                                                onClick={() => setSelectedFlavor(flavor)}
                                            >
                                                {flavor}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.weight && (
                                <div className="option-group">
                                    <label className="luxury-label">Available Size</label>
                                    <div className="weight-pills">
                                        <button className="option-pill luxury-pill active">{product.weight}</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Luxury Offers Section */}
                        <div className="luxury-offers-section scale-in">
                            <h4 className="luxury-small-title">Exclusive Store Offers</h4>
                            <div className="offer-cards-grid">
                                <div className="offer-card premium-offer-card">
                                    <div className="offer-icon">💎</div>
                                    <div className="offer-details">
                                        <p className="offer-code">LUXE200</p>
                                        <p className="offer-text">Flat ₹200 off on first premium order</p>
                                    </div>
                                </div>
                                <div className="offer-card premium-offer-card">
                                    <div className="offer-icon">🎁</div>
                                    <div className="offer-details">
                                        <p className="offer-code">FREEGIFT</p>
                                        <p className="offer-text">Free shaker on orders above ₹2999</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="product-actions-sticky luxury-actions-group">
                            <button className="luxury-btn add-to-cart-luxury" onClick={handleAddToCart}>
                                <div className="btn-content">
                                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>Add To Cart</span>
                                </div>
                                <div className="btn-glow"></div>
                            </button>

                            <button className="luxury-btn buy-now-luxury" onClick={handleBuyNow}>
                                <div className="btn-content">
                                    <span>Buy Now</span>
                                </div>
                                <div className="btn-glow"></div>
                            </button>

                            <button
                                className={`luxury-wishlist-btn-icon ${isInWishlist(product._id) ? 'active' : ''}`}
                                onClick={() => toggleWishlist(product)}
                                title="Add to Wishlist"
                            >
                                <svg width="26" height="26" fill={isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Delivery & Trust Module */}
                        <div className="luxury-trust-module card-effect">
                            <div className="delivery-pincode-section">
                                <label className="luxury-label-small">Check Delivery Availability</label>
                                <form className="pincode-input-group" onSubmit={handlePincodeCheck}>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit Pin Code"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button className="pincode-btn" type="submit" disabled={isVerifying}>
                                        {isVerifying ? 'Checking...' : 'Check'}
                                    </button>
                                </form>

                                {pincodeResult && (
                                    <div className={`pincode-status-msg animate-fade-in ${pincodeResult.success ? 'success' : 'error'}`}>
                                        {pincodeResult.success ? (
                                            <div className="status-content">
                                                <div className="status-main">
                                                    <span className="icon">🚚</span>
                                                    <span>Delivery by <strong>{pincodeResult.deliveryDate}</strong></span>
                                                </div>
                                                <div className="status-extra">
                                                    <span className={pincodeResult.shipping === 0 ? 'free' : ''}>
                                                        {pincodeResult.shipping === 0 ? 'Free Shipping' : `Shipping: ₹${pincodeResult.shipping}`}
                                                    </span>
                                                    <span className="dot">•</span>
                                                    <span>{pincodeResult.cod ? 'COD Available' : 'No COD Available'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="status-error">
                                                <span className="icon">❌</span>
                                                <span>{pincodeResult.error}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!pincodeResult && <p className="delivery-hint">Enter your pin code to see delivery availability and charges.</p>}
                            </div>

                            <div className="trust-badges-row">
                                <div className="trust-mini-badge">
                                    <span className="badge-icon">⭐</span>
                                    <span>Authentic</span>
                                </div>
                                <div className="trust-mini-badge">
                                    <span className="badge-icon">🔄</span>
                                    <span>Returnable</span>
                                </div>
                                <div className="trust-mini-badge">
                                    <span className="badge-icon">📦</span>
                                    <span>Secured</span>
                                </div>
                            </div>
                        </div>

                        <div className="product-description-tabs luxury-tabs-section">
                            <h3 className="luxury-section-title">Product Experience</h3>
                            <p className="luxury-desc-text">
                                {product.name} is engineered for peak performance.
                                Utilizing high-purity ingredients and a proprietary formulation,
                                this supplement delivers unmatched bioavailability.
                                Elevate your fitness regime with clinical-grade results and professional support.
                            </p>
                        </div>

                        {/* Reviews Section */}
                        <div className="product-reviews-section luxury-tabs-section">
                            <h3 className="luxury-section-title">Customer Reviews</h3>

                            <div className="reviews-summary-card card-effect">
                                <div className="avg-rating-box">
                                    <span className="big-rating">{product.rating || 0}</span>
                                    <div className="stars-v2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="total-reviews-hint">Based on {product.reviews || 0} reviews</p>
                                </div>
                            </div>

                            <div className="add-review-form card-effect">
                                <h4>Share your experience</h4>
                                {isAuthenticated ? (
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="rating-input">
                                            <span>Rating: </span>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`star-input ${i < reviewForm.rating ? 'active' : ''}`}
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                                >★</span>
                                            ))}
                                        </div>
                                        {!isAuthenticated && (
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                value={reviewForm.userName}
                                                onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                                                required
                                                className="review-name-input"
                                            />
                                        )}
                                        <textarea
                                            placeholder="Write your review here..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            required
                                        ></textarea>
                                        <button type="submit" className="luxury-btn btn-sm" disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Post Review'}
                                        </button>
                                    </form>
                                ) : (
                                    <p className="login-to-review">Please <Link to="/login" state={{ from: location }}>log in</Link> to share your experience.</p>
                                )}
                            </div>

                            <div className="reviews-list">
                                {product.reviewItems?.length > 0 ? (
                                    product.reviewItems.map((review, idx) => (
                                        <div key={idx} className="review-item-card">
                                            <div className="review-meta">
                                                <span className="reviewer-name">{review.userName}</span>
                                                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                                                ))}
                                            </div>
                                            <p className="review-comment">{review.comment}</p>
                                        </div>
                                    )).reverse() // Show newest first
                                ) : (
                                    <p className="no-reviews-msg">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
