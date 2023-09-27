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
      const response = await axiosInstance.post('/api/signin', { 
        email: formData.email,
        // hash password
        password: SHA256(formData.password).toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: SHA256(formData.phone).toString(),
        netId: SHA256(formData.netId).toString(),
        //check to see if hash is needed, dont know specifically what to take from bg check
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
};

export default FrontAPI;
