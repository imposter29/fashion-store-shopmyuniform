import axios from 'axios';

// In development, baseURL is '/api' and Vite proxies it to the local server.
// In production (split deploy) set VITE_API_URL to the Render API base,
// e.g. https://stylecart-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

// Central axios instance. withCredentials sends/receives the httpOnly auth
// cookie across origins (requires CORS credentials + sameSite:'none' server-side).
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
