import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create a new instance of axios with a custom 
// This will help us to avoid repeating the same code for each request
// An Axios instance is a custom version of axios with Preconfigured setings eg baseURL, headers, Interceptors, timeout etc
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    });

// Add a request interceptor to include auth token
// Interceptors allow modifying requests and responses before they are handled 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
},
(error)=>{
    return Promise.reject(error);
}
);

export default api;