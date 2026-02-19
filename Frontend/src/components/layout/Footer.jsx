import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">
                                Freelance<span className="text-gradient">Hub</span>
                            </span>
                        </Link>
                        <p className="footer-description">
                            The ultimate platform connecting talented freelancers with clients worldwide.
                            Build your dream team or find your next opportunity.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Twitter">
                                <FiTwitter />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <FiLinkedin />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <FiInstagram />
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <FiGithub />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <h4 className="footer-title">For Clients</h4>
                        <ul>
                            <li><Link to="/gigs">Browse Gigs</Link></li>
                            <li><Link to="/freelancers">Find Talent</Link></li>
                            <li><Link to="/how-it-works">How It Works</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">For Freelancers</h4>
                        <ul>
                            <li><Link to="/signup">Become a Seller</Link></li>
                            <li><Link to="/resources">Resources</Link></li>
                            <li><Link to="/community">Community</Link></li>
                            <li><Link to="/success-stories">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4 className="footer-title">Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p className="copyright">
                        © {currentYear} FreelanceHub. All rights reserved.
                    </p>
                    <div className="footer-legal">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/cookies">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
