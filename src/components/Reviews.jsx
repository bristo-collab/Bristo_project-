import React, { useState } from 'react';
import { Star } from 'lucide-react';
import '../styles/Reviews.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([
        { id: 1, name: 'Rahul Sharma', rating: 5, comment: 'Best protein I have ever used. Genuine product and fast delivery.', date: '2 days ago' },
        { id: 2, name: 'Priya Patel', rating: 5, comment: 'HealthKart never disappoints. The vitamins really helped with my energy levels.', date: '1 week ago' },
        { id: 3, name: 'Amit Singh', rating: 4, comment: 'Good quality creatine. Mixability is great but taste could be better.', date: '2 weeks ago' },
    ]);

    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.comment) return;

        const newReview = {
            id: Date.now(),
            name: formData.name,
            rating: formData.rating,
            comment: formData.comment,
            date: 'Just now'
        };

        setReviews([newReview, ...reviews]);
        setFormData({ name: '', rating: 5, comment: '' });
    };

    return (
        <section className="reviews-section">
            <div className="container">
                <h2 className="section-title">Customer <span className="highlight">Stories</span></h2>

                <div className="reviews-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-avatar">
                                    {review.name[0]}
                                </div>
                                <div className="reviewer-info">
                                    <h4 className="reviewer-name">{review.name}</h4>
                                    <span className="review-date">{review.date}</span>
                                </div>
                            </div>
                            <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < review.rating ? 'star filled' : 'star'}
                                        fill={i < review.rating ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <p className="review-comment">"{review.comment}"</p>
                        </div>
                    ))}
                </div>

                <div className="add-review-container">
                    <div className="add-review-card">
                        <h3>Share Your Story</h3>
                        <p>Your feedback helps us and our community grow stronger.</p>

                        <form onSubmit={handleSubmit} className="review-form">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Your Rating</label>
                                <div className="star-rating-input">
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className={`star-btn ${(hoverRating || formData.rating) >= ratingValue ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, rating: ratingValue })}
                                                onMouseEnter={() => setHoverRating(ratingValue)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            >
                                                <Star size={24} fill={(hoverRating || formData.rating) >= ratingValue ? 'currentColor' : 'none'} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Your Review</label>
                                <textarea
                                    placeholder="Share your experience with our products..."
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    required
                                    rows="4"
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-review-btn">
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reviews;

