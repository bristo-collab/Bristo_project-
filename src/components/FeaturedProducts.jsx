import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getProductImage } from '../data/productImages';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import '../styles/FeaturedProducts.css';

const FeaturedProducts = () => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    const [allProducts, setAllProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.get('/products');
                setAllProducts(data);
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Get products for featured section - limited to 12 (3 rows)
    const featuredProducts = allProducts
        .filter(p => p.isActive !== false) // Only active products
        .slice(0, 12);

    const handleBuyNow = (product) => {
        // Bypass cart and redirect directly to checkout with product details
        navigate('/checkout', { state: { buyNowItem: { ...product, quantity: 1 } } });
    };

    const handleWishlistClick = (e, product) => {
        // ... (existing code for wishlist animation)
        const isAdding = !isInWishlist(product._id);
        const btn = e.currentTarget;

        if (isAdding) {
            // Heart Pop Animation
            btn.classList.add('heart-pop');
            setTimeout(() => btn.classList.remove('heart-pop'), 400);

            // Fly to Nav Animation
            const rect = btn.getBoundingClientRect();
            const wishlistIcon = document.querySelector('.wishlist-trigger');

            if (wishlistIcon) {
                const targetRect = wishlistIcon.getBoundingClientRect();

                const flyer = document.createElement('div');
                flyer.className = 'flying-heart';
                flyer.innerHTML = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;

                flyer.style.left = `${rect.left}px`;
                flyer.style.top = `${rect.top}px`;
                flyer.style.setProperty('--target-x', `${targetRect.left - rect.left}px`);
                flyer.style.setProperty('--target-y', `${targetRect.top - rect.top}px`);

                document.body.appendChild(flyer);
                setTimeout(() => flyer.remove(), 800);
            }
        }

        toggleWishlist(product);
    };

    const handleAddToCart = (e, product) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
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

        addToCart(product);
    };


    return (
        <section className="featured-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Trending <span className="highlight">Now</span></h2>
                    <a href="/search" className="view-all-btn">View All Products</a>
                </div>

                <div className="products-grid">
                    {loading ? (
                        <div className="loading-state">Loading featured products...</div>
                    ) : featuredProducts.map((product) => (
                        <div key={product._id} className="product-card">
                            {product.tags && product.tags[0] && (
                                <span className={`product-tag tag-${product.tags[0].toLowerCase().replace(' ', '-')}`}>
                                    {product.tags[0]}
                                </span>
                            )}
                            <div className="product-image-container">
                                <Link to={`/product/${product._id}`}>
                                    <img
                                        src={getProductImage(product.image, product.name)}
                                        alt={product.name}
                                        className="product-image"
                                        loading="lazy"
                                        onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=Product'; }}
                                    />
                                </Link>
                                <button
                                    className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                                    onClick={(e) => handleWishlistClick(e, product)}
                                    title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    <svg width="20" height="20" fill={isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="product-details">
                                <div className="product-meta">
                                    <div className="product-rating">
                                        <span className="star">★</span> {product.rating} <span className="reviews">({product.reviews})</span>
                                    </div>
                                    <span className={`stock-status ${!product.stock ? 'low-stock' : ''}`}>
                                        {product.stock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <h3 className="product-name">
                                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                                </h3>
                                <div className="product-price">
                                    <span className="current-price">₹{product.price.toLocaleString()}</span>
                                    <span className="old-price">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
                                </div>

                                <div className="product-actions">
                                    <button className="btn-action btn-cart" onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                                    <button className="btn-action btn-buy" onClick={() => handleBuyNow(product)}>Buy Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
