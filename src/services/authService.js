import api from './api';

const authService = {
  // Fungsi untuk mendaftarkan pengguna baru
  // register: async (userData) => {
  //   try {
  //     const response = await api.post('/auth/register', userData);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || 'Registration failed. Please try again.';
  //   }
  // },

  // Fungsi untuk mendaftarkan visitor baru oleh admin (atau siapa pun) tanpa login
  registerVisitor: async (visitorData) => {
    try {
      console.log('Data being sent to backend:', visitorData);
      
      // Kirim data visitor tanpa base64 gambar
      const response = await api.post('/register/visitor', visitorData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error during visitor registration:', error.response?.data || error.message);
      throw error.response?.data || 'Visitor registration failed. Please try again.';
    }
  },
};

export default authService;