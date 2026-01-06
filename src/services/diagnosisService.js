import api from './api';

export const diagnosisService = {
  checkSymptoms: async (symptoms, age = null, gender = null) => {
    try {
      const symptomsArray = Array.isArray(symptoms) 
        ? symptoms 
        : symptoms.split(',').map(s => s.trim()).filter(s => s);

      const response = await api.post('/api/diagnosis/check', {
        symptoms: symptomsArray,
        age: age,
        gender: gender,
      });

      return response.data;
    } catch (error) {
      console.error('Diagnosis error:', error);
      
      if (error.response) {
        const errorDetail = error.response.data?.detail || 'Server error occurred';
        throw new Error(`Server error: ${errorDetail}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get('/api/diagnosis/');
      return response.data.message === 'Diagnosis API is running!';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },
};