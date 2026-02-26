import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    ShoppingBag,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle,
    Truck,
    PackageCheck,
    X,
    Download,
    Eye,
    FileText,
    RefreshCcw
} from 'lucide-react';
import '../styles/AdminTables.css';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/orders?page=${page}&status=${statusFilter}&search=${searchTerm}`);
            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            fetchOrders();
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/admin/orders/${id}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
        const rows = orders.map(o => [
            o.orderId,
            o.billingInfo.fullName,
            o.billingInfo.email,
            o.total,
            o.status,
            new Date(o.orderDate).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="admin-page animate-fade-in">
            <header className="section-header">
                <div>
                    <h1>Order Fulfillment</h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>Review and manage customer purchases.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={exportToCSV} className="action-btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} />
                        Export CSV
                    </button>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="view-all-btn"
                        style={{ height: '42px', padding: '0 16px', borderRadius: '12px' }}
                    >
                        <option value="All">All Orders</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </header>

            <div className="table-actions" style={{ marginBottom: '24px' }}>
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search ID, Name or Email (Press Enter)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            <div className="admin-table-wrapper">
                {loading && <div className="table-overlay">Updating...</div>}
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map(order => (
                            <tr key={order._id}>
                                <td style={{ fontWeight: '700', color: 'var(--admin-accent)' }}>#{order.orderId}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>{order.billingInfo.fullName}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{order.billingInfo.email}</span>
                                    </div>
                                </td>
                                <td>₹{order.total.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                        <Calendar size={14} color="var(--admin-text-secondary)" />
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="icon-btn" title="View Details" onClick={() => navigate(`/admin-dashboard/orders/${order._id}`)}>
                                            <Eye size={16} />
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className="status-selector"
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-secondary)' }}>
                                    No orders found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                        Page {page} of {totalPages}
                    </span>
                    <div className="pagination-btns">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagi-btn">
                            <ChevronLeft size={18} />
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagi-btn">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .table-overlay { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.4); backdrop-filter: blur(2px); z-index: 10; display:flex; align-items:center; justify-content:center; }
                .pagination-footer { padding: 16px 24px; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; }
                .pagination-btns { display: flex; gap: 8px; }
                .pagi-btn { width: 36px; height: 36px; border-radius: 8px; background: var(--admin-surface); border: 1px solid var(--admin-border); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .pagi-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .pagi-btn:hover:not(:disabled) { background: var(--admin-border); }
                .status-selector { background: var(--admin-surface); color: white; border: 1px solid var(--admin-border); border-radius: 8px; padding: 4px 8px; font-size: 0.8rem; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminOrders;
