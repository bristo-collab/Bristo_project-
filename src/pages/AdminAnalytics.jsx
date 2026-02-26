import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, Users, ShoppingBag, CreditCard,
    DollarSign, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { api } from '../services/api';
import '../styles/AdminTables.css';

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [topSelling, setTopSelling] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [analyticsResult, topSellingResult] = await Promise.all([
                    api.get('/admin/analytics'),
                    api.get('/admin/analytics/top-selling')
                ]);
                setData(analyticsResult);
                setTopSelling(topSellingResult);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError('Failed to load real-time analytics data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchAnalytics, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="admin-page">
            <div className="loading-spinner">Loading dynamic insights...</div>
        </div>
    );

    if (error) return (
        <div className="admin-page">
            <div className="error-alert">{error}</div>
        </div>
    );

    const { summary, charts } = data;

    const statCards = [
        { label: 'Total Revenue', value: `₹${summary.totalRevenue.toLocaleString()}`, icon: <DollarSign />, class: 'revenue' },
        { label: 'Total Orders', value: summary.totalOrders.toLocaleString(), icon: <ShoppingBag />, class: 'orders' },
        { label: 'Total Customers', value: summary.totalUsers.toLocaleString(), icon: <Users />, class: 'users' },
        { label: 'Active Subscriptions', value: summary.activeSubscriptions.toLocaleString(), icon: <Activity />, class: 'subs' }
    ];

    return (
        <div className="admin-page animate-fade-in">
            <header className="section-header">
                <div>
                    <h1>Business Analytics</h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                        Real-time performance metrics and growth analysis.
                    </p>
                </div>
                <div className="header-actions">
                    <span className="last-updated">
                        Live Tracking Active <span className="pulse-dot"></span>
                    </span>
                </div>
            </header>

            <div className="analytics-grid">
                {statCards.map((card, idx) => (
                    <div key={idx} className="stat-card">
                        <div className={`stat-icon ${card.class}`}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <span className="label">{card.label}</span>
                            <span className="value">{card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-container">
                <div className="chart-box">
                    <h3>Revenue Growth (Last 7 Days)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={charts.dailyStats}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="_id" stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-box">
                    <h3>Orders Frequency</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={charts.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="_id" stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-box">
                    <h3>Top Selling Products</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={topSelling} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="var(--admin-text-secondary)" fontSize={10} width={100} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="totalSold" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-box">
                    <h3>User Registration Growth</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={charts.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="_id" stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Line type="stepAfter" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .loading-spinner {
                    height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--admin-text-secondary);
                    font-size: 1.1rem;
                }
                .error-alert {
                    padding: 20px;
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-radius: 12px;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    margin: 40px;
                }
                .last-updated {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: var(--admin-text-secondary);
                    background: var(--admin-surface);
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid var(--admin-border);
                }
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminAnalytics;
