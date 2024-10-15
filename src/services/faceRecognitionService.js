import api from './api';

const faceRecognitionCIService = {
  // Fungsi untuk mengirim gambar dan mendapatkan hasil pengenalan wajah
  identify_face:async(base64Image)=>{
    console.log(base64Image)
    try {
      // Kirim base64Image sebagai payload JSON
      const response = await api.post('/identify-face-visitor', { image: base64Image }, {
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
  recognize: async (base64Image) => {
    try {
      // Kirim base64Image sebagai payload JSON
      const response = await api.post('/attendance/check-in', { image: base64Image }, {
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
      throw new Error('You are already checked in and has not checked out yet.');
    }
  },
  checkout: async (base64Image) => {
    try {
      const response = await api.put('/attendance/check-out', { image: base64Image }, {
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


export default faceRecognitionCIService;