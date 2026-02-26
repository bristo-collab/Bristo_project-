import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    ArrowLeft,
    ShoppingBag,
    PackageCheck,
    Truck,
    CheckCircle,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText,
    RefreshCcw,
    AlertTriangle
} from 'lucide-react';
import { getProductImage } from '../data/productImages';
import '../styles/AdminTables.css';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/orders/${id}`);
            setOrder(data);
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Order not found or access denied.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        try {
            await api.patch(`/admin/orders/${id}/status`, { status });
            fetchOrderDetails();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status');
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'Processing': return 1;
            case 'Packed': return 2;
            case 'Shipped': return 3;
            case 'Delivered': return 4;
            default: return 0;
        }
    };

    if (loading) {
        return (
            <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ color: 'var(--admin-text-secondary)' }}>Loading Order Details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="admin-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <AlertTriangle size={48} color="#ef4444" />
                <h2>Order Not Found</h2>
                <p style={{ color: 'var(--admin-text-secondary)' }}>The order you are looking for does not exist or has been removed.</p>
                <button onClick={() => navigate('/admin-dashboard/orders')} className="action-btn btn-secondary">
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="admin-page animate-fade-in">
            <header className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/admin-dashboard/orders')} className="icon-btn" title="Back">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1>Order #{order.orderId}</h1>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                            Placed on {new Date(order.orderDate).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="status-selector"
                        style={{ height: '42px', padding: '0 16px', borderRadius: '12px' }}
                    >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </header>

            <div className="admin-table-wrapper" style={{ padding: '32px' }}>
                {/* Timeline */}
                <div className="fulfillment-timeline" style={{ marginBottom: '48px' }}>
                    {[
                        { step: 1, label: 'Ordered', icon: <ShoppingBag size={18} /> },
                        { step: 2, label: 'Packed', icon: <PackageCheck size={18} /> },
                        { step: 3, label: 'Shipped', icon: <Truck size={18} /> },
                        { step: 4, label: 'Delivered', icon: <CheckCircle size={18} /> }
                    ].map((step) => (
                        <div key={step.step} className={`timeline-step ${getStatusStep(order.status) >= step.step ? 'active' : ''}`}>
                            <div className="step-icon">{step.icon}</div>
                            <span>{step.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Left Column: Items */}
                    <div className="order-items-section">
                        <h3 style={{ marginBottom: '16px', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Items Found</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 0 }}>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th style={{ textAlign: 'right', paddingRight: 0 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {item.image && (
                                                    <img
                                                        src={getProductImage(item.image, item.name)}
                                                        alt={item.name}
                                                        style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '4px' }}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                                                    {(item.selectedFlavor || item.selectedWeight) && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                                                            {item.selectedFlavor} {item.selectedWeight && `• ${item.selectedWeight}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>₹{item.price.toLocaleString()}</td>
                                        <td>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', paddingRight: 0, fontWeight: '700' }}>₹{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--admin-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', color: 'var(--admin-text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', color: 'var(--admin-text-secondary)' }}>
                                <span>Shipping</span>
                                <span>₹{order.shippingFee.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--admin-accent)', marginTop: '8px' }}>
                                <span>Total</span>
                                <span>₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Info */}
                    <div className="customer-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="info-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem' }}>
                                <User size={18} color="var(--admin-accent)" />
                                Customer Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{order.billingInfo.fullName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                                    <Mail size={14} /> {order.billingInfo.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                                    <Phone size={14} /> {order.billingInfo.phone}
                                </div>
                            </div>
                        </div>

                        <div className="info-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem' }}>
                                <MapPin size={18} color="#f59e0b" />
                                Shipping Address
                            </h3>
                            <p style={{ lineHeight: '1.6', color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                                {order.billingInfo.address}<br />
                                {order.billingInfo.city}, {order.billingInfo.state}<br />
                                <strong>{order.pincode}</strong>
                            </p>
                        </div>

                        <div className="info-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem' }}>
                                <CreditCard size={18} color="#10b981" />
                                Payment Info
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>Method</span>
                                <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                            </div>
                            {order.razorpayOrderId && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--admin-text-secondary)', fontSize: '0.8rem' }}>Transaction ID</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                                        {order.razorpayOrderId}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="action-btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                <FileText size={18} style={{ marginRight: '8px' }} />
                                Download Invoice
                            </button>
                            {order.status !== 'Cancelled' && (
                                <button
                                    className="action-btn btn-danger"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this order and refund?')) {
                                            updateStatus('Cancelled');
                                        }
                                    }}
                                >
                                    <RefreshCcw size={18} style={{ marginRight: '8px' }} />
                                    Process Refund
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .fulfillment-timeline { display: flex; justify-content: space-between; position: relative; padding: 0 40px; margin-top: 10px; }
                .fulfillment-timeline::before { content: ''; position: absolute; top: 20px; left: 60px; right: 60px; height: 2px; background: var(--admin-border); z-index: 1; }
                .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2; color: var(--admin-text-secondary); transition: 0.3s; }
                .timeline-step.active { color: var(--admin-accent); }
                .step-icon { width: 42px; height: 42px; background: var(--admin-surface); border: 2px solid var(--admin-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .timeline-step.active .step-icon { background: var(--admin-accent); border-color: var(--admin-accent); color: white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
                .timeline-step span { font-size: 0.85rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default AdminOrderDetails;
