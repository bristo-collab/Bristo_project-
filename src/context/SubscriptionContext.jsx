import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const SubscriptionContext = createContext();

export const useSubscriptions = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptions must be used within a SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    const { addToast } = useToast();
    const [subscriptions, setSubscriptions] = useState([]);

    // Load subscriptions from localStorage on mount
    useEffect(() => {
        const savedSubs = localStorage.getItem('hk_subscriptions');
        if (savedSubs) {
            try {
                setSubscriptions(JSON.parse(savedSubs));
            } catch (error) {
                console.error('Failed to parse subscriptions', error);
            }
        }
    }, []);

    // Save subscriptions whenever they change
    useEffect(() => {
        localStorage.setItem('hk_subscriptions', JSON.stringify(subscriptions));
    }, [subscriptions]);

    const addSubscription = useCallback((plan, status = 'active') => {
        const newSub = {
            ...plan,
            id: `sub_${Date.now()}`,
            status: status,
            startDate: status === 'active' ? new Date().toISOString() : null,
            nextDelivery: status === 'active'
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : null,
            savingsTotal: Math.floor(plan.price * 0.1) // 10% auto-discount
        };
        setSubscriptions(prev => [...prev, newSub]);
        if (status === 'active') {
            addToast(`Successfully subscribed to ${plan.name}`, 'success');
        } else {
            addToast(`${plan.name} subscription is pending payment`, 'info');
        }
        return newSub.id;
    }, [addToast]);

    const activateSubscription = useCallback((subId) => {
        setSubscriptions(prev => prev.map(sub => {
            if (sub.id === subId && sub.status === 'pending') {
                return {
                    ...sub,
                    status: 'active',
                    startDate: new Date().toISOString(),
                    nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };
            }
            return sub;
        }));
        addToast('Subscription activated successfully!', 'success');
    }, [addToast]);

    const updateSubscriptionStatus = useCallback((subId, status) => {
        setSubscriptions(prev => prev.map(sub =>
            sub.id === subId ? { ...sub, status } : sub
        ));
        addToast(`Subscription is now ${status}`, 'info');
    }, [addToast]);

    const pauseSubscription = useCallback((subId) => {
        updateSubscriptionStatus(subId, 'paused');
    }, [updateSubscriptionStatus]);

    const resumeSubscription = useCallback((subId) => {
        updateSubscriptionStatus(subId, 'active');
    }, [updateSubscriptionStatus]);

    const skipNextDelivery = useCallback((subId) => {
        setSubscriptions(prev => prev.map(sub => {
            if (sub.id === subId) {
                const nextDate = new Date(sub.nextDelivery);
                nextDate.setDate(nextDate.getDate() + 30); // Simple 1-month skip
                return { ...sub, nextDelivery: nextDate.toISOString() };
            }
            return sub;
        }));
        addToast('Next delivery skipped successfully', 'success');
    }, [addToast]);

    const cancelSubscription = useCallback((subId) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== subId));
        addToast('Subscription cancelled', 'warning');
    }, [addToast]);

    const updateFrequency = useCallback((subId, newFrequency) => {
        setSubscriptions(prev => prev.map(sub =>
            sub.id === subId ? { ...sub, frequency: newFrequency } : sub
        ));
        addToast(`Delivery frequency updated to ${newFrequency}`, 'success');
    }, [addToast]);

    const totalSavings = subscriptions.reduce((acc, sub) => acc + sub.savingsTotal, 0);

    const value = {
        subscriptions,
        addSubscription,
        activateSubscription,
        pauseSubscription,
        resumeSubscription,
        skipNextDelivery,
        cancelSubscription,
        updateFrequency,
        totalSavings
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};
