import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { api } from '../services/api';

const RestockRecommendations = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchRestock = async () => {
            try {
                const res = await api.get('/admin/recommendations');
                setProducts(res);
            } catch (error) {
                console.error("Restock Fetch Error", error);
            }
        };
        fetchRestock();
    }, []);

    if (products.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                <Package size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>Inventory healthy. No immediate restock needed.</p>
            </div>
        );
    }

    return (
        <div className="restock-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(product => (
                <div key={product._id} className="restock-item animate-fade-in"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px'
                    }}>
                    <div className="warning-icon" style={{
                        width: '32px', height: '32px',
                        background: '#ef4444',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <AlertTriangle size={16} />
                    </div>
                    <div className="item-details" style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{product.name}</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                            Only {product.stock} left
                        </p>
                    </div>
                    <button className="restock-btn" style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Order
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RestockRecommendations;
