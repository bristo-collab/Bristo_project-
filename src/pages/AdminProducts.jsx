import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Tag,
    Layers,
    MoreHorizontal,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Filter,
    MessageSquare,
    Star,
    Image as ImageIcon
} from 'lucide-react';
import { getProductImage } from '../data/productImages';
import '../styles/AdminTables.css';

const CATEGORIES = ['Proteins', 'Vitamins', 'Gainer', 'Pre-Workout', 'Creatine', 'Fish Oil', 'Peanut Butter'];

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', category: '', brand: '', stock: '', image: '', rating: 4.5, description: ''
    });

    useEffect(() => {
        fetchProducts();
    }, [page, categoryFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Updated backend to handle products pagination
            const data = await api.get(`/admin/products?page=${page}&category=${categoryFilter}&search=${searchTerm}`);
            setProducts(data.products || data); // Compatibility fallback
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: '', brand: '', stock: 0, image: '', rating: 4.5, description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/admin/products/${editingProduct._id}`, formData);
                alert('Product updated successfully!');
            } else {
                await api.post('/admin/products', formData);
                alert('Product created successfully!');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/admin/products/${id}`);
                alert('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const getStockBadge = (stock) => {
        if (stock === 0) return <span className="stock-badge out">OUT OF STOCK</span>;
        if (stock < 10) return <span className="stock-badge low">LOW STOCK</span>;
        return <span className="stock-badge in">IN STOCK</span>;
    };

    const handleOpenReviewsModal = (product) => {
        setSelectedProductForReviews(product);
        setIsReviewsModalOpen(true);
    };

    return (
        <div className="admin-page animate-fade-in">
            <header className="section-header">
                <div>
                    <h1>Inventory Control</h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>Comprehensive catalog and stock management.</p>
                </div>
                <button
                    type="button"
                    className="action-btn btn-primary"
                    onClick={(e) => { e.preventDefault(); handleOpenModal(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                    <Plus size={20} />
                    New Entry
                </button>
            </header>

            <div className="table-actions" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ maxWidth: '400px', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search product name or brand (Press Enter)..."
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        className="status-selector"
                        style={{ height: '42px', padding: '0 16px' }}
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="admin-table-wrapper">
                {loading && <div className="table-overlay">Syncing Inventory...</div>}
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Identified Item <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: 0.5 }} /></th>
                            <th>Class / Group</th>
                            <th>Manufacturer</th>
                            <th>Unit Price</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (Array.isArray(products) ? products : products.products).map(product => (
                            <tr key={product._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={getProductImage(product.image, product.name)}
                                            alt={product.name}
                                            style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '4px' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600' }}>{product.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)' }}>ID: {product._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="tiny-chip">{product.category}</span></td>
                                <td>{product.brand}</td>
                                <td style={{ fontWeight: '700' }}>₹{product.price.toLocaleString()}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{product.stock} Units</span>
                                            {getStockBadge(product.stock)}
                                        </div>
                                        <div className="stock-progress-bg">
                                            <div
                                                className="stock-progress-fill"
                                                style={{
                                                    width: `${Math.min((product.stock / 50) * 100, 100)}%`,
                                                    background: product.stock < 10 ? '#ef4444' : product.stock < 25 ? '#f59e0b' : '#10b981'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="button" className="icon-btn" title="View Reviews" onClick={() => handleOpenReviewsModal(product)} style={{ color: 'var(--primary-blue)' }}><MessageSquare size={16} /></button>
                                        <button type="button" className="icon-btn" title="Edit Item" onClick={() => handleOpenModal(product)}><Edit2 size={16} /></button>
                                        <button type="button" className="icon-btn" title="Remove" onClick={() => handleDelete(product._id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-secondary)' }}>
                                    No localized inventory found for selected criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination-footer">
                        <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                            Showing page {page} of {totalPages}
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
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem' }}>{editingProduct ? 'Update SKU' : 'New Catalog Entry'}</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>Fill in the details for the product record.</p>
                            </div>
                            <button type="button" className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="modal-body">
                                <div className="form-grid-2col">
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Official Product Title</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Optimum Nutrition Gold Standard Whey" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Market Price (₹)</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Classification Category</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Manufacturing Brand</label>
                                        <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Current Stock Units</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required />
                                            {formData.stock < 10 && <AlertCircle size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#f59e0b' }} />}
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Technical Description & Details</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            placeholder="Specify ingredients, benefits, and usage instructions..."
                                        ></textarea>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label>Product Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                                                placeholder="e.g. Best Seller, New, Protein"
                                            />
                                        </div>
                                        <div>
                                            <label>Status</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isActive !== false}
                                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                                <span>{formData.isActive !== false ? 'Active (Visible)' : 'Inactive (Hidden)'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn btn-secondary" onClick={() => setIsModalOpen(false)}>Discard</button>
                                <button type="submit" className="action-btn btn-primary">{editingProduct ? 'Commit Changes' : 'Publish Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isReviewsModalOpen && selectedProductForReviews && (
                <div className="modal-overlay" onClick={() => setIsReviewsModalOpen(false)}>
                    <div className="modal-content reviews-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem' }}>Product Reviews</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>{selectedProductForReviews.name}</p>
                            </div>
                            <button type="button" className="icon-btn" onClick={() => setIsReviewsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {selectedProductForReviews.reviewItems && selectedProductForReviews.reviewItems.length > 0 ? (
                                <div className="admin-reviews-list">
                                    {selectedProductForReviews.reviewItems.map((review, idx) => (
                                        <div key={idx} className="admin-review-card">
                                            <div className="admin-review-header">
                                                <span className="reviewer-name">{review.userName}</span>
                                                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="admin-review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "#ffd700" : "transparent"}
                                                        color={i < review.rating ? "#ffd700" : "#cbd5e1"}
                                                    />
                                                ))}
                                            </div>
                                            <p className="admin-review-comment">{review.comment}</p>
                                        </div>
                                    )).reverse()}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-secondary)' }}>
                                    <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <p>No reviews submitted for this product yet.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="action-btn btn-secondary" onClick={() => setIsReviewsModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .stock-badge { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
                .stock-badge.in { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stock-badge.low { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .stock-badge.out { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .stock-progress-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
                .stock-progress-fill { height: 100%; transition: width 0.5s ease-out; }
                .tiny-chip { background: var(--admin-border); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; color: var(--admin-text-secondary); }
                .form-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                /* Toggle Switch */
                .switch { position: relative; display: inline-block; width: 40px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #2196F3; }
                input:checked + .slider:before { transform: translateX(16px); }
            `}</style>
        </div>
    );
};

export default AdminProducts;
