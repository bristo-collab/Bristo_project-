import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { brands } from '../data/brands';
import { getProductImage } from '../data/productImages';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import '../styles/BrandPage.css';
import '../styles/SearchResults.css'; // For common layout elements

const BrandPage = () => {
    const { brandName } = useParams();
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Decode (e.g. MuscleBlaze)
    const decodedBrandName = decodeURIComponent(brandName);

    // Get brand metadata
    const brandData = brands.find(b => b.name === decodedBrandName) || { name: decodedBrandName };

    // State
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedFlavors, setSelectedFlavors] = useState([]);
    const [priceRange, setPriceRange] = useState(10000);
    const [sortBy, setSortBy] = useState('relevance');

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await api.get('/products');
                setAllProducts(data);
                console.log('✅ BrandPage: Loaded', data.length, 'products from API');
            } catch (error) {
                console.error('❌ BrandPage: Failed to fetch products:', error);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Get products for this brand
    const baseProducts = allProducts.filter(p => p.brand === decodedBrandName && p.isActive !== false);

    // Extract Filters from brand-specific products
    const categories = [...new Set(baseProducts.map(p => p.category))];
    const flavors = [...new Set(baseProducts.flatMap(p => p.flavors || []))];

    useEffect(() => {
        if (loading) return;

        let results = baseProducts.filter(product => {
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price <= priceRange;
            const matchesFlavor = selectedFlavors.length === 0 ||
                (product.flavors && product.flavors.some(f => selectedFlavors.includes(f)));

            return matchesCategory && matchesPrice && matchesFlavor;
        });

        if (sortBy === 'price-low') {
            results.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            results.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        }

        setFilteredProducts(results);
    }, [brandName, selectedCategories, selectedFlavors, priceRange, sortBy, allProducts, loading]);

    const toggleFilter = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleBuyNow = (product) => {
        // Bypass cart and redirect directly to checkout with product details
        navigate('/checkout', { state: { buyNowItem: { ...product, quantity: 1 } } });
    };

    const handleWishlistClick = (e, product) => {
        const isAdding = !isInWishlist(product._id);
        const btn = e.currentTarget;

        if (isAdding) {
            btn.classList.add('heart-pop');
            setTimeout(() => btn.classList.remove('heart-pop'), 400);

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
        <div className="brand-page">
            {/* Brand Hero Section */}
            <section className="brand-hero">
                <img
                    src={brandData.banner || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'}
                    alt={brandData.name}
                    className="brand-banner-img"
                />
                <div className="brand-hero-overlay">
                    <div className="brand-hero-content animate-fade-in">
                        <div className="brand-logo-circle">
                            {brandData.logoPath ? (
                                <img src={brandData.logoPath} alt={brandData.name} />
                            ) : (
                                <span className="brand-logo-text">{brandData.logo || brandData.name.substring(0, 2)}</span>
                            )}
                        </div>
                        <div className="brand-text-content">
                            <h1 className="brand-title">{brandData.name}</h1>
                            <p className="brand-description">
                                Discover premium health and fitness supplements from {brandData.name}. Trusted by athletes worldwide for quality and performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/">Home</Link> &gt; <span>Brands</span> &gt; <span className="current">{decodedBrandName}</span>
                </div>

                <div className="search-layout">
                    {/* Sidebar Filter */}
                    <aside className="filters-sidebar card-effect">
                        <div className="filter-group">
                            <h3>Filters</h3>
                            <div className="filter-divider"></div>
                        </div>

                        <div className="filter-group">
                            <h4>Price Range</h4>
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="price-slider"
                            />
                            <div className="price-display">Up to ₹{priceRange.toLocaleString()}</div>
                        </div>

                        {categories.length > 0 && (
                            <div className="filter-group">
                                <h4>Categories</h4>
                                {categories.map(cat => (
                                    <label key={cat} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        )}

                        {flavors.length > 0 && (
                            <div className="filter-group">
                                <h4>Flavors</h4>
                                {flavors.map(flavor => (
                                    <label key={flavor} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedFlavors.includes(flavor)}
                                            onChange={() => toggleFilter(flavor, selectedFlavors, setSelectedFlavors)}
                                        />
                                        {flavor}
                                    </label>
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* Main Results Area */}
                    <main className="search-results">
                        <div className="results-header">
                            <div className="results-title-row">
                                <h2 className="listing-title">Products <span className="product-count">({filteredProducts.length} items)</span></h2>
                            </div>
                            <div className="sort-controls">
                                <span>Sort By: </span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="relevance">Relevance</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Rating</option>
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="premium-product-card animate-scale-in">
                                        {product.stock === false && <span className="stock-badge out-of-stock">Out of Stock</span>}
                                        {product.tags && product.tags.length > 0 && <span className="premium-badge">{product.tags[0]}</span>}

                                        <div className="premium-img-container">
                                            <Link to={`/product/${product._id}`}>
                                                <img
                                                    src={getProductImage(product.image, product.name)}
                                                    alt={product.name}
                                                    className="premium-product-image"
                                                    loading="lazy"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Product'; }}
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

                                        <div className="premium-details">
                                            <div className="premium-rating">
                                                <span className="star">★</span> {product.rating}
                                                <span className="reviews-count" style={{ color: '#999', fontSize: '0.8rem' }}>({product.reviews})</span>
                                            </div>
                                            <h3 className="premium-product-name">{product.name}</h3>

                                            <div className="product-info-tags">
                                                {product.weight && <span className="info-tag">{product.weight}</span>}
                                                {product.flavors && product.flavors[0] && <span className="info-tag">{product.flavors[0]}</span>}
                                            </div>

                                            <div className="premium-price-row">
                                                <span className="premium-current-price">₹{product.price.toLocaleString()}</span>
                                            </div>

                                            <div className="premium-actions">
                                                <button className="btn-premium btn-add-cart" onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                                                <button className="btn-premium btn-buy-now" onClick={() => handleBuyNow(product)}>Buy Now</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results-found card-effect">
                                <h3>No products found for this brand.</h3>
                                <p>Try different filters or browse other brands.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrandPage;
