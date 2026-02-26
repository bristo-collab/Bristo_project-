import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../data/productImages';
import '../styles/CartPage.css';

const CartPage = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingFee,
        totalAmount,
        deliveryEstimate,
        subscriptionDiscount,
        isSubscriptionInCart
    } = useCart();
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleClearCart = () => {
        clearCart();
        setShowClearConfirm(false);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page empty">
                <div className="container">
                    <div className="empty-cart-content animate-fade-in">
                        <div className="empty-cart-icon">
                            <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                        <h1>Your cart is empty</h1>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Shopping Cart <span className="item-count">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span></h1>
                </div>

                <div className="cart-layout">
                    {/* Cart Items List */}
                    <div className="cart-items-section">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-card card-effect">
                                <div className="item-image">
                                    <img
                                        src={getProductImage(item.image, item.name)}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Product'; }}
                                    />
                                </div>

                                <div className="item-details">
                                    <div className="item-main-info">
                                        <div className="item-title-row">
                                            <h3 className="item-name">{item.name}</h3>
                                            {item.isSubscription && <span className="sub-badge">Subscription</span>}
                                        </div>
                                        {item.brand && <p className="item-brand">{item.brand}</p>}
                                        <div className="item-meta">
                                            {item.weight && <span className="meta-tag">{item.weight}</span>}
                                            {item.flavors?.[0] && <span className="meta-tag">{item.flavors[0]}</span>}
                                            {item.frequency && <span className="meta-tag frequency-tag">📅 {item.frequency}</span>}
                                        </div>
                                    </div>

                                    <div className="item-controls">
                                        <div className="quantity-picker">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                            >−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >+</button>
                                        </div>

                                        <div className="item-pricing">
                                            <div className="item-price">₹{item.price.toLocaleString()}</div>
                                            <div className="item-subtotal">₹{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>

                                        <button className="remove-item-btn" onClick={() => removeFromCart(item.id)} title="Remove item">
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="order-summary-sidebar">
                        <div className="summary-card card-effect">
                            <h3>Order Summary</h3>
                            <div className="summary-divider"></div>

                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className={shippingFee === 0 ? 'free-shipping' : ''}>
                                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                                    </span>
                                </div>
                                {isSubscriptionInCart && (
                                    <div className="summary-row discount">
                                        <span>Subscription Discount (10%)</span>
                                        <span className="discount-value">- ₹{subscriptionDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                {deliveryEstimate && (
                                    <div className="summary-row estimate">
                                        <span>Estimated Delivery</span>
                                        <span className="estimate-date">{deliveryEstimate}</span>
                                    </div>
                                )}
                                {shippingFee > 0 && subtotal < 500 && (
                                    <p className="shipping-hint">Free shipping on orders above ₹500</p>
                                )}
                            </div>

                            <div className="summary-total">
                                <div className="total-label">Total Amount</div>
                                <div className="total-value">₹{totalAmount.toLocaleString()}</div>
                            </div>

                            {isSubscriptionInCart && (
                                <div className="subscription-savings-msg">
                                    🎉 You're saving <strong>₹{subscriptionDiscount.toLocaleString()}</strong> with HK Pro!
                                </div>
                            )}

                            <button className="checkout-cta-btn" onClick={handleCheckout}>
                                Proceed to Checkout
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </button>

                            <div className="trust-badges">
                                <div className="trust-badge">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.9L9.033 1.5a2 2 0 011.934 0l6.866 3.4A2 2 0 0119 6.691V12c0 5.105-3.328 9.176-7.79 10.33a2 2 0 01-1.012 0C5.736 21.176 2.408 17.105 2.408 12V6.691a2 2 0 011.166-1.791zM10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L10 10.586z" clipRule="evenodd"></path>
                                    </svg>
                                    100% Secure Payments
                                </div>
                                <div className="trust-badge">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h3.05a2.5 2.5 0 014.9 0H20V10l-3.33-3h-2.67z"></path>
                                    </svg>
                                    Fast Delivery
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Cart Action Footer */}
                <div className="cart-footer-actions">
                    <button
                        className="clear-cart-btn"
                        onClick={() => setShowClearConfirm(true)}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Clear Cart
                    </button>
                </div>

                {/* Confirmation Modal */}
                {showClearConfirm && (
                    <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                        <div className="confirm-modal animate-pop-in" onClick={e => e.stopPropagation()}>
                            <h3>Clear Cart?</h3>
                            <p>Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                                <button className="modal-btn confirm" onClick={handleClearCart}>Yes, Clear All</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
