import axios from 'axios';

interface User {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

interface SignupData {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

export const authService = {
    async signup(user: SignupData) {
        try {
            const response = await axios.post('/api/signup', user);
            if (response.data) {
                localStorage.setItem('auth', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Signup failed');
            }
            throw error;
        }
    },

    async login(email: string, password: string) {
        try {
            const response = await axios.post('/api/login', { email, password });
            if (response.data) {
                localStorage.setItem('auth', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Login failed');
            }
            throw error;
        }
    },

    async updateProfile(email: string, updates: Partial<User>) {
        try {
            const response = await axios.put('/api/profile', { email, updates });
            if (response.data) {
                localStorage.setItem('auth', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Profile update failed');
            }
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('auth');
        window.location.href = '/login';
    },

    getSession() {
        if (typeof window === 'undefined') return null;
        const session = localStorage.getItem('auth');
        return session ? JSON.parse(session) : null;
    }
};