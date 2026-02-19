import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiMoreVertical, FiPaperclip, FiInfo } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { messagesAPI, ordersAPI, gigsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import './Chat.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
    const { orderId, gigId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const scrollRef = useRef();
    const socket = useRef();

    const [order, setOrder] = useState(null);
    const [gig, setGig] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    useEffect(() => {
        // Initialize Socket
        socket.current = io(SOCKET_URL, {
            withCredentials: true,
        });

        const roomId = orderId || `inquiry_${gigId}_${user._id}`;
        socket.current.emit('joinRoom', roomId);

        socket.current.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.current.on('userTyping', (data) => {
            if (data.userId !== user._id) {
                setOtherUserTyping(data.isTyping);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [orderId, gigId]);

    useEffect(() => {
        fetchChatData();
    }, [orderId, gigId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChatData = async () => {
        setLoading(true);
        try {
            if (orderId) {
                const [orderRes, messagesRes] = await Promise.all([
                    ordersAPI.getById(orderId),
                    messagesAPI.getMessages(orderId)
                ]);
                setOrder(orderRes.data.order);
                setMessages(messagesRes.data.messages || []);
            } else if (gigId) {
                const [gigRes, messagesRes] = await Promise.all([
                    gigsAPI.getById(gigId),
                    messagesAPI.getMessagesByGig(gigId)
                ]);
                setGig(gigRes.data.gig);
                setMessages(messagesRes.data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch chat data:', error);
            navigate('/inbox');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            orderId: orderId || null,
            gigId: gigId || null,
            message: newMessage,
        };

        try {
            const response = await messagesAPI.sendMessage(messageData);
            const sentMessage = response.data.data;

            // Send via socket for real-time
            socket.current.emit('sendMessage', sentMessage);

            setNewMessage('');
            handleTyping(false);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleTyping = (typing) => {
        setIsTyping(typing);
        const roomId = orderId || `inquiry_${gigId}_${user._id}`;
        socket.current.emit('typing', { orderId: orderId || null, gigId: gigId || null, userId: user._id, isTyping: typing });
    };

    if (loading) return <div className="chat-loading"><Loader size="lg" /></div>;

    const otherUser = orderId
        ? (user._id === order?.clientId?._id ? order?.freelancerId : order?.clientId)
        : (user._id === gig?.freelancerId?._id ? null : gig?.freelancerId); // Potential client always sees freelancer

    const chatTitle = orderId ? order?.gigId?.title : gig?.title;

    return (
        <div className="chat-page">
            <div className="container chat-container">
                <Card className="chat-window" padding="none">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <button onClick={() => navigate('/inbox')} className="chat-back-btn">
                                <FiArrowLeft />
                            </button>
                            <div className="chat-user-info">
                                <div className="user-avatar-small">
                                    {otherUser?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3>{otherUser?.name}</h3>
                                    <span className="gig-mini-title">{chatTitle}</span>
                                </div>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <button className="chat-icon-btn"><FiInfo /></button>
                            <button className="chat-icon-btn"><FiMoreVertical /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="messages-area">
                        {messages.map((msg, index) => {
                            const isMe = msg.senderId?._id === user?._id;
                            return (
                                <div key={msg._id || index} className={`message-wrapper ${isMe ? 'me' : 'them'}`}>
                                    {!isMe && (
                                        <div className="message-avatar">
                                            {msg.senderId?.profilePicture ? (
                                                <img src={msg.senderId.profilePicture} alt="" />
                                            ) : (
                                                msg.senderId?.name?.charAt(0) || '?'
                                            )}
                                        </div>
                                    )}
                                    <div className="message-bubble">
                                        <p>{msg.message}</p>
                                        <span className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {otherUserTyping && (
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="chat-input-area">
                        <button type="button" className="attachment-btn">
                            <FiPaperclip />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping(e.target.value.length > 0);
                            }}
                            onBlur={() => handleTyping(false)}
                        />
                        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                            <FiSend />
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Chat;
