import api from './api';

const faceRecognitionService = {
  // Fungsi untuk mengirim gambar dan mendapatkan hasil pengenalan wajah
  recognize: async (base64Image) => {
    try {
      // Kirim base64Image sebagai payload JSON
      const response = await api.post('/face-recognition', { image: base64Image }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from face recognition service');
      }
    } catch (error) {
      console.error('Error in face recognition:', error);
      throw new Error('Failed to recognize face. Please try again later.');
    }
  },
};

export default faceRecognitionService;