import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/AdminTables.css';

const AdminSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const data = await api.get('/admin/subscriptions');
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading Subscriptions...</div>;

    return (
        <div className="admin-subscriptions-page">
            <header className="content-header">
                <h1>Subscriptions Management</h1>
                <p>Track recurring revenue and memberships</p>
            </header>

            <div className="admin-table-wrapper card-view">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Subscriber</th>
                            <th>Plan Type</th>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Start Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map(sub => (
                            <tr key={sub._id}>
                                <td>
                                    <div className="user-cell">
                                        <strong>{sub.userName}</strong>
                                        <span className="sub-text">{sub.email}</span>
                                    </div>
                                </td>
                                <td>{sub.subscriptionType}</td>
                                <td><code>{sub.razorpay_subscription_id}</code></td>
                                <td>
                                    <span className={`status-pill ${sub.status.toLowerCase()}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSubscriptions;
