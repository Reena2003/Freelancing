import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiMapPin, FiCalendar, FiMail, FiBriefcase, FiMessageCircle } from 'react-icons/fi';
import { usersAPI, gigsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './UserProfile.css';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [gigs, setGigs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gigs');

    useEffect(() => {
        fetchProfileData();
    }, [id]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const profileRes = await usersAPI.getProfile(id);
            setProfile(profileRes.data.user);

            // Fetch freelancer's gigs if they are a freelancer
            if (profileRes.data.user.userType === 'freelancer') {
                try {
                    const gigsRes = await gigsAPI.getByFreelancer(id);
                    setGigs(gigsRes.data.gigs || []);
                } catch { /* no gigs */ }
            }

            // Fetch reviews for this user
            try {
                const reviewsRes = await reviewsAPI.getByUser(id);
                setReviews(reviewsRes.data.reviews || []);
            } catch { /* no reviews */ }

        } catch (error) {
            console.error('Failed to fetch profile:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const memberSince = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <Loader size="lg" text="Loading profile..." />
            </div>
        );
    }

    if (!profile) return null;

    const isOwnProfile = currentUser?._id === profile._id;

    return (
        <div className="user-profile-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FiArrowLeft /> Back
                </button>

                <div className="profile-layout">
                    {/* Left: Profile Info */}
                    <aside className="profile-sidebar">
                        <Card padding="lg" className="profile-card">
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">
                                    {profile.profilePicture ? (
                                        <img src={profile.profilePicture} alt={profile.name} />
                                    ) : (
                                        <span>{profile.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <h2 className="profile-name">{profile.name}</h2>
                                <span className={`profile-badge ${profile.userType}`}>
                                    {profile.userType === 'freelancer' ? '🚀 Freelancer' : '💼 Client'}
                                </span>
                            </div>

                            <div className="profile-meta">
                                {profile.rating > 0 && (
                                    <div className="meta-item">
                                        <FiStar className="meta-icon star" />
                                        <span>{profile.rating?.toFixed(1)} ({profile.totalReviews} reviews)</span>
                                    </div>
                                )}
                                {profile.category && (
                                    <div className="meta-item">
                                        <FiBriefcase className="meta-icon" />
                                        <span>{profile.category}</span>
                                    </div>
                                )}
                                <div className="meta-item">
                                    <FiCalendar className="meta-icon" />
                                    <span>Joined {memberSince(profile.createdAt)}</span>
                                </div>
                                <div className="meta-item">
                                    <FiMail className="meta-icon" />
                                    <span>{profile.email}</span>
                                </div>
                            </div>

                            {profile.description && (
                                <div className="profile-description">
                                    <h4>About</h4>
                                    <p>{profile.description}</p>
                                </div>
                            )}

                            {profile.skills?.length > 0 && (
                                <div className="profile-skills">
                                    <h4>Skills</h4>
                                    <div className="skills-list">
                                        {profile.skills.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </aside>

                    {/* Right: Gigs & Reviews */}
                    <main className="profile-main">
                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'gigs' ? 'active' : ''}`}
                                onClick={() => setActiveTab('gigs')}
                            >
                                Gigs ({gigs.length})
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews ({reviews.length})
                            </button>
                        </div>

                        {activeTab === 'gigs' && (
                            <div className="profile-gigs-grid">
                                {gigs.length > 0 ? gigs.map((gig) => (
                                    <Link to={`/gigs/${gig._id}`} key={gig._id} className="profile-gig-link">
                                        <Card padding="md" hover className="profile-gig-card">
                                            {gig.images?.[0] && (
                                                <div className="gig-thumb">
                                                    <img src={gig.images[0]} alt={gig.title} />
                                                </div>
                                            )}
                                            <h4>{gig.title}</h4>
                                            <div className="gig-card-footer">
                                                <span className="gig-category-tag">{gig.category}</span>
                                                <span className="gig-price">From ${gig.price}</span>
                                            </div>
                                        </Card>
                                    </Link>
                                )) : (
                                    <Card padding="lg" className="empty-tab">
                                        <p>No gigs to display.</p>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="profile-reviews-list">
                                {reviews.length > 0 ? reviews.map((review) => (
                                    <Card key={review._id} padding="md" className="review-item">
                                        <div className="review-header">
                                            <div className="review-author">
                                                <div className="review-avatar">
                                                    {review.clientId?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h5>{review.clientId?.name || 'Anonymous'}</h5>
                                                    <span className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="review-stars">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        className={i < review.rating ? 'star filled' : 'star'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </Card>
                                )) : (
                                    <Card padding="lg" className="empty-tab">
                                        <p>No reviews yet.</p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
