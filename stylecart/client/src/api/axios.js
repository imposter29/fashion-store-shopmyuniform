import axios from 'axios';

// Central axios instance. baseURL '/api' is proxied to the Express server in
// dev (see vite.config.js). withCredentials sends the httpOnly auth cookie.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
