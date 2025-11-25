// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
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
  login: (email: string, password: string) =>
    apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string, phone?: string) =>
    apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    }),

  validate: () => apiRequest('/users/validate'),
};

// Services API
export const servicesAPI = {
  getAll: () => apiRequest('/services'),
  getById: (id: string) => apiRequest(`/services/${id}`),
  create: (service: any) => apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(service),
  }),
  update: (id: string, service: any) => apiRequest(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(service),
  }),
  delete: (id: string) => apiRequest(`/services/${id}`, {
    method: 'DELETE',
  }),
};

// Barbers API
export const barbersAPI = {
  getAll: () => apiRequest('/barbers'),
  getById: (id: string) => apiRequest(`/barbers/${id}`),
  create: (barber: any) => apiRequest('/barbers', {
    method: 'POST',
    body: JSON.stringify(barber),
  }),
  update: (id: string, barber: any) => apiRequest(`/barbers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(barber),
  }),
  delete: (id: string) => apiRequest(`/barbers/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => apiRequest('/bookings'),
  getById: (id: string) => apiRequest(`/bookings/${id}`),
  getByCustomer: (customerId: string) => apiRequest(`/bookings/customer/${customerId}`),
  create: (booking: any) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  }),
  updateStatus: (id: string, status: string) => apiRequest(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id: string) => apiRequest(`/bookings/${id}`, {
    method: 'DELETE',
  }),
};

// Contact API
export const contactAPI = {
  getAll: () => apiRequest('/contact'),
  getById: (id: string) => apiRequest(`/contact/${id}`),
  create: (message: any) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(message),
  }),
  markAsRead: (id: string) => apiRequest(`/contact/${id}/read`, {
    method: 'PUT',
  }),
  delete: (id: string) => apiRequest(`/contact/${id}`, {
    method: 'DELETE',
  }),
};

// Messages API
export const messagesAPI = {
  getMyMessages: () => apiRequest('/messages/my-messages'),
  getConversation: (otherUserId: string) => apiRequest(`/messages/conversation/${otherUserId}`),
  send: (message: { recipientId: number; subject: string; content: string }) => apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  }),
  markAsRead: (id: string) => apiRequest(`/messages/${id}/read`, {
    method: 'PUT',
  }),
  delete: (id: string) => apiRequest(`/messages/${id}`, {
    method: 'DELETE',
  }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id: string) => apiRequest(`/users/${id}`),
};