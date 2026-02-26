import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    IndianRupee,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Plus,
    Download,
    Filter
} from 'lucide-react';
import SalesForecastChart from '../components/SalesForecastChart';
import LiveActivityFeed from '../components/LiveActivityFeed';
import RestockRecommendations from '../components/RestockRecommendations';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: stats?.totalRevenue || 0, icon: <IndianRupee size={24} />, trend: '+12.5%', isUp: true, isCurrency: true },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag size={24} />, trend: '+8.2%', isUp: true },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={24} />, trend: '+15.3%', isUp: true },
        { label: 'Active Plans', value: stats?.activeSubscriptions || 0, icon: <CreditCard size={24} />, trend: '-2.1%', isUp: false },
    ];

    if (loading) {
        return <div className="admin-loading">Loading Enterprise Dashboard...</div>;
    }

    return (
        <div className="admin-dashboard animate-fade-in">
            {/* Header Section */}
            <header className="dashboard-header">
                <div>
                    <h1>Enterprise Overview</h1>
                    <p className="subtitle">Real-time insights and AI-driven analytics</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn secondary">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="action-btn secondary">
                        <Download size={16} /> Export Report
                    </button>
                    <button className="action-btn primary">
                        <Plus size={16} /> Quick Action
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="stat-icon-wrapper">{stat.icon}</div>
                        <div className="stat-content">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-row">
                                <span className="stat-value">
                                    {stat.isCurrency ? `₹${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
                                </span>
                                <span className={`stat-trend ${stat.isUp ? 'up' : 'down'}`}>
                                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">

                {/* Left Column: Charts & Analytics */}
                <div className="dashboard-left-col">

                    {/* Sales Forecast Chart */}
                    <div className="dashboard-card chart-card large">
                        <div className="card-header">
                            <h3>Revenue Forecast (AI Powered)</h3>
                            <div className="card-actions">
                                <span className="badge ai-badge">AI Beta</span>
                            </div>
                        </div>
                        <div className="card-body chart-body">
                            <SalesForecastChart />
                        </div>
                    </div>

                    {/* Bottom Row: Restock & Recent Orders */}
                    <div className="dashboard-sub-grid">
                        <div className="dashboard-card medium">
                            <div className="card-header">
                                <h3>Restock Recommendations</h3>
                                <div className="card-actions">
                                    <span className="badge warning-badge">Low Stock</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <RestockRecommendations />
                            </div>
                        </div>

                        <div className="dashboard-card medium">
                            <div className="card-header">
                                <h3>Recent Orders</h3>
                                <Link to="/admin-dashboard/orders" className="link-btn">View All</Link>
                            </div>
                            <div className="card-body table-body">
                                <table className="compact-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.recentOrders?.slice(0, 5).map(order => (
                                            <tr key={order._id}>
                                                <td className="font-mono">#{order.orderId.slice(-6)}</td>
                                                <td>₹{order.total.toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-dot ${order.status.toLowerCase()}`}></span>
                                                    {order.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Feed & Quick Info */}
                <div className="dashboard-right-col">
                    <LiveActivityFeed />
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
