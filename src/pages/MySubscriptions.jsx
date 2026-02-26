import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { getProductImage } from '../data/productImages';
import '../styles/MySubscriptions.css';

const MySubscriptions = () => {
    const {
        subscriptions,
        pauseSubscription,
        resumeSubscription,
        skipNextDelivery,
        cancelSubscription,
        updateFrequency,
        totalSavings
    } = useSubscriptions();

    const [activeTab, setActiveTab] = useState('active');

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const frequencies = ['15 Days', 'Monthly', '2 Months', '3 Months'];

    const filteredSubs = subscriptions.filter(sub => {
        if (activeTab === 'active') return sub.status === 'active' || sub.status === 'paused' || sub.status === 'pending';
        if (activeTab === 'history') return false; // Placeholder for completed/cancelled history
        return true;
    });

    return (
        <div className="subscriptions-dashboard">
            <div className="container">
                <header className="dashboard-header">
                    <div>
                        <h1>My Subscriptions</h1>
                        <p>Manage your recurring health & wellness deliveries</p>
                    </div>
                    <div className="savings-badge">
                        <span className="savings-label">Total Savings</span>
                        <span className="savings-amount">₹{totalSavings.toLocaleString()}</span>
                    </div>
                </header>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Plans
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Orders History
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                        onClick={() => setActiveTab('benefits')}
                    >
                        Membership Benefits
                    </button>
                </div>

                <div className="subscriptions-list">
                    {filteredSubs.length > 0 ? (
                        filteredSubs.map(sub => (
                            <div key={sub.id} className={`sub-card ${sub.status}`}>
                                <div className="sub-card-main">
                                    <div className="sub-product-info">
                                        <div className="sub-image">
                                            <img src={getProductImage(sub.image, sub.name)} alt={sub.name} />
                                        </div>
                                        <div className="sub-details">
                                            <span className={`status-tag ${sub.status}`}>{sub.status}</span>
                                            <h3>{sub.name}</h3>
                                            <div className="sub-meta">
                                                {sub.status === 'pending' ? (
                                                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>⏳ Awaiting Payment Confirmation</span>
                                                ) : (
                                                    <>
                                                        <span>📅 Next: {formatDate(sub.nextDelivery)}</span>
                                                        <span>💰 Saving: ₹{sub.savingsTotal}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {sub.status !== 'pending' && (
                                        <div className="sub-frequency-control">
                                            <label>Delivery Frequency</label>
                                            <select
                                                value={sub.frequency}
                                                onChange={(e) => updateFrequency(sub.id, e.target.value)}
                                            >
                                                {frequencies.map(f => (
                                                    <option key={f} value={f}>{f}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="sub-actions">
                                        {sub.status === 'pending' ? (
                                            <span style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>Actions available after payment confirmation</span>
                                        ) : (
                                            <>
                                                {sub.status === 'active' ? (
                                                    <button className="action-btn pause" onClick={() => pauseSubscription(sub.id)}>Pause</button>
                                                ) : (
                                                    <button className="action-btn resume" onClick={() => resumeSubscription(sub.id)}>Resume</button>
                                                )}
                                                <button className="action-btn skip" onClick={() => skipNextDelivery(sub.id)}>Skip Next</button>
                                                <button className="action-btn cancel" onClick={() => cancelSubscription(sub.id)}>Cancel</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-subscriptions">
                            <div className="empty-icon">📦</div>
                            <h2>No Active Subscriptions</h2>
                            <p>Subscribe to your favorite supplements to save big and never run out.</p>
                            <a href="/subscriptions" className="explore-btn">Explore Plans</a>
                        </div>
                    )}
                </div>

                <section className="perks-banner">
                    <div className="perk-item">
                        <span className="perk-icon">🚚</span>
                        <div>
                            <h4>Priority Shipping</h4>
                            <p>Your subscription orders always get shipped first.</p>
                        </div>
                    </div>
                    <div className="perk-item">
                        <span className="perk-icon">💳</span>
                        <div>
                            <h4>Price Lock</h4>
                            <p>You pay the same price even if market rates go up.</p>
                        </div>
                    </div>
                    <div className="perk-item">
                        <span className="perk-icon">🎁</span>
                        <div>
                            <h4>Loyalty Rewards</h4>
                            <p>Earn 2x HK Points on every subscription order.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MySubscriptions;
