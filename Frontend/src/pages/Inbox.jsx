import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiSearch, FiUser } from 'react-icons/fi';
import { messagesAPI } from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import './Inbox.css';

const Inbox = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await messagesAPI.getConversations();
            setConversations(response.data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.order.gig.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="inbox-loading">
                <Loader size="lg" text="Loading conversations..." />
            </div>
        );
    }

    return (
        <div className="inbox-page">
            <div className="container">
                <div className="inbox-header">
                    <h1>Messages</h1>
                    <div className="search-messages">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search people or gigs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {conversations.length > 0 ? (
                    <div className="conversations-list">
                        {filteredConversations.map((conv, index) => {
                            const chatLink = conv.type === 'order'
                                ? `/chat/${conv.orderId}`
                                : `/chat/gig/${conv.gig?._id}`;
                            const uniqueKey = conv.orderId || `${conv.gig?._id}-${conv.otherUser?._id}`;

                            return (
                                <Link to={chatLink} key={uniqueKey} className="conversation-link">
                                    <Card padding="md" hover className={`conversation-card ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                                        <div className="conv-user-img">
                                            {conv.otherUser?.profilePicture ? (
                                                <img src={conv.otherUser.profilePicture} alt={conv.otherUser.name} />
                                            ) : (
                                                <div className="user-avatar-placeholder">
                                                    {conv.otherUser?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            {conv.unreadCount > 0 && <span className="unread-dot"></span>}
                                        </div>
                                        <div className="conv-content">
                                            <div className="conv-top">
                                                <h4>{conv.otherUser?.name}</h4>
                                                <span className="conv-time">
                                                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <div className="conv-gig">
                                                <FiMessageSquare /> {conv.gig?.title || 'Inquiry'}
                                                {conv.type === 'inquiry' && <span className="inquiry-badge">Inquiry</span>}
                                            </div>
                                            <div className="conv-last-msg">
                                                {conv.lastMessage?.message}
                                            </div>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="unread-badge">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card variant="glass" padding="lg" className="empty-inbox">
                        <div className="empty-icon">✉️</div>
                        <h3>No messages yet</h3>
                        <p>Once you start a project or order a gig, your messages will appear here.</p>
                        <Link to="/gigs">
                            <button className="primary-btn">Browse Gigs</button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Inbox;
