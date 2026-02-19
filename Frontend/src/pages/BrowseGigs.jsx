import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiStar, FiClock, FiRefreshCw } from 'react-icons/fi';
import { gigsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import './BrowseGigs.css';

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
];

const BrowseGigs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    useEffect(() => {
        fetchGigs();
    }, [selectedCategory]);

    const fetchGigs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (searchTerm) params.search = searchTerm;

            const response = await gigsAPI.getAll(params);
            setGigs(response.data.gigs || []);
        } catch (error) {
            console.error('Failed to fetch gigs:', error);
            setGigs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGigs();
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        const params = new URLSearchParams(searchParams);
        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        setSearchParams(params);
    };

    return (
        <div className="browse-page">
            <div className="container">
                {/* Header */}
                <div className="browse-header">
                    <h1>Browse <span className="text-gradient">Gigs</span></h1>
                    <p>Discover talented freelancers ready to bring your vision to life</p>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search gigs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <Button type="submit" variant="primary">Search</Button>
                    </form>

                    <div className="category-filters">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gigs Grid */}
                {loading ? (
                    <div className="loading-state">
                        <Loader size="lg" text="Loading gigs..." />
                    </div>
                ) : gigs.length > 0 ? (
                    <div className="gigs-grid">
                        {gigs.map((gig) => (
                            <Link to={`/gigs/${gig._id}`} key={gig._id}>
                                <Card variant="default" padding="none" hover className="gig-card">
                                    <div className="gig-image">
                                        <img
                                            src={gig.images?.[0] || 'https://via.placeholder.com/400x250?text=Gig+Image'}
                                            alt={gig.title}
                                        />
                                        <span className="gig-category">{gig.category}</span>
                                    </div>
                                    <div className="gig-content">
                                        <div className="gig-seller">
                                            <div className="seller-avatar">
                                                {gig.freelancerId?.name?.charAt(0) || 'F'}
                                            </div>
                                            <span className="seller-name">{gig.freelancerId?.name || 'Freelancer'}</span>
                                        </div>
                                        <h3 className="gig-title">{gig.title}</h3>
                                        <div className="gig-meta">
                                            <span className="gig-rating">
                                                <FiStar /> {gig.rating?.toFixed(1) || '0.0'} ({gig.totalReviews || 0})
                                            </span>
                                        </div>
                                        <div className="gig-footer">
                                            <div className="gig-details">
                                                <span><FiClock /> {gig.deliveryDays} days</span>
                                                <span><FiRefreshCw /> {gig.revisions} revisions</span>
                                            </div>
                                            <div className="gig-price">
                                                Starting at <strong>₹{gig.price}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No gigs found</h3>
                        <p>Try adjusting your search or filters</p>
                        <Button variant="secondary" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseGigs;
