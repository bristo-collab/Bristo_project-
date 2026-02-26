import React, { useState } from 'react';
import '../styles/TrackOrder.css';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [contact, setContact] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setIsTracking(true);
        setError('');
        setOrderData(null);

        try {
            const response = await fetch('http://localhost:3000/api/track-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, contact })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to track order');
            }

            setOrderData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsTracking(false);
        }
    };

    return (
        <div className="track-order-page animate-fade-in">
            <div className="container">
                <div className="track-card glassmorphism">
                    <div className="track-header">
                        <h1>Track Your <span className="highlight">Order</span></h1>
                        <p>Enter your details below to see the real-time status of your delivery.</p>
                    </div>

                    <form className="track-form" onSubmit={handleTrack}>
                        <div className="form-group">
                            <label htmlFor="orderId">Order ID</label>
                            <input
                                type="text"
                                id="orderId"
                                placeholder="e.g. HK12345678"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact">Email or Phone Number</label>
                            <input
                                type="text"
                                id="contact"
                                placeholder="Registered email or phone"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary track-btn" disabled={isTracking}>
                            {isTracking ? (
                                <span className="loader"></span>
                            ) : (
                                <>
                                    <span>Track Now</span>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {error && <div className="error-message" style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}

                    <div className="track-footer">
                        <p>Need help? <a href="#">Contact Support</a></p>
                    </div>
                </div>

                {orderData && (
                    <div className="track-steps animate-slide-up">
                        <div className="order-summary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3>Order Status: <span className={`status-text ${orderData.status.toLowerCase()}`}>{orderData.status}</span></h3>
                            <p>Date: {new Date(orderData.orderDate).toLocaleDateString()}</p>
                        </div>

                        <div className="steps-container">
                            {['Processing', 'Packed', 'Shipped', 'Delivered'].map((step, index) => {
                                const isCompleted = index <= (orderData.tracking?.currentStage || 0);
                                const isCurrent = index === (orderData.tracking?.currentStage || 0);

                                let icon = '📦'; // Default
                                if (step === 'Processing') icon = '⚙️';
                                if (step === 'Packed') icon = '📦';
                                if (step === 'Shipped') icon = '🚚';
                                if (step === 'Delivered') icon = '✅';

                                return (
                                    <div key={step} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                        <div className="step-icon">{icon}</div>
                                        <h3>{step}</h3>
                                        {isCurrent && <p className="current-status-label">Current Status</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .steps-container {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 2rem;
                    position: relative;
                }
                .steps-container::before {
                    content: '';
                    position: absolute;
                    top: 25px;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: #eee;
                    z-index: 1;
                }
                .step-item {
                    position: relative;
                    z-index: 2;
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    width: 22%;
                    transition: all 0.3s ease;
                }
                .step-item.completed .step-icon {
                    background: #4CAF50;
                    color: white;
                    border-color: #4CAF50;
                }
                .step-item.current {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 2px solid #2196F3;
                }
                .step-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 2px solid #ddd;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    margin: 0 auto 1rem;
                }
                .animate-slide-up {
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TrackOrder;
