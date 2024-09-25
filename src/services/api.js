import axios from 'axios';

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL+ '/api/v1' || 'http://127.0.0.1:5000/api', // Pastikan baseURL benar
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request (dihapus karena tidak perlu autentikasi)
api.interceptors.request.use(
  (config) => {
    // Hanya kembalikan config tanpa menambahkan Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response (dihapus karena tidak perlu otorisasi)
api.interceptors.response.use(
  (response) => response, // Jika response berhasil, kembalikan response
  (error) => {
    // Jika terjadi error, kembalikan error secara langsung
    return Promise.reject(error);
  }
);

export default api;