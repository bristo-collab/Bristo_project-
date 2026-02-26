import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { categories as staticCategories } from '../data/categories';
import { brands } from '../data/brands';
import { getProductImage } from '../data/productImages';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { wishlistCount } = useWishlist();
    const { cartCount } = useCart();
    const [prevCartCount, setPrevCartCount] = useState(cartCount);
    const [isCartBouncing, setIsCartBouncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Products State
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Menu States
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [showBrandMenu, setShowBrandMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Brand Search
    const [brandSearchQuery, setBrandSearchQuery] = useState('');

    // Refs for click-outside detection
    const searchRef = useRef(null);
    const megaMenuRef = useRef(null);
    const megaMenuTriggerRef = useRef(null);
    const brandMenuRef = useRef(null);
    const brandTriggerRef = useRef(null);
    const profileMenuRef = useRef(null);
    const profileTriggerRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    // Hide Navbar on Auth & Admin Pages
    if (location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/admin-login' ||
        location.pathname.startsWith('/admin-dashboard') ||
        (isAuthenticated && user?.role === 'admin')) {
        return null;
    }

    // Fetch products from API on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsLoading(true);
                const data = await api.get('/products');
                setProducts(data);
                console.log('✅ Navbar: Loaded', data.length, 'products from API');
            } catch (error) {
                console.error('❌ Navbar: Failed to fetch products:', error);
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Dynamic Categories Logic
    const dynamicCategories = useMemo(() => {
        const mergedCategories = JSON.parse(JSON.stringify(staticCategories)); // Deep clone
        const existingItems = new Set(mergedCategories.flatMap(c => c.items.map(i => i.toLowerCase())));
        const existingTitles = new Set(mergedCategories.map(c => c.title.toLowerCase()));

        const newItems = new Set();

        products.forEach(p => {
            if (p.category) {
                const cat = p.category.trim();
                const catLower = cat.toLowerCase();

                // If the category is NOT in existing items AND NOT a group title (approx)
                if (!existingItems.has(catLower) && !existingTitles.has(catLower)) {
                    newItems.add(cat);
                }
            }
        });

        if (newItems.size > 0) {
            mergedCategories.push({
                id: 99,
                title: 'More',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
                items: Array.from(newItems).sort()
            });
        }

        return mergedCategories;
    }, [products]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Search Suggestions
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }

            // Brand Menu
            if (
                showBrandMenu &&
                brandMenuRef.current &&
                !brandMenuRef.current.contains(event.target) &&
                !brandTriggerRef.current.contains(event.target)
            ) {
                setShowBrandMenu(false);
                setBrandSearchQuery('');
            }

            // Categories Menu
            if (
                showMegaMenu &&
                megaMenuRef.current &&
                !megaMenuRef.current.contains(event.target) &&
                !megaMenuTriggerRef.current.contains(event.target)
            ) {
                setShowMegaMenu(false);
            }

            // Profile Menu
            if (
                showProfileMenu &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target) &&
                !profileTriggerRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBrandMenu, showMegaMenu]);

    // Cart Bounce Effect
    useEffect(() => {
        if (cartCount > prevCartCount) {
            setIsCartBouncing(true);
            const timer = setTimeout(() => setIsCartBouncing(false), 400);
            setPrevCartCount(cartCount);
            return () => clearTimeout(timer);
        }
        setPrevCartCount(cartCount);
    }, [cartCount]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0 && products.length > 0) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
                (product.brand && product.brand.toLowerCase().includes(query.toLowerCase()))
            );
            setSuggestions(filtered.slice(0, 8)); // Slightly more suggestions
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);

        if (!searchQuery.trim()) return;

        // Try to find a direct match (case-insensitive)
        const directMatch = products.find(p =>
            p.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

        if (directMatch) {
            navigate(`/product/${directMatch._id}`);
            setSearchQuery(''); // Clear search on success
        } else {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSuggestionClick = (productName) => {
        setSearchQuery(productName);
        setShowSuggestions(false);
        navigate(`/search?q=${productName}`);
    };

    // Filter Brands
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );

    const popularBrands = brands.filter(b => b.popular);

    const toggleBrandMenu = () => {
        setShowBrandMenu(!showBrandMenu);
        setShowMegaMenu(false); // Close other menus
    };

    const toggleMegaMenu = () => {
        setShowMegaMenu(!showMegaMenu);
        setShowBrandMenu(false);
        setShowProfileMenu(false);
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
        setShowMegaMenu(false);
        setShowBrandMenu(false);
    };

    const handleLogout = () => {
        logout();
        setShowProfileMenu(false);
        navigate('/login');
    };

    // Grouping brands by letter for easier scanning
    const groupedBrands = brands.reduce((acc, brand) => {
        const letter = brand.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(brand);
        return acc;
    }, {});

    const alphabet = Object.keys(groupedBrands).sort();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                {/* Left Section: Logo & Primary Nav */}
                <div className="navbar-left">
                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <Link to="/" className="navbar-brand">
                        <span className="brand-text">Health<span className="brand-accent">Kart</span></span>
                    </Link>

                    <div className="navbar-links-wrapper">
                        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                            <div className="nav-item mega-menu-trigger">
                                <span onClick={toggleMegaMenu} ref={megaMenuTriggerRef} className={`nav-link ${showMegaMenu ? 'active-menu' : ''}`}>
                                    Categories
                                    <svg className={`chevron ${showMegaMenu ? 'active' : ''}`} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                            </div>

                            <div className="nav-item mega-menu-trigger">
                                <span onClick={toggleBrandMenu} ref={brandTriggerRef} className={`nav-link ${showBrandMenu ? 'active-menu' : ''}`}>
                                    Brands
                                    <svg className={`chevron ${showBrandMenu ? 'active' : ''}`} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                            </div>

                            <Link to="/offers" className="nav-item">Offers</Link>
                            <Link to="/my-subscriptions" className="nav-item highlight-nav">HK Pro</Link>
                        </div>
                    </div>
                </div>

                <div className="navbar-search-container" ref={searchRef}>
                    <form className="navbar-search" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search for products, brands or categories..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                        />
                        <button type="submit" className="search-btn">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </form>

                    {showSuggestions && (
                        <div className="search-suggestions animate-fade-in">
                            {suggestions.length > 0 ? (
                                <ul>
                                    {suggestions.map((product) => (
                                        <li key={product.id} onClick={() => handleSuggestionClick(product.name)}>
                                            <div className="suggestion-item">
                                                <div className="suggestion-image-container">
                                                    <img
                                                        src={getProductImage(product.image, product.name)}
                                                        alt={product.name}
                                                        className="suggestion-image"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=HP'; }}
                                                    />
                                                </div>
                                                <div className="suggestion-info">
                                                    <span className="suggestion-name">{product.name}</span>
                                                    <span className="suggestion-meta">in {product.category}</span>
                                                </div>
                                                <span className="suggestion-price">₹{product.price.toLocaleString()}</span>
                                            </div>
                                        </li>
                                    ))}
                                    <li className="view-all-results" onClick={handleSearchSubmit}>
                                        View all results for "{searchQuery}"
                                    </li>
                                </ul>
                            ) : (
                                <div className="no-results">
                                    <p>No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="navbar-right">
                    <div className="action-icons">
                        {(!isAuthenticated || user?.role !== 'admin') && (
                            <>
                                <Link to="/my-orders" className="nav-icon-btn" title="Track & Manage Orders">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                    </svg>
                                </Link>

                                <Link to="/wishlist" className="nav-icon-btn wishlist-trigger" title="Wishlist">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
                                </Link>

                                <Link to="/cart" className={`nav-icon-btn cart-trigger ${isCartBouncing ? 'cart-bounce' : ''}`} title="Cart">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                    {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                                </Link>
                            </>
                        )}

                        <div className="nav-profile-section">
                            {isAuthenticated ? (
                                <>
                                    <button
                                        onClick={toggleProfileMenu}
                                        ref={profileTriggerRef}
                                        className={`nav-icon-btn profile-trigger ${showProfileMenu ? 'active' : ''}`}
                                        title="Profile"
                                    >
                                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </button>

                                    {showProfileMenu && (
                                        <div className="profile-dropdown animate-fade-in" ref={profileMenuRef}>
                                            <div className="dropdown-header">
                                                <p className="user-name">{user?.fullName || 'User'}</p>
                                                <p className="user-email">{user?.email || user?.phone}</p>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            {user?.role === 'admin' && (
                                                <Link to="/admin-dashboard" className="dropdown-item admin-link" onClick={() => setShowProfileMenu(false)}>
                                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link to="/my-account" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                My Account
                                            </Link>
                                            <Link to="/my-orders" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                Orders
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                            <button onClick={handleLogout} className="dropdown-item logout-btn">
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link to="/login" className="nav-icon-btn profile-trigger" title="Profile">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mega Menus (Rendered outside to avoid layout shifts) */}
                {(showMegaMenu || mobileMenuOpen) && (
                    <div className="mega-menu animate-fade-in" ref={megaMenuRef}>
                        {dynamicCategories.map((category) => (
                            <div key={category.id} className="mega-menu-category card-effect">
                                <div className="mega-menu-header">
                                    <span className="mega-menu-title">{category.title}</span>
                                </div>
                                <ul className="mega-menu-list">
                                    {category.items.map((item, idx) => (
                                        <li key={idx} onClick={() => {
                                            navigate(`/category/${encodeURIComponent(item)}`);
                                            setMobileMenuOpen(false);
                                            setShowMegaMenu(false);
                                        }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {(showBrandMenu || mobileMenuOpen) && (
                    <div className="mega-menu brand-menu-refined animate-fade-in" ref={brandMenuRef}>
                        <div className="brand-menu-header">
                            <div className="header-text">
                                <h3 className="mega-menu-title">Brands</h3>
                                <p className="mega-menu-subtitle">Explore 100+ Premium Health Brands</p>
                            </div>
                            <div className="brand-search-wrapper-top">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    type="text"
                                    placeholder="Search brands..."
                                    value={brandSearchQuery}
                                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                                    className="brand-menu-search"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="brand-explore-container">
                            <div className="brand-grid-header">
                                <h4 className="section-subtitle">A-Z Directory</h4>
                            </div>
                            <div className="brand-dense-grid">
                                {alphabet.map(letter => {
                                    const brandsInGroup = groupedBrands[letter].filter(b =>
                                        b.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
                                    );

                                    if (brandsInGroup.length === 0) return null;

                                    return (
                                        <React.Fragment key={letter}>
                                            <div className="grid-letter-marker">{letter}</div>
                                            {brandsInGroup.map(brand => (
                                                <div
                                                    key={brand.id}
                                                    className="brand-grid-item"
                                                    onClick={() => {
                                                        navigate(`/brand/${encodeURIComponent(brand.name)}`);
                                                        setMobileMenuOpen(false);
                                                        setShowBrandMenu(false);
                                                    }}
                                                >
                                                    {brand.name}
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="brand-featured-divider"></div>

                        <div className="popular-brands-row">
                            <h4 className="section-subtitle">Popular Now</h4>
                            <div className="popular-brands-pills">
                                {popularBrands.map(brand => (
                                    <div key={brand.id} className="popular-pill" onClick={() => {
                                        navigate(`/brand/${encodeURIComponent(brand.name)}`);
                                        setMobileMenuOpen(false);
                                        setShowBrandMenu(false);
                                    }}>
                                        {brand.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
