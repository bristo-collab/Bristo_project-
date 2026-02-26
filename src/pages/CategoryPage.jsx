import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getProductImage } from '../data/productImages';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import '../styles/SearchResults.css'; // Reusing Search Styles for consistency

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Decode slug (e.g. Whey%20Protein -> Whey Protein)
    const categoryName = decodeURIComponent(categorySlug);

    // Filter Logic State
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedFlavors, setSelectedFlavors] = useState([]);
    const [priceRange, setPriceRange] = useState(10000);
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const data = await api.get('/products');
                setAllProducts(data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    // Get products for this category (broad match: exact category OR sub-category logic if we had it)
    const baseProducts = allProducts.filter(p => {
        const targetCategory = categoryName.toLowerCase();
        const pCategory = p.category?.toLowerCase() || '';
        const pSubCategory = p.subCategory?.toLowerCase() || '';
        const pName = p.name.toLowerCase();

        return (
            pSubCategory === targetCategory || // exact sub-category match
            pCategory === targetCategory || // exact category match
            pCategory.includes(targetCategory) || // "Proteins" includes "Protein"
            targetCategory.includes(pCategory) || // "Whey Protein" includes "Protein"
            targetCategory.includes(pCategory) || // "Whey Protein" includes "Protein"
            pName.includes(targetCategory) // fallback to name search
        ) && (p.isActive !== false); // Filter inactive
    });

    // Extract Filters
    const brands = [...new Set(baseProducts.map(p => p.brand))];
    const flavors = [...new Set(baseProducts.flatMap(p => p.flavors || []))];

    useEffect(() => {
        if (loading) return;

        let results = baseProducts.filter(product => {
            // Brand Filter
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

            // Price Filter
            const matchesPrice = product.price <= priceRange;

            // Flavor Filter
            const matchesFlavor = selectedFlavors.length === 0 ||
                (product.flavors && product.flavors.some(f => selectedFlavors.includes(f)));

            return matchesBrand && matchesPrice && matchesFlavor;
        });

        // Sorting
        if (sortBy === 'price-low') {
            results.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            results.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        }

        setFilteredProducts(results);
    }, [categorySlug, selectedBrands, selectedFlavors, priceRange, sortBy, allProducts, loading]);

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
        <div className="search-page">
            <div className="container">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/">Home</Link> &gt; <span>Category</span> &gt; <span className="current">{categoryName}</span>
                </div>

                <div className="search-layout">
                    {/* Sidebar Filter */}
                    <aside className="filters-sidebar">
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
                            <div className="price-display">Up to ₹{priceRange}</div>
                        </div>

                        {brands.length > 0 && (
                            <div className="filter-group">
                                <h4>Brands</h4>
                                {brands.map(brand => (
                                    <label key={brand} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                                        />
                                        {brand}
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
                            <h1>{categoryName} <span className="product-count">({filteredProducts.length} items)</span></h1>
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

                        {loading ? (
                            <div className="loading-state">Loading products...</div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="product-card">
                                        {product.stock === false && <span className="stock-badge out-of-stock">Out of Stock</span>}
                                        {product.tags && product.tags.length > 0 && <span className="product-tag">{product.tags[0]}</span>}

                                        <div className="product-image-container">
                                            <Link to={`/product/${product._id}`}>
                                                <img
                                                    src={getProductImage(product.image, product.name)}
                                                    alt={product.name}
                                                    className="product-image"
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

                                        <div className="product-details">
                                            <div className="product-meta">
                                                <div className="product-rating">
                                                    <span className="star">★</span> {product.rating} <span className="reviews">({product.reviews})</span>
                                                </div>
                                            </div>
                                            <h3 className="product-name">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h3>
                                            <div className="product-info-tags">
                                                {product.weight && <span className="info-tag">{product.weight}</span>}
                                                {product.flavors && product.flavors[0] && <span className="info-tag">{product.flavors[0]}</span>}
                                            </div>
                                            <div className="product-price">
                                                <span className="current-price">₹{product.price.toLocaleString()}</span>
                                            </div>

                                            <div className="product-actions">
                                                <button className="btn-action btn-cart" onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                                                <button className="btn-action btn-buy" onClick={() => handleBuyNow(product)}>Buy Now</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results-found">
                                <h3>No products found in this category.</h3>
                                <p>Try different filters or browse other categories.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
