import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import { getProductImage } from '../data/productImages';
import { checkPincodeService } from '../utils/pincodeService';
import { api } from '../services/api';
import '../styles/Checkout.css';

const Checkout = () => {
    const {
        cartItems,
        subtotal,
        clearCart,
        shippingFee,
        totalAmount,
        applyPincode,
        pincodeData,
        isSubscriptionInCart
    } = useCart();
    const { addOrder } = useOrders();
    const { addSubscription, activateSubscription } = useSubscriptions();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const buyNowItem = location.state?.buyNowItem;

    const [pincode, setPincode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Force online payment if subscription is present
    useEffect(() => {
        if (isSubscriptionInCart) {
            setPaymentMethod('online');
        }
    }, [isSubscriptionInCart]);

    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        if (!buyNowItem && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate, buyNowItem]);

    // Update form when user data is available
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }));
        }
    }, [user]);

    // Use Buy Now item if available, otherwise use cart items
    const displayItems = buyNowItem ? [buyNowItem] : cartItems;
    const displaySubtotal = buyNowItem ? (buyNowItem.price * buyNowItem.quantity) : subtotal;

    // Recalculate shipping and total for Buy Now flow
    const displayShipping = buyNowItem
        ? (pincodeData?.success ? pincodeData.shipping : (displaySubtotal < 500 ? 40 : 0))
        : shippingFee;

    const displaySubscriptionDiscount = (buyNowItem?.isSubscription || isSubscriptionInCart)
        ? (displaySubtotal * 0.1)
        : 0;

    const displayTotal = displaySubtotal + displayShipping - displaySubscriptionDiscount;

    const handlePincodeChange = async (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setPincode(value);

        if (value.length === 6) {
            setIsVerifying(true);
            const result = await applyPincode(value);
            setIsVerifying(false);

            if (result.success) {
                setForm(prev => ({
                    ...prev,
                    city: result.city || result.district,
                    state: result.state || 'Kerala'
                }));
                // If COD not available for this pincode, reset payment method
                if (!result.cod && paymentMethod === 'cod') {
                    setPaymentMethod('online');
                }
            }
        }
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const processOrderCompletion = async (orderId) => {
        // Save order to history
        await addOrder({
            items: displayItems,
            total: displayTotal,
            subtotal: displaySubtotal,
            shippingFee: displayShipping,
            paymentMethod,
            billingInfo: form,
            pincode,
            isSubscription: buyNowItem?.isSubscription || isSubscriptionInCart,
            razorpayOrderId: orderId
        });

        // Handle Subscriptions: Add as pending first (already active in this flow)
        const subscriptionItems = displayItems.filter(item => item.isSubscription);
        subscriptionItems.forEach(item => {
            const subId = addSubscription({
                name: item.name,
                price: item.price,
                image: item.image,
                frequency: item.frequency
            }, 'active');
        });

        if (!buyNowItem) clearCart();
        navigate('/my-orders');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!pincodeData || !pincodeData.success) {
            alert('⚠️ Please enter a valid Kerala pincode before placing your order.');
            return;
        }

        setIsProcessingPayment(true);
        const isSubscription = buyNowItem?.isSubscription || isSubscriptionInCart;
        const subscriptionItem = displayItems.find(item => item.isSubscription);

        if (paymentMethod === 'online') {
            try {
                let paymentData;

                if (isSubscription) {
                    // 1a. Create Razorpay Subscription
                    paymentData = await api.post('/payment/create-subscription', {
                        amount: displayTotal,
                        name: buyNowItem ? buyNowItem.name : 'HealthKart Subscription'
                    });
                } else {
                    // 1b. Create Razorpay Order
                    paymentData = await api.post('/payment/create-order', {
                        amount: displayTotal
                    });
                }

                // 2. Initialize Razorpay Options
                const options = {
                    key: 'rzp_test_RIZ6VfQgTUV4t6',
                    name: 'HealthKart',
                    description: isSubscription ? 'Recurring Subscription' : 'Premium Supplements Purchase',
                    handler: async function (response) {
                        try {
                            // 3. Verify Payment with full metadata
                            const verifyPayload = isSubscription ? {
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                userId: user?.id || user?._id,
                                userName: form.fullName,
                                email: form.email,
                                subscriptionType: subscriptionItem?.frequency || 'Monthly',
                                amount: displayTotal
                            } : {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            };

                            const verifyData = await api.post('/payment/verify', verifyPayload);

                            if (verifyData.success) {
                                setIsProcessingPayment(false);
                                alert(`Payment Successful and Verified!`);
                                await processOrderCompletion(isSubscription ? response.razorpay_subscription_id : response.razorpay_order_id);
                            }
                        } catch (error) {
                            console.error("Verification Error:", error);
                            alert("Payment verification failed. Please contact support.");
                            setIsProcessingPayment(false);
                        }
                    },
                    prefill: {
                        name: form.fullName,
                        email: form.email,
                        contact: form.phone
                    },
                    theme: {
                        color: '#007bff'
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessingPayment(false);
                        }
                    }
                };

                // Add order_id or subscription_id based on flow
                if (isSubscription) {
                    options.subscription_id = paymentData.id;
                } else {
                    options.order_id = paymentData.id;
                    options.amount = paymentData.amount;
                    options.currency = paymentData.currency;
                }

                const rzp = new window.Razorpay(options);
                rzp.open();

            } catch (error) {
                console.error("Payment Error:", error);
                alert(`Payment Initialization Failed: ${error.message}`);
                setIsProcessingPayment(false);
            }
        } else {
            // COD Flow
            setTimeout(async () => {
                await processOrderCompletion('COD_' + Date.now());
                setIsProcessingPayment(false);
                alert('Order placed successfully with Cash on Delivery!');
            }, 1000);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-layout">
                    <div className="checkout-main">
                        <form id="checkout-form" onSubmit={handlePlaceOrder}>
                            <div className="checkout-section animate-fade-in">
                                <h2><span className="section-number">1</span> Shipping Address</h2>
                                <div className="address-grid">
                                    <div className="form-group full-width">
                                        <label>Full Name</label>
                                        <input
                                            name="fullName"
                                            className="form-input"
                                            placeholder="John Doe"
                                            required
                                            value={form.fullName}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            name="email"
                                            className="form-input"
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            value={form.email}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            name="phone"
                                            className="form-input"
                                            type="tel"
                                            placeholder="9876543210"
                                            required
                                            value={form.phone}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Pin Code</label>
                                        <div className="pincode-field-wrapper">
                                            <input
                                                className="form-input"
                                                style={{ width: '100%' }}
                                                placeholder="6-digit Pin Code"
                                                maxLength="6"
                                                required
                                                value={pincode}
                                                onChange={handlePincodeChange}
                                            />
                                            {isVerifying && <div className="pincode-loader"></div>}
                                            {pincodeData?.success && <div className="pincode-valid-tick">✓</div>}
                                        </div>
                                        {pincodeData && !pincodeData.success && (
                                            <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginTop: '5px' }}>
                                                {pincodeData.error}
                                            </p>
                                        )}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Flat / House No / Area</label>
                                        <input
                                            name="address"
                                            className="form-input"
                                            placeholder="Address Details"
                                            required
                                            value={form.address}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            className="form-input"
                                            placeholder="City"
                                            required
                                            value={form.city}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            name="state"
                                            className="form-input"
                                            placeholder="State"
                                            required
                                            value={form.state}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <h2><span className="section-number">2</span> Payment Method</h2>
                                <div className="payment-methods">
                                    <div
                                        className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('online')}
                                    >
                                        <input type="radio" checked={paymentMethod === 'online'} readOnly />
                                        <div className="payment-info">
                                            <span>Pay Online (Card/UPI)</span>
                                            <span>Secure encrypted payment</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`payment-option ${(pincodeData?.success && !pincodeData.cod) || isSubscriptionInCart ? 'disabled' : ''} ${paymentMethod === 'cod' ? 'active' : ''}`}
                                        onClick={() => {
                                            if (!isSubscriptionInCart && (!pincodeData?.success || pincodeData.cod)) {
                                                setPaymentMethod('cod');
                                            }
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'cod'}
                                            disabled={(pincodeData?.success && !pincodeData.cod) || isSubscriptionInCart}
                                            readOnly
                                        />
                                        <div className="payment-info">
                                            <span>Cash On Delivery</span>
                                            {isSubscriptionInCart ? (
                                                <span className="restriction-msg">Not available for subscriptions</span>
                                            ) : (
                                                <span>{pincodeData?.success && !pincodeData.cod ? 'Not available for this location' : 'Pay when you receive'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <aside className="checkout-sidebar">
                        <div className="checkout-summary-card animate-scale-in">
                            <h2>Order Summary</h2>
                            <div className="summary-items">
                                {displayItems.map((item, index) => (
                                    <div key={item.id || index} className="summary-item">
                                        <div className="item-img">
                                            <img src={getProductImage(item.image, item.name)} alt={item.name} />
                                        </div>
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            {item.selectedFlavor && <p className="item-spec">Flavor: {item.selectedFlavor}</p>}
                                            {item.selectedWeight && <p className="item-spec">Size: {item.selectedWeight}</p>}
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                        <div className="item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider" style={{ margin: '20px 0', borderTop: '1px solid #f1f5f9' }}></div>

                            <div className="price-row">
                                <span>Subtotal</span>
                                <span>₹{displaySubtotal.toLocaleString()}</span>
                            </div>
                            <div className="price-row">
                                <span>Shipping Fees</span>
                                <span className={displayShipping === 0 ? 'free' : ''}>
                                    {displayShipping === 0 ? 'FREE' : `₹${displayShipping}`}
                                </span>
                            </div>
                            {displaySubscriptionDiscount > 0 && (
                                <div className="price-row discount">
                                    <span>HK Pro Discount (10%)</span>
                                    <span>-₹{displaySubscriptionDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            {pincodeData?.success && (
                                <div className="price-row" style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                    <span>Estimate</span>
                                    <span style={{ color: '#059669', fontWeight: 800 }}>By {pincodeData.deliveryDate}</span>
                                </div>
                            )}

                            <div className="price-row total">
                                <span>Total Payable</span>
                                <span>₹{displayTotal.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className={`place-order-btn ${isProcessingPayment ? 'processing' : ''}`}
                                disabled={(pincodeData && !pincodeData.success) || isProcessingPayment}
                            >
                                {isProcessingPayment ? 'Processing Payment...' : 'Confirm Order'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
