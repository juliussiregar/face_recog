import { useState, useContext, createContext } from 'react';
import authService from '../services/authService'; // Pastikan Anda memiliki authService untuk API autentikasi

// Membuat context untuk autentikasi
const AuthContext = createContext(null);

// Custom hook untuk menyediakan dan mengelola state autentikasi
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider untuk membungkus aplikasi dan menyediakan state autentikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      // Simpan token atau data lain yang diperlukan, misalnya:
      // localStorage.setItem('token', response.data.token);
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi logout
  const logout = () => {
    setUser(null);
    // Hapus token atau data lain yang terkait dengan sesi pengguna
    // localStorage.removeItem('token');
  };

  // Fungsi untuk mendapatkan status autentikasi
  const isAuthenticated = () => {
    return !!user;
  };

  // Nilai yang akan disediakan oleh context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};