import axios from 'axios';
import { SHA256 } from 'crypto-js';

const baseURL = 'https://your-backend-api-url.com';

const axiosInstance = axios.create({
  baseURL,
});

// api functions
const FrontAPI = {
  signIn: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/signin', { 
        email: formData.email,
        // hash password
        password: SHA256(formData.password).toString(),
    });
      return response.data;
    } 
    catch (error) {
      throw error;
    }
  },
  
  signUp: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/signup', { 
        // hash password
        password: SHA256(formData.password).toString(),
        // encrpyt the rest
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        netId: formData.netId,
        criminalHistory: formData.criminalHistory,
        pendingCharges: formData.pendingCharges,
        probationOrParole: formData.probationOrParole,
        sexOffenderRegistry: formData.sexOffenderRegistry,
        outstandingWarrants: formData.outstandingWarrants,
        authorizationBackgroundCheck: formData.authorizationBackgroundCheck,
    });
      return response.data;
    } 
    catch (error) {
      throw error;
    }
  },

  fetchTutors: async (subject) => {
    try {
      const response = await axiosInstance.get('/api/tutors', {
        params: {
          subject: subject,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  fetchSubjects: async () => {
    try {
      const response = await axiosInstance.get('/api/subjects');
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

};

export default FrontAPI;
