import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const OrderContext = createContext();

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch orders from backend
    const fetchOrders = useCallback(async () => {
        try {
            const data = await api.get('/payment/orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders from backend', error);
            // Fallback to localStorage if backend fails or for non-logged in users
            const savedOrders = localStorage.getItem('hk_orders');
            if (savedOrders) setOrders(JSON.parse(savedOrders));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Sync with localStorage as backup
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('hk_orders', JSON.stringify(orders));
        }
    }, [orders, isLoading]);

    const addOrder = useCallback(async (orderDetails) => {
        const tempOrderId = `HK-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrderData = {
            ...orderDetails,
            orderId: tempOrderId,
            orderDate: new Date().toISOString(),
            status: 'Processing',
            items: orderDetails.items.map(item => ({ ...item })),
            tracking: {
                currentStage: 1,
                stages: ['Ordered', 'Packed', 'Shipped', 'Delivered']
            }
        };

        try {
            const response = await api.post('/payment/order/create', { orderDetails: newOrderData });
            if (response.success) {
                setOrders(prev => [response.order, ...prev]);
                return response.order.orderId;
            }
        } catch (error) {
            console.error('Failed to save order to backend', error);
            // Save locally if backend fails
            setOrders(prev => [newOrderData, ...prev]);
            return tempOrderId;
        }
    }, []);

    const updateOrderStatus = useCallback((orderId, status) => {
        setOrders(prev => prev.map(order =>
            order.orderId === orderId ? { ...order, status } : order
        ));
    }, []);

    const cancelOrder = useCallback(async (orderId) => {
        try {
            const response = await api.patch('/payment/order/cancel', { orderId });
            if (response.success) {
                setOrders(prev => prev.map(order =>
                    order.orderId === orderId ? response.order : order
                ));
                alert('Order cancelled successfully. Refund initiated if applicable.');
                return true;
            }
        } catch (error) {
            console.error('Failed to cancel order on backend', error);
            alert(error.message || 'Failed to cancel order.');
            return false;
        }
    }, []);

    const value = {
        orders,
        isLoading,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        refreshOrders: fetchOrders
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
