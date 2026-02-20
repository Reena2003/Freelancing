import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Ensure URL ends with a slash so Axios path joining works correctly
if (!API_BASE_URL.endsWith('/')) {
    API_BASE_URL += '/';
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authAPI = {
    login: (data) => api.post('auth/login', data),
    signup: (data) => api.post('auth/signup', data),
    getCurrentUser: () => api.get('auth/me'),
};

// ============ GIGS API ============
export const gigsAPI = {
    getAll: (params) => api.get('gigs', { params }),
    getById: (id) => api.get(`gigs/${id}`),
    create: (data) => api.post('gigs', data),
    update: (id, data) => api.put(`gigs/${id}`, data),
    delete: (id) => api.delete(`gigs/${id}`),
    getMyGigs: () => api.get('gigs/my'),
    getByFreelancer: (id) => api.get(`gigs/freelancer/${id}`),
};

// ============ ORDERS API ============
export const ordersAPI = {
    create: (data) => api.post('orders', data),
    getMyOrders: () => api.get('orders/my'),
    getReceivedOrders: () => api.get('orders/received'),
    getById: (id) => api.get(`orders/${id}`),
    updateStatus: (id, status) => api.put(`orders/${id}/status`, { status }),
    complete: (id) => api.put(`orders/${id}/complete`),
    cancel: (id) => api.put(`orders/${id}/cancel`),
};

// ============ USERS API ============
export const usersAPI = {
    getProfile: (id) => api.get(`users/${id}`),
    updateProfile: (data) => api.put('users/profile', data),
    getFreelancers: () => api.get('users/freelancers'),
    deleteAccount: () => api.delete('users/profile'),
};

// ============ REVIEWS API ============
export const reviewsAPI = {
    create: (data) => api.post('reviews', data),
    getByGig: (gigId) => api.get(`reviews/gig/${gigId}`),
    getByUser: (userId) => api.get(`reviews/user/${userId}`),
};

// ============ MESSAGES API ============
export const messagesAPI = {
    getConversations: () => api.get('messages/conversations'),
    getMessages: (orderId) => api.get(`messages/order/${orderId}`),
    getMessagesByGig: (gigId, clientId) => api.get(`messages/gig/${gigId}${clientId ? `?clientId=${clientId}` : ''}`),
    sendMessage: (data) => api.post('messages', data),
    markAsRead: (id) => api.put(`messages/${id}/read`),
    getUnreadCount: () => api.get('messages/unread'),
};

export default api;
