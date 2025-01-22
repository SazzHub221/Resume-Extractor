const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://resume-extractor-backend.onrender.com/api',
  WS_URL: isDevelopment 
    ? 'ws://localhost:10000/ws'
    : null 
}; 