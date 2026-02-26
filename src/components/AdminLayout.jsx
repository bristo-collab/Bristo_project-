import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    ChevronDown,
    Package,
    BarChart3,
    Tag,
    Repeat
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
    // State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Hooks
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    // Toggle Sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setIsCollapsed(!isCollapsed); // Use same state for collapsing logic if needed, or separate
    };

    // Logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fetch Notifications on Mount & Setup Socket
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                if (response && response.notifications) {
                    setNotifications(response.notifications);
                    setUnreadCount(response.unreadCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();

        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('admin_notification', (notification) => {
            console.log('New Notification:', notification);
            // Play sound or show toast here if needed
            try { new Audio('/notification.mp3').play().catch(() => { }); } catch (e) { }

            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.disconnect();
    }, []);

    // Mark notifications as read
    const handleMarkRead = async () => {
        if (unreadCount > 0) {
            try {
                await api.patch('/notifications/mark-read', {});
                setUnreadCount(0);
                // Locally update read status for UI feedback
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error('Failed to mark read', error);
            }
        }
    };

    // Toggle Notifications Dropdown
    const toggleNotifications = () => {
        if (!showNotifications) {
            // Mark as read when opening (optional, or maybe just on clear/interaction)
            handleMarkRead();
        }
        setShowNotifications(!showNotifications);
    };

    const handleClearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Nav Links for Sidebar
    const navItems = [
        { path: '/admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
        { path: '/admin-dashboard/products', label: 'Products', icon: <Package size={20} /> },
        { path: '/admin-dashboard/orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
        { path: '/admin-dashboard/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin-dashboard/subscriptions', label: 'Subscriptions', icon: <Repeat size={20} /> },
        { path: '/admin-dashboard/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-section">
                        {/* Assuming logo exists or fallback text */}
                        {!isCollapsed && <span className="logo-text">HK Admin</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <button onClick={toggleSidebar} className="menu-toggle">
                        <Menu size={24} />
                    </button>

                    <div className="topbar-right">
                        {/* Notification Bell */}
                        <div className="notification-wrapper">
                            <button className="icon-btn" onClick={toggleNotifications}>
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown animate-fade-in">
                                    <div className="dropdown-header">
                                        <h3>Notifications</h3>
                                        <button onClick={handleClearNotifications} className="clear-btn">Clear All</button>
                                    </div>
                                    <div className="dropdown-body">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif, index) => (
                                                <div key={index} className={`notification-item ${notif.type || 'info'} ${!notif.isRead ? 'unread' : ''}`}>
                                                    <div className="notif-icon">
                                                        {notif.title?.includes('Cancel') ? '⚠️' : '🔔'}
                                                    </div>
                                                    <div className="notif-content">
                                                        <h4>{notif.title || 'New Notification'}</h4>
                                                        <p>{notif.message}</p>
                                                        <span className="notif-time">
                                                            {new Date(notif.createdAt || notif.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-notif">No new notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="admin-profile">
                            <div className="avatar">A</div>
                            <span className="admin-name">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content Outlet */}
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
