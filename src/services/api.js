export const API_BASE_URL = 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('hk_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async handleResponse(response) {
        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
            console.warn('Authentication error (Expiry/Invalid). Redirecting to login...');
            localStorage.removeItem('hk_token');
            localStorage.removeItem('hk_user');
            // Use window.location as we are outside of React components here
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
            }
            throw new Error(result.error || 'Session expired. Please login again.');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }

        return result;
    },

    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    async patch(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    }
};
