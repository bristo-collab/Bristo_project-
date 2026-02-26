import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/Profile.css';

const Profile = () => {
    const { user, login } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await api.get('/user/profile');
            setProfile(data);
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.patch('/user/profile', formData);
            setProfile(result.user);
            // Update user in context/localStorage
            login(result.user, localStorage.getItem('hk_token'));
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <div className="profile-loader">
                    <div className="spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-card animate-fade-in">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-title">
                            <h1>My Account</h1>
                            <p>Manage your personal information and delivery details</p>
                        </div>
                        <button
                            className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="profile-content">
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Default Delivery Address</label>
                                    {isEditing || formData.address ? (
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Add your delivery address for faster checkout"
                                            rows="3"
                                        />
                                    ) : (
                                        <div className="empty-address-container">
                                            <p className="empty-msg">No delivery address added yet.</p>
                                            <button
                                                type="button"
                                                className="add-address-btn"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                + Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="account-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Account Created</span>
                                    <span className="meta-value">
                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Status</span>
                                    <span className="meta-value status-pill">
                                        {profile?.isVerified ? 'Verified Account' : 'Unverified'}
                                    </span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions animate-slide-up">
                                    <button type="submit" className="save-profile-btn">
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
