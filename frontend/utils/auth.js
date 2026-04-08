// Default users for testing
const DEFAULT_USERS = [
    {
        id: 'admin-1',
        email: 'admin@hairsalon.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
    },
    {
        id: 'barber-1',
        email: 'barber@hairsalon.com',
        password: 'barber123',
        role: 'barber',
        name: 'John Barber',
        phone: '+1234567890',
    },
    {
        id: 'customer-1',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        name: 'Jane Customer',
        phone: '+0987654321',
    },
];
// Initialize users in localStorage
export const initializeUsers = () => {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
        localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }
};
// Get all users
export const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : DEFAULT_USERS;
};
// Authenticate user
export const authenticateUser = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
};
// Get current user from session
export const getCurrentUser = () => {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
};
// Set current user in session
export const setCurrentUser = (user) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
};
// Logout user
export const logoutUser = () => {
    sessionStorage.removeItem('currentUser');
};
// Check if user is authenticated
export const isAuthenticated = () => {
    return getCurrentUser() !== null;
};
// Check if user has specific role
export const hasRole = (role) => {
    const user = getCurrentUser();
    return user?.role === role;
};
// Register new user (customer only)
export const registerUser = (email, password, name, phone) => {
    const users = getUsers();
    const newUser = {
        id: `customer-${Date.now()}`,
        email,
        password,
        role: 'customer',
        name,
        phone,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
};
