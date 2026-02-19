import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiCode, FiPenTool, FiFileText, FiTrendingUp, FiBriefcase, FiStar, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Home.css';

const categories = [
    { icon: <FiCode />, name: 'Programming', count: '12,345' },
    { icon: <FiPenTool />, name: 'Design', count: '8,920' },
    { icon: <FiFileText />, name: 'Writing', count: '6,540' },
    { icon: <FiTrendingUp />, name: 'Marketing', count: '4,320' },
    { icon: <FiBriefcase />, name: 'Business', count: '3,150' },
];

const features = [
    {
        icon: <FiSearch />,
        title: 'Find Perfect Talent',
        description: 'Browse thousands of skilled freelancers and find the perfect match for your project.',
    },
    {
        icon: <FiCheckCircle />,
        title: 'Secure Payments',
        description: 'Your payments are protected. Release funds only when you are satisfied with the work.',
    },
    {
        icon: <FiStar />,
        title: 'Quality Guaranteed',
        description: 'Read verified reviews and ratings to hire with confidence every time.',
    },
];

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>

                <div className="container hero-content">
                    <div className="hero-text animate-slide-up">
                        <h1>
                            Find the perfect <span className="text-gradient">freelancer</span> for your next project
                        </h1>
                        <p className="hero-subtitle">
                            Connect with talented professionals from around the world.
                            Get quality work done faster than ever before.
                        </p>

                        <div className="hero-search">
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search for services..."
                                    className="search-input"
                                />
                            </div>
                            <Button variant="primary" size="lg">
                                Search
                            </Button>
                        </div>

                        <div className="hero-tags">
                            <span className="tag-label">Popular:</span>
                            <Link to="/gigs?category=programming" className="hero-tag">Web Development</Link>
                            <Link to="/gigs?category=design" className="hero-tag">Logo Design</Link>
                            <Link to="/gigs?category=writing" className="hero-tag">Content Writing</Link>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Active Freelancers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100K+</span>
                            <span className="stat-label">Projects Completed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4.9</span>
                            <span className="stat-label">Average Rating</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Browse by Category</h2>
                        <p>Find the best freelancers for any skill you need</p>
                    </div>

                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <Link
                                to={`/gigs?category=${category.name.toLowerCase()}`}
                                key={index}
                            >
                                <Card variant="gradient" padding="md" hover className="category-card">
                                    <div className="category-icon">{category.icon}</div>
                                    <h4 className="category-name">{category.name}</h4>
                                    <span className="category-count">{category.count} services</span>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose FreelanceHub?</h2>
                        <p>The best freelancing experience awaits you</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <Card variant="glass" padding="lg" key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <Card variant="gradient" padding="none" className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to get started?</h2>
                            <p>Join thousands of freelancers and clients already using FreelanceHub</p>
                            <div className="cta-buttons">
                                <Link to="/signup">
                                    <Button variant="primary" size="lg" icon={<FiArrowRight />}>
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/gigs">
                                    <Button variant="secondary" size="lg">
                                        Browse Gigs
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default Home;
