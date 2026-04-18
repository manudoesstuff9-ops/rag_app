import axios from 'axios';

// Determine API base URL based on environment
const getApiUrl = () => {
  // In Docker, use the service name
  if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
    return 'http://backend:5000';
  }
  // In development or on localhost, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
