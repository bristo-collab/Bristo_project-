import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ShoppingBag, UserPlus, Bell } from 'lucide-react';
import { api } from '../services/api';
import '../styles/LiveActivityFeed.css';

const LiveActivityFeed = () => {
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        // Fetch initial feed history
        const fetchHistory = async () => {
            try {
                const data = await api.get('/admin/analytics/activity-feed');
                setFeed(data);
            } catch (error) {
                console.error('Failed to fetch activity feed');
            }
        };

        fetchHistory();

        // Socket connection for real-time updates
        const socket = io('http://localhost:3000');

        socket.on('admin_notification', (notif) => {
            // Convert notification to feed item format
            const newItem = {
                id: notif._id,
                type: notif.type.includes('order') ? 'order' : 'user',
                message: notif.message,
                timestamp: new Date().toISOString(),
                user: notif.title
            };
            setFeed(prev => [newItem, ...prev].slice(0, 20));
        });

        return () => socket.disconnect();
    }, []);

    const getIcon = (type) => {
        if (type === 'order') return <ShoppingBag size={18} color="#10b981" />;
        if (type === 'user') return <UserPlus size={18} color="#3b82f6" />;
        return <Bell size={18} color="#f59e0b" />;
    };

    return (
        <div className="activity-feed-card animate-slide-up">
            <div className="section-header">
                <h3>Live Activity</h3>
                <span className="live-indicator">
                    <span className="pulse"></span> Live
                </span>
            </div>
            <div className="feed-list">
                {feed.map((item, idx) => (
                    <div key={item.id || idx} className="feed-item animate-fade-in">
                        <div className="feed-icon-wrapper">
                            {getIcon(item.type)}
                            <div className="connector-line"></div>
                        </div>
                        <div className="feed-content">
                            <p className="feed-message">{item.message}</p>
                            <span className="feed-time">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveActivityFeed;
