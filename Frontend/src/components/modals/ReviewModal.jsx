import { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please enter a review message');
            return;
        }

        setLoading(true);
        try {
            await reviewsAPI.create({
                orderId: order._id,
                rating,
                message,
                anonymous
            });
            toast.success('Review submitted successfully!');
            onReviewSubmitted();
            onClose();
        } catch (error) {
            console.error('Failed to submit review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="review-modal glass-strong animate-slide-up">
                <div className="modal-header">
                    <h2>Leave a Review</h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="order-context">
                    <p>How was your experience with <strong>{order.freelancerId.name}</strong> for:</p>
                    <h4>{order.gigId.title}</h4>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                className={`star-btn ${(hover || rating) >= star ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <FiStar fill={(hover || rating) >= star ? 'currentColor' : 'none'} />
                            </button>
                        ))}
                    </div>

                    <div className="form-group">
                        <label>Your Feedback</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your experience working with this freelancer..."
                            required
                        />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={anonymous}
                                onChange={(e) => setAnonymous(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Submit as Anonymous Review
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
