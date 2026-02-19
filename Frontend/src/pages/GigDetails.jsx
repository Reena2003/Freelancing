import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiRefreshCw, FiStar, FiCheck, FiArrowLeft, FiMessageCircle, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { gigsAPI, ordersAPI, reviewsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './GigDetails.css';

const GigDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [gig, setGig] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [requirements, setRequirements] = useState('');
    const [showOrderForm, setShowOrderForm] = useState(false);

    useEffect(() => {
        fetchGigDetails();
    }, [id]);

    const fetchGigDetails = async () => {
        setLoading(true);
        try {
            const [gigRes, reviewsRes] = await Promise.all([
                gigsAPI.getById(id),
                reviewsAPI.getByGig(id)
            ]);
            setGig(gigRes.data.gig);
            setReviews(reviewsRes.data.reviews || []);
        } catch (error) {
            console.error('Failed to fetch gig details:', error);
            toast.error('Gig not found');
            navigate('/gigs');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }

        if (user.userType !== 'client') {
            toast.error('Only clients can place orders');
            return;
        }

        if (!requirements.trim()) {
            toast.error('Please provide your requirements');
            return;
        }

        setOrderLoading(true);
        try {
            await ordersAPI.create({
                gigId: gig._id,
                requirements: requirements
            });
            toast.success('Order placed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to place order:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setOrderLoading(false);
        }
    };

    const handleContactSeller = () => {
        if (!user) {
            toast.error('Please login to contact the seller');
            navigate('/login');
            return;
        }

        if (isOwner) {
            toast.error('You cannot contact yourself');
            return;
        }

        navigate(`/chat/gig/${gig._id}`);
    };

    if (loading) {
        return (
            <div className="gig-details-loading">
                <Loader size="lg" text="Loading gig details..." />
            </div>
        );
    }

    if (!gig) return null;

    const isOwner = user?._id === gig.freelancerId?._id;

    return (
        <div className="gig-details-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FiArrowLeft /> Back
                </button>

                <div className="gig-details-grid">
                    {/* Main Content */}
                    <div className="gig-main">
                        <div className="gig-header">
                            <span className="gig-category-badge">{gig.category}</span>
                            <h1>{gig.title}</h1>
                            <div className="seller-brief">
                                <div className="seller-avatar">
                                    {gig.freelancerId?.name?.charAt(0) || 'F'}
                                </div>
                                <span className="seller-name">{gig.freelancerId?.name}</span>
                                <span className="divider">|</span>
                                <span className="gig-rating-info">
                                    <FiStar className="star-icon" /> {gig.rating?.toFixed(1) || '0.0'}
                                    <span className="reviews-count">({gig.totalReviews || 0} reviews)</span>
                                </span>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="gig-gallery">
                            {gig.images && gig.images.length > 0 ? (
                                <div className="main-image">
                                    <img src={gig.images[0]} alt={gig.title} />
                                </div>
                            ) : (
                                <div className="image-placeholder-large">
                                    <FiShoppingCart size={48} />
                                    <span>No images available</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <section className="gig-section">
                            <h2>About This Gig</h2>
                            <div className="gig-description">
                                {gig.description}
                            </div>
                        </section>

                        {/* Tags */}
                        {gig.tags && gig.tags.length > 0 && (
                            <section className="gig-section">
                                <div className="gig-tags">
                                    {gig.tags.map((tag, index) => (
                                        <span key={index} className="tag-badge">#{tag}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews Section */}
                        <section className="gig-section">
                            <div className="section-header-row">
                                <h2>Reviews</h2>
                                <div className="avg-rating-big">
                                    <FiStar fill="#f59e0b" color="#f59e0b" />
                                    <span>{gig.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="total-count">({reviews.length})</span>
                                </div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="review-item">
                                            <div className="review-header">
                                                <div className="review-user">
                                                    <div className="review-avatar">
                                                        {review.reviewerId?.profilePicture ? (
                                                            <img src={review.reviewerId.profilePicture} alt="" />
                                                        ) : (
                                                            review.reviewerId?.name?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="reviewer-name">{review.reviewerId?.name}</span>
                                                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="review-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            fill={i < review.rating ? "#f59e0b" : "none"}
                                                            color={i < review.rating ? "#f59e0b" : "#475569"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-text">{review.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-reviews">No reviews yet for this gig.</p>
                            )}
                        </section>
                    </div>

                    {/* Sidebar / Pricing */}
                    <aside className="gig-sidebar">
                        <Card padding="lg" className="pricing-card">
                            <div className="pricing-header">
                                <h3>Pricing</h3>
                                <span className="price-tag">₹{gig.price}</span>
                            </div>

                            <p className="gig-summary-text">
                                Full professional delivery with all features included.
                            </p>

                            <div className="gig-features-list">
                                <div className="feature-item">
                                    <FiClock /> <span>{gig.deliveryDays} Days Delivery</span>
                                </div>
                                <div className="feature-item">
                                    <FiRefreshCw /> <span>{gig.revisions} Revisions</span>
                                </div>
                                <div className="feature-item">
                                    <FiCheck /> <span>Commercial Use</span>
                                </div>
                            </div>

                            {!isOwner && user?.userType !== 'freelancer' && (
                                <div className="order-actions">
                                    {!showOrderForm ? (
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            size="lg"
                                            onClick={() => setShowOrderForm(true)}
                                            icon={<FiShoppingCart />}
                                        >
                                            Continue (₹{gig.price})
                                        </Button>
                                    ) : (
                                        <form onSubmit={handlePlaceOrder} className="requirements-form">
                                            <div className="input-wrapper">
                                                <label className="input-label">Your Requirements</label>
                                                <textarea
                                                    className="input-field textarea-sm"
                                                    placeholder="Tell the freelancer what you need..."
                                                    value={requirements}
                                                    onChange={(e) => setRequirements(e.target.value)}
                                                    required
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="form-buttons">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    fullWidth
                                                    loading={orderLoading}
                                                >
                                                    Place Order
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    fullWidth
                                                    onClick={() => setShowOrderForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        icon={<FiMessageCircle />}
                                        onClick={handleContactSeller}
                                    >
                                        Contact Seller
                                    </Button>
                                </div>
                            )}

                            {isOwner && (
                                <Link to={`/gigs/${gig._id}/edit`} style={{ width: '100%' }}>
                                    <Button variant="secondary" fullWidth>Edit Your Gig</Button>
                                </Link>
                            )}
                        </Card>

                        {/* Seller Card */}
                        <Card padding="md" className="seller-card">
                            <div className="seller-info-horizontal">
                                <div className="seller-avatar large">
                                    {gig.freelancerId?.name?.charAt(0) || 'F'}
                                </div>
                                <div className="seller-details">
                                    <h4>{gig.freelancerId?.name}</h4>
                                    <p>Professional Freelancer</p>
                                    <div className="seller-stats">
                                        <FiStar className="star-icon" />
                                        <span>{gig.freelancerId?.rating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                </div>
                            </div>
                            <Link to={`/users/${gig.freelancerId?._id}`}>
                                <Button variant="ghost" fullWidth size="sm">View Profile</Button>
                            </Link>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default GigDetails;
