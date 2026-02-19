import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiBriefcase, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    return (
        <nav className="navbar glass-strong">
            <div className="container navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">
                        Freelance<span className="text-gradient">Hub</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    <Link to="/gigs" className="nav-link">Browse Gigs</Link>
                    <Link to="/freelancers" className="nav-link">Find Talent</Link>
                </div>

                {/* Auth Buttons / User Menu */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu">
                            <button
                                className="user-button"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="user-avatar">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{user.name}</span>
                            </button>

                            {showDropdown && (
                                <div className="dropdown-menu animate-slide-down">
                                    <Link
                                        to="/dashboard"
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FiGrid /> Dashboard
                                    </Link>
                                    {user.userType === 'freelancer' && (
                                        <Link
                                            to="/my-gigs"
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <FiBriefcase /> My Gigs
                                        </Link>
                                    )}
                                    <Link
                                        to="/inbox"
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FiMessageSquare /> Messages
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FiUser /> Profile
                                    </Link>
                                    <button className="dropdown-item danger" onClick={handleLogout}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button variant="primary">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu animate-slide-down">
                    <Link to="/gigs" className="mobile-link" onClick={() => setIsOpen(false)}>
                        Browse Gigs
                    </Link>
                    <Link to="/freelancers" className="mobile-link" onClick={() => setIsOpen(false)}>
                        Find Talent
                    </Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="mobile-link" onClick={() => setIsOpen(false)}>
                                Dashboard
                            </Link>
                            <Link to="/inbox" className="mobile-link" onClick={() => setIsOpen(false)}>
                                Messages
                            </Link>
                            <button className="mobile-link danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-link" onClick={() => setIsOpen(false)}>
                                Login
                            </Link>
                            <Link to="/signup" onClick={() => setIsOpen(false)}>
                                <Button variant="primary" fullWidth>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
