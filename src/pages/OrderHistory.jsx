import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../data/productImages';
import '../styles/OrderHistory.css';

const OrderHistory = () => {
    const { orders, cancelOrder } = useOrders();
    const { addToCart } = useCart();
    const [expandedOrder, setExpandedOrder] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReorder = (item) => {
        addToCart(item);
    };

    const toggleTrack = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    return (
        <div className="order-history-page">
            <div className="container">
                <header className="page-header">
                    <h1>My Orders</h1>
                    <p>Manage and track your recent purchases</p>
                </header>

                <div className="orders-container">
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.orderId} className="order-card-wrapper animate-fade-in">
                                <div className="order-card-header">
                                    <div className="header-main">
                                        <div className="order-id-block">
                                            <span className="label">ORDER ID</span>
                                            <span className="value">#{order.orderId}</span>
                                        </div>
                                        <div className="order-date-block">
                                            <span className="label">PLACED ON</span>
                                            <span className="value">{formatDate(order.orderDate)}</span>
                                        </div>
                                    </div>
                                    <div className="header-meta">
                                        <div className="order-total-block">
                                            <span className="label">TOTAL</span>
                                            <span className="value">₹{order.total.toLocaleString()}</span>
                                        </div>
                                        <span className={`status-pill ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="item-thumbnail">
                                                <img src={getProductImage(item.image, item.name)} alt={item.name} />
                                            </div>
                                            <div className="item-info">
                                                <div className="item-main">
                                                    <h4>{item.name}</h4>
                                                    <p>Qty: {item.quantity} • {order.paymentMethod === 'online' ? 'Prepaid' : 'COD'}</p>
                                                </div>
                                                <div className="item-actions">
                                                    <button
                                                        className="reorder-btn"
                                                        onClick={() => handleReorder(item)}
                                                        disabled={order.status === 'Cancelled'}
                                                    >
                                                        Reorder
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="shipping-address-summary">
                                        <p><strong>Deliver to:</strong> {order.billingInfo.fullName}, {order.billingInfo.city}</p>
                                    </div>
                                    <div className="order-footer-actions">
                                        {/* Cancellation Logic: Only if status is Processing or Packed (not Shipped/Delivered) */}
                                        {(order.status === 'Processing' || order.status === 'Packed') && (
                                            <button
                                                className="footer-btn secondary cancel-btn"
                                                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to cancel this order?')) {
                                                        cancelOrder(order.orderId);
                                                    }
                                                }}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        <button className="footer-btn secondary" onClick={() => alert('Invoice downloading...')}>
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Invoice
                                        </button>
                                        <button
                                            className={`footer-btn primary ${expandedOrder === order.orderId ? 'active' : ''}`}
                                            onClick={() => toggleTrack(order.orderId)}
                                            disabled={order.status === 'Cancelled'}
                                        >
                                            Track Order
                                        </button>
                                    </div>
                                </div>

                                {expandedOrder === order.orderId && (
                                    <div className="tracking-section animate-slide-down">
                                        <div className="tracking-stepper">
                                            {order.tracking.stages.map((stage, idx) => (
                                                <div key={stage} className={`track-step ${idx < order.tracking.currentStage ? 'completed' : ''} ${idx === order.tracking.currentStage ? 'active' : ''}`}>
                                                    <div className="step-circle">{idx < order.tracking.currentStage ? '✓' : idx + 1}</div>
                                                    <span className="step-label">{stage}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.isSubscription && (
                                            <div className="sub-renewal-hint">
                                                💡 This is part of a recurring plan. <a href="/my-subscriptions">Manage renewals here</a>.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-orders-state">
                            <div className="empty-icon">🛍️</div>
                            <h2>No orders yet!</h2>
                            <p>Once you place an order, it will appear here.</p>
                            <a href="/" className="start-shopping-btn">Start Shopping</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
