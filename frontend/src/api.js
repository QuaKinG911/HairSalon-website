// Same-origin when served by FastAPI; Vite dev proxies /api to the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE ?? '/api';
/** Starlette mounts collection routes with a trailing slash; normalize so /api/services works. */
function normalizeApiPath(endpoint) {
    const q = endpoint.includes('?') ? endpoint.slice(endpoint.indexOf('?')) : '';
    const path = q ? endpoint.slice(0, endpoint.indexOf('?')) : endpoint;
    const roots = new Set([
        '/users',
        '/services',
        '/barbers',
        '/bookings',
        '/messages',
        '/contact',
    ]);
    if (roots.has(path) && !path.endsWith('/')) {
        return `${path}/${q}`;
    }
    return endpoint;
}
function apiErrorMessage(body) {
    const d = body.detail;
    if (typeof d === 'string')
        return d;
    if (Array.isArray(d)) {
        return d
            .map((x) => x?.msg || x?.type)
            .filter(Boolean)
            .join(', ');
    }
    if (typeof body.error === 'string')
        return body.error;
    return '';
}
// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const text = await response.text();
        let parsed = {};
        if (text) {
            try {
                parsed = JSON.parse(text);
            }
            catch {
                /* non-JSON e.g. proxy HTML */
            }
        }
        const fromBody = apiErrorMessage(parsed);
        const fallback = `${response.status} ${response.statusText}`.trim();
        throw new Error(fromBody || fallback || 'API request failed');
    }
    return response.json();
};
// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};
// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${normalizeApiPath(endpoint)}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
        ...options,
    };
    const response = await fetch(url, config);
    return handleResponse(response);
};
// Auth API
export const authAPI = {
    login: (email, password) => apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),
    register: (email, password, name, phone) => apiRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone }),
    }),
    validate: () => apiRequest('/users/validate'),
};
// Services API
export const servicesAPI = {
    getAll: () => apiRequest('/services'),
    getById: (id) => apiRequest(`/services/${id}`),
    create: (service) => apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(service),
    }),
    update: (id, service) => apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(service),
    }),
    delete: (id) => apiRequest(`/services/${id}`, {
        method: 'DELETE',
    }),
};
// Barbers API
export const barbersAPI = {
    getAll: () => apiRequest('/barbers'),
    getById: (id) => apiRequest(`/barbers/${id}`),
    create: (barber) => apiRequest('/barbers', {
        method: 'POST',
        body: JSON.stringify(barber),
    }),
    update: (id, barber) => apiRequest(`/barbers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(barber),
    }),
    delete: (id) => apiRequest(`/barbers/${id}`, {
        method: 'DELETE',
    }),
};
// Bookings API
export const bookingsAPI = {
    getAll: () => apiRequest('/bookings'),
    getById: (id) => apiRequest(`/bookings/${id}`),
    getByCustomer: (customerId) => apiRequest(`/bookings/customer/${customerId}`),
    create: (booking) => apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
    }),
    updateStatus: (id, status) => apiRequest(`/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),
    delete: (id) => apiRequest(`/bookings/${id}`, {
        method: 'DELETE',
    }),
    checkAvailability: (date, time, barberId) => apiRequest(`/bookings/check-availability?date=${date}&time=${time}${barberId ? `&barberId=${barberId}` : ''}`),
};
// Contact API
export const contactAPI = {
    getAll: () => apiRequest('/contact'),
    getById: (id) => apiRequest(`/contact/${id}`),
    create: (message) => apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(message),
    }),
    markAsRead: (id) => apiRequest(`/contact/${id}/read`, {
        method: 'PUT',
    }),
    delete: (id) => apiRequest(`/contact/${id}`, {
        method: 'DELETE',
    }),
};
// Messages API
export const messagesAPI = {
    getMyMessages: () => apiRequest('/messages/my-messages'),
    getConversation: (otherUserId) => apiRequest(`/messages/conversation/${otherUserId}`),
    send: (senderId, message) => apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({
            sender_id: senderId,
            recipient_id: message.recipientId,
            subject: message.subject,
            content: message.content,
        }),
    }),
    markAsRead: (id) => apiRequest(`/messages/${id}/read`, {
        method: 'PUT',
    }),
    delete: (id) => apiRequest(`/messages/${id}`, {
        method: 'DELETE',
    }),
};
// Users API
export const usersAPI = {
    getAll: () => apiRequest('/users'),
    getById: (id) => apiRequest(`/users/${id}`),
};
