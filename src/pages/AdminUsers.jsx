import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Users as UsersIcon,
    Mail,
    Phone,
    Shield,
    User,
    Search,
    MoreVertical,
    CheckCircle,
    UserX,
    UserCheck,
    Download,
    Filter,
    ArrowUpDown,
    AlertTriangle
} from 'lucide-react';
import '../styles/AdminTables.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (id, role) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
        try {
            await api.patch(`/admin/users/${id}/role`, { role });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await api.patch(`/admin/users/${id}/block`, { isBlocked: !currentStatus });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update block status:', error);
        }
    };

    const exportUsersCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined On'];
        const rows = users.map(u => [
            u.fullName,
            u.email,
            u.phone || 'N/A',
            u.role,
            u.isBlocked ? 'Blocked' : 'Active',
            new Date(u.createdAt).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.phone && u.phone.includes(searchTerm));

        const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();

        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="admin-page">
            <div className="loading-spinner">Accessing Customer Records...</div>
        </div>
    );

    return (
        <div className="admin-page animate-fade-in">
            <header className="section-header">
                <div>
                    <h1>Customer Management</h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>Maintain and audit the user database.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={exportUsersCSV} className="action-btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} />
                        Export Directory
                    </button>
                    <button className="action-btn btn-primary">Add Administrator</button>
                </div>
            </header>

            <div className="table-actions" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ maxWidth: '360px', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        className="status-selector"
                        style={{ height: '42px', padding: '0 12px' }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        <option value="Admin">Administrators</option>
                        <option value="User">Standard Users</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User Profile <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: 0.5 }} /></th>
                            <th>Contact Details</th>
                            <th>Privileges</th>
                            <th>Status</th>
                            <th>Signed Up</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(u => (
                            <tr key={u._id} className={u.isBlocked ? 'row-blocked' : ''}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className={`user-avatar ${u.role === 'admin' ? 'admin' : ''}`}>
                                            <User size={18} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600' }}>{u.fullName}</span>
                                            {u.isBlocked && <span className="admin-tag-tiny blocked">SUSPENDED</span>}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div className="contact-item">
                                            <Mail size={12} />
                                            {u.email || 'No Email'}
                                        </div>
                                        {u.phone && (
                                            <div className="contact-item">
                                                <Phone size={12} />
                                                {u.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <select
                                        value={u.role}
                                        onChange={(e) => updateRole(u._id, e.target.value)}
                                        className="role-selector"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`trust-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                                        <CheckCircle size={14} />
                                        {u.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className={`icon-btn ${u.isBlocked ? 'unblock' : 'block'}`}
                                            title={u.isBlocked ? 'Unblock User' : 'Block User'}
                                            onClick={() => toggleBlock(u._id, u.isBlocked)}
                                        >
                                            {u.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                        </button>
                                        <button className="icon-btn" title="Audit Logs">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>
                                    <div style={{ color: 'var(--admin-text-secondary)' }}>
                                        <UsersIcon size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                        <p>No customers found matching your search.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .user-avatar { width: 36px; height: 36px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--admin-accent); }
                .user-avatar.admin { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .contact-item { display: flex; alignItems: center; gap: 8px; font-size: 0.8rem; color: var(--admin-text-secondary); }
                .role-selector { background: var(--admin-surface); color: white; border: 1px solid var(--admin-border); border-radius: 8px; padding: 4px 10px; font-size: 0.8rem; outline: none; }
                .trust-badge { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; }
                .trust-badge.verified { color: #10b981; }
                .trust-badge.pending { color: var(--admin-text-secondary); }
                .admin-tag-tiny { font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; width: fit-content; }
                .admin-tag-tiny.blocked { background: rgba(239, 68, 68, 0.1); color: #f87171; margin-top: 2px; }
                .icon-btn.block { color: #f87171; }
                .icon-btn.block:hover { background: rgba(239, 68, 68, 0.1); }
                .icon-btn.unblock { color: #10b981; }
                .icon-btn.unblock:hover { background: rgba(16, 185, 129, 0.1); }
                .row-blocked td { opacity: 0.7; }
                .row-blocked { background: rgba(239, 68, 68, 0.02); }
            `}</style>
        </div>
    );
};

export default AdminUsers;
