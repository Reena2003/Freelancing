import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiPlus,
    FiBriefcase,
    FiShoppingCart,
    FiDollarSign,
    FiStar,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiClock,
    FiCheckCircle,
    FiGrid,
    FiMessageSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { gigsAPI, ordersAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import ReviewModal from '../components/modals/ReviewModal';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [myGigs, setMyGigs] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [receivedOrders, setReceivedOrders] = useState([]);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user?.userType === 'freelancer') {
                const [gigsRes, ordersRes] = await Promise.all([
                    gigsAPI.getMyGigs(),
                    ordersAPI.getReceivedOrders(),
                ]);
                setMyGigs(gigsRes.data.gigs || []);
                setReceivedOrders(ordersRes.data.orders || []);
            } else {
                const ordersRes = await ordersAPI.getMyOrders();
                setMyOrders(ordersRes.data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            toast.success(`Order ${newStatus.replace('_', ' ')}`);
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            await ordersAPI.complete(orderId);
            toast.success('Order completed and funds released!');
            fetchData();
        } catch (error) {
            console.error('Failed to complete order:', error);
            toast.error(error.response?.data?.message || 'Failed to complete order');
        }
    };

    const handleOpenReviewModal = (order) => {
        setSelectedOrder(order);
        setIsReviewModalOpen(true);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Header */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Welcome back, <span className="text-gradient">{user?.name}</span>!</h1>
                        <p>{user?.userType === 'freelancer' ? 'Manage your gigs and orders' : 'Track your orders and find talent'}</p>
                    </div>
                    {user?.userType === 'freelancer' && (
                        <Link to="/gigs/create">
                            <Button variant="primary" icon={<FiPlus />}>Create Gig</Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    {user?.userType === 'freelancer' ? (
                        <>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiBriefcase /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{myGigs.length}</span>
                                    <span className="stat-label">Active Gigs</span>
                                </div>
                            </Card>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiShoppingCart /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{receivedOrders.length}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                            </Card>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiDollarSign /></div>
                                <div className="stat-info">
                                    <span className="stat-value">₹{user?.walletBalance || 0}</span>
                                    <span className="stat-label">Earnings</span>
                                </div>
                            </Card>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiStar /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{user?.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="stat-label">Rating</span>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiShoppingCart /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{myOrders.length}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                            </Card>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiClock /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{myOrders.filter(o => o.status === 'in_progress' || o.status === 'pending').length}</span>
                                    <span className="stat-label">Active Orders</span>
                                </div>
                            </Card>
                            <Card variant="gradient" padding="md" className="stat-card">
                                <div className="stat-icon"><FiStar /></div>
                                <div className="stat-info">
                                    <span className="stat-value">{myOrders.filter(o => o.status === 'completed').length}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Freelancer Dashboard */}
                {user?.userType === 'freelancer' && (
                    <>
                        <section className="dashboard-section">
                            <div className="section-header">
                                <h2>My Gigs</h2>
                                <Link to="/gigs/create">
                                    <Button variant="ghost" size="sm" icon={<FiPlus />}>Add New</Button>
                                </Link>
                            </div>

                            {myGigs.length > 0 ? (
                                <div className="gigs-table">
                                    <div className="table-header">
                                        <span>Gig</span>
                                        <span>Views</span>
                                        <span>Orders</span>
                                        <span>Rating</span>
                                        <span>Status</span>
                                        <span>Actions</span>
                                    </div>
                                    {myGigs.map((gig) => (
                                        <div key={gig._id} className="table-row">
                                            <div className="gig-info">
                                                <img src={gig.images?.[0] || 'https://via.placeholder.com/60'} alt="" />
                                                <div>
                                                    <Link to={`/gigs/${gig._id}`}><h4>{gig.title}</h4></Link>
                                                    <span className="gig-price">₹{gig.price}</span>
                                                </div>
                                            </div>
                                            <span><FiEye /> {gig.views || 0}</span>
                                            <span>{gig.orders || 0}</span>
                                            <span><FiStar /> {gig.rating?.toFixed(1) || '0.0'}</span>
                                            <span className={`status-badge ${gig.status}`}>{gig.status}</span>
                                            <div className="actions">
                                                <Link to={`/gigs/${gig._id}/edit`}>
                                                    <button className="action-btn"><FiEdit2 /></button>
                                                </Link>
                                                <button className="action-btn danger"><FiTrash2 /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card variant="glass" padding="lg" className="empty-section">
                                    <p>No gigs yet. Create your first gig to start earning!</p>
                                    <Link to="/gigs/create">
                                        <Button variant="primary" icon={<FiPlus />}>Create Gig</Button>
                                    </Link>
                                </Card>
                            )}
                        </section>

                        <section className="dashboard-section">
                            <div className="section-header">
                                <h2>Received Orders</h2>
                            </div>

                            {receivedOrders.length > 0 ? (
                                <div className="orders-list">
                                    {receivedOrders.map((order) => (
                                        <Card key={order._id} variant="default" padding="md" className="order-card-detailed">
                                            <div className="order-main-info">
                                                <div className="order-header-info">
                                                    <h4>{order.gigId?.title || 'Order'}</h4>
                                                    <span className="order-client">Client: {order.clientId?.name}</span>
                                                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="order-status-price">
                                                    <span className={`status-badge ${order.status}`}>{order.status?.replace('_', ' ')}</span>
                                                    <span className="order-price">₹{order.price}</span>
                                                </div>
                                            </div>

                                            <div className="order-requirements-mini">
                                                <strong>Requirements:</strong>
                                                <p>{order.requirements}</p>
                                            </div>

                                            <div className="order-actions-row">
                                                {order.status === 'pending' && (
                                                    <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(order._id, 'accepted')}>Accept Order</Button>
                                                )}
                                                {order.status === 'accepted' && (
                                                    <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(order._id, 'in_progress')}>Start Work</Button>
                                                )}
                                                {order.status === 'in_progress' && (
                                                    <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(order._id, 'delivered')}>Deliver Work</Button>
                                                )}
                                                {order.status === 'delivered' && (
                                                    <span className="status-info-text">Waiting for client approval</span>
                                                )}
                                                {order.status === 'completed' && (
                                                    <span className="status-success-text">Order Completed ✅</span>
                                                )}
                                                <Link to={`/chat/${order._id}`}>
                                                    <Button size="sm" variant="ghost" icon={<FiMessageSquare />}>Message Client</Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card variant="glass" padding="lg" className="empty-section">
                                    <p>No orders yet. Share your gigs to get more orders!</p>
                                </Card>
                            )}
                        </section>
                    </>
                )}

                {/* Client Dashboard */}
                {user?.userType === 'client' && (
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>My Orders</h2>
                            <Link to="/gigs">
                                <Button variant="ghost" size="sm">Browse Gigs</Button>
                            </Link>
                        </div>

                        {myOrders.length > 0 ? (
                            <div className="orders-list">
                                {myOrders.map((order) => (
                                    <Card key={order._id} variant="default" padding="md" className="order-card-detailed">
                                        <div className="order-main-info">
                                            <div className="order-header-info">
                                                <h4>{order.gigId?.title || 'Order'}</h4>
                                                <span className="order-client">Freelancer: {order.freelancerId?.name}</span>
                                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="order-status-price">
                                                <span className={`status-badge ${order.status}`}>{order.status?.replace('_', ' ')}</span>
                                                <span className="order-price">₹{order.price}</span>
                                            </div>
                                        </div>

                                        <div className="order-actions-row">
                                            {order.status === 'delivered' && (
                                                <button
                                                    className="primary-btn sm"
                                                    onClick={() => handleCompleteOrder(order._id)}
                                                >
                                                    Approve & Complete
                                                </button>
                                            )}
                                            {order.status === 'completed' && !order.isReviewed && (
                                                <button
                                                    className="accent-btn sm"
                                                    onClick={() => handleOpenReviewModal(order)}
                                                >
                                                    Leave Review
                                                </button>
                                            )}
                                            {order.status === 'completed' && order.isReviewed && (
                                                <span className="status-success-text">Review Submitted ✅</span>
                                            )}
                                            {order.status !== 'completed' && order.status !== 'delivered' && (
                                                <span className="status-info-text">Freelancer is working on it</span>
                                            )}
                                            <Link to={`/chat/${order._id}`}>
                                                <Button size="sm" variant="ghost" icon={<FiMessageSquare />}>Message Freelancer</Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card variant="glass" padding="lg" className="empty-section">
                                <p>No orders yet. Browse gigs to find talented freelancers!</p>
                                <Link to="/gigs">
                                    <Button variant="primary">Browse Gigs</Button>
                                </Link>
                            </Card>
                        )}
                    </section>
                )}
            </div>

            {selectedOrder && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    order={selectedOrder}
                    onReviewSubmitted={fetchData}
                />
            )}
        </div>
    );
};

export default Dashboard;
