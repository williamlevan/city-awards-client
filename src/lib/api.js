import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// --- AUTHENTICATION ROUTES ---
export const registerUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/register`, { email, password });
        return response.data; // Returns { message, user }
    } catch (error) {
        throw error.response?.data?.message || 'Registration failed';
    }
};

export const refreshToken = async (refreshToken) => {
    try {
        console.log("Attempting manual token refresh...", refreshToken);
        const response = await axios.post(`${API_BASE_URL}/api/users/refresh`, { refreshToken });

        if (response.data?.accessToken) {
            console.log("New token received:", response.data.accessToken);
            return {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            };
        } else {
            console.error("Token refresh failed: No new token received.");
            return null;
        }
    } catch (error) {
        console.error("Manual token refresh failed:", error.response?.data || error.message);
        return null;
    }
};

// --- BALLOTS ROUTES ---
export const getBallotById = async (token, id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/ballots/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching ballot:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Ballot submission failed';
    }
};

export const createBallot = async (token, ballot) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/ballots`, {
            userId: ballot.userId,
            name: ballot.name,
            awards: ballot.awards
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating ballot:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Create ballot failed';
    }
};

export const updateBallot = async (token, ballotId, ballot) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/ballots/${ballotId}`, {
            userId: ballot.userId,
            name: ballot.name,
            awards: ballot.awards
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Ballot update response:", response);
        return response.data;
    } catch (error) {
        console.error("Error updating ballot:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Ballot update failed';
    }
};

export const getBallots = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/ballots`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching ballots:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Get ballots failed';
    }
};

// --- AWARDS ROUTES ---
export const getAwards = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/awards`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching awards:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Get awards failed';
    }
};