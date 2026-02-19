import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'client',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                userType: formData.userType,
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="auth-container">
                <Card variant="glass" padding="lg" className="auth-card animate-slide-up">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join thousands of freelancers and clients</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* User Type Selection */}
                        <div className="user-type-selector">
                            <button
                                type="button"
                                className={`type-option ${formData.userType === 'client' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
                            >
                                <span className="type-icon">💼</span>
                                <span className="type-label">I'm a Client</span>
                                <span className="type-desc">Hiring for a project</span>
                            </button>
                            <button
                                type="button"
                                className={`type-option ${formData.userType === 'freelancer' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, userType: 'freelancer' }))}
                            >
                                <span className="type-icon">🚀</span>
                                <span className="type-label">I'm a Freelancer</span>
                                <span className="type-desc">Looking for work</span>
                            </button>
                        </div>

                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            icon={<FiUser />}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={<FiMail />}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            icon={<FiLock />}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            icon={<FiLock />}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            icon={<FiArrowRight />}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Log in</Link></p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
