import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { checkPincodeService } from '../utils/pincodeService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { addToast } = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [pincodeData, setPincodeData] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [deliveryEstimate, setDeliveryEstimate] = useState(null);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('hk_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from localStorage', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('hk_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((product) => {
        setCartItems((prevItems) => {
            const productId = product._id || product.id;
            const existingItem = prevItems.find(item => (item._id || item.id) === productId);
            if (existingItem) {
                addToast(`${product.name} quantity updated in cart`, 'success');
                return prevItems.map(item =>
                    (item._id || item.id) === productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
                );
            }
            addToast(`${product.name} added to cart`, 'success');
            return [...prevItems, { ...product, quantity: 1 }];
        });
    }, [addToast]);

    const removeFromCart = useCallback((productId) => {
        setCartItems((prevItems) => {
            const item = prevItems.find(p => (p._id || p.id) === productId);
            if (item) {
                addToast(`${item.name} removed from cart`, 'info');
            }
            return prevItems.filter(item => (item._id || item.id) !== productId);
        });
    }, [addToast]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const updateQuantity = useCallback((productId, delta) => {
        setCartItems((prevItems) => {
            return prevItems.map(item => {
                if ((item._id || item.id) === productId) {
                    const newQty = Math.max(1, (item.quantity || 1) + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    }, []);

    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

    // Dynamic Shipping Logic
    useEffect(() => {
        if (pincodeData && pincodeData.success) {
            setShippingFee(pincodeData.shipping);
            setDeliveryEstimate(pincodeData.deliveryDate);
        } else {
            // Default logic if no pincode is set
            setShippingFee(subtotal > 0 && subtotal < 500 ? 40 : 0);
            setDeliveryEstimate(null);
        }
    }, [subtotal, pincodeData]);

    const applyPincode = useCallback(async (pincode) => {
        try {
            const result = await checkPincodeService(pincode);
            setPincodeData(result);
            return result;
        } catch (error) {
            console.error('Pincode check failed', error);
            return { success: false, error: 'Service error' };
        }
    }, []);

    const isSubscriptionInCart = cartItems.some(item => item.isSubscription);
    const subscriptionDiscount = isSubscriptionInCart ? subtotal * 0.1 : 0; // Extra 10% off for subscriptions

    const totalAmount = subtotal + shippingFee - subscriptionDiscount;

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        totalAmount,
        subscriptionDiscount,
        isSubscriptionInCart,
        deliveryEstimate,
        pincodeData,
        applyPincode
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
