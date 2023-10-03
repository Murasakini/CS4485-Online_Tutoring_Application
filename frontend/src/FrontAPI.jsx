import axios from 'axios';
import { SHA256 } from 'crypto-js';

const baseURL = 'https://your-backend-api-url.com';

const axiosInstance = axios.create({
  baseURL,
});

// api functions
const FrontAPI = {

  // send sign in info for checking
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

  // send sign up info
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

  //get tutors of the chosen subject
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

  // get available subjects
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

  // get timeslot of the subject, tutor combination
  fetchTimeSlots: async (tutor, subject) => {
    try {
      const response = await axiosInstance.get('/api/timeslots', {
        params: {
          tutor: tutor,
          subject: subject,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // create a new appointment
  createAppointment: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/appointments', {
        subject: formData.subject,
        tutor: formData.tutor,
        timeSlot: formData.timeSlot,
        // Add other appointment-related data here
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },  
};

export default FrontAPI;
