import axios from 'axios';
import { SHA256 } from 'crypto-js';

const baseURL = 'http://127.0.0.1:5000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// interceptor to send session cookie with every request
//axiosInstance.interceptors.request.use((config) => {
  // ensure that config.headers is initialized
  // initialize if not defined
  //config.headers = config.headers || {}; 

  // get session cookie from local storage
  //const sessionCookie = localStorage.getItem('sessionCookie');

  // add  session cookie to headers
  //config.headers.common['Cookie'] = sessionCookie;

  //return config;
//});

// api functions
const FrontAPI = {
  
  // send sign up info
  signUp: async (formData, isTutor) => {
    try {
      let endpoint = '/api/v1/signup';
      let response = null;

      // tutor
      if (isTutor) {
        endpoint += '/tutor'

        response = await axiosInstance.post(endpoint, {
          //hash password
          password: SHA256(formData.password).toString(),
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_num: formData.phone,
          netID: formData.netId,
          criminal: formData.criminal,
          //criminal: formData.criminalHistory,
          // pendingCharges: formData.pendingCharges,
          // probationOrParole: formData.probationOrParole,
          // sexOffenderRegistry: formData.sexOffenderRegistry,
          // outstandingWarrants: formData.outstandingWarrants,
          // authorizationBackgroundCheck: formData.authorizationBackgroundCheck,
        });
      }

      // user
      else {
        endpoint += '/user'

        response = await axiosInstance.post(endpoint, {
          //hash password
          password: SHA256(formData.password).toString(),
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_num: formData.phone,
          netID: formData.netId,
          // criminalHistory: formData.criminalHistory,
          // pendingCharges: formData.pendingCharges,
          // probationOrParole: formData.probationOrParole,
          // sexOffenderRegistry: formData.sexOffenderRegistry,
          // outstandingWarrants: formData.outstandingWarrants,
          // authorizationBackgroundCheck: formData.authorizationBackgroundCheck,
        });
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

  // send sign in info for checking
  signIn: async (formData) => {
    try {
      let response;
      if (formData.userType === "student") {
        response = await axiosInstance.post('/api/v1/login/user', {
          email: formData.email,
          password: SHA256(formData.password).toString(),
        });
      } else {
          response = await axiosInstance.post('/api/v1/login/tutor', {
            email: formData.email,
            password: SHA256(formData.password).toString(),
          });
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

  //get tutors of the chosen subject
  fetchTutors: async (subject) => {
    try {
      const response = await axiosInstance.get('/api/v1/subj_tutors', {
        params: {
          subject: subject,
        },  data:{
          message: 'dummy'
        }
      });
      console.log(response);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

  // get available subjects
  fetchSubjects: async (session_id) => {
    try {
      const response = await axiosInstance.get('/api/v1/subjects', {
        params: {
          session_id: session_id
        }, data:{
          message: 'dummy'
        }
      });
      console.log(response);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

  // get timeslot of tutor using tutor_id
  fetchTimeSlots: async (tutor) => {
    try {
      const response = await axiosInstance.get('/api/v1/tutor_timeslots', {
        params: {
          tutor_id: tutor,
        },  data:{
          message: 'dummy'
        }
      });
      console.log(response);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },
  
  // create a new appointment
  createAppointment: async (formData, session_id) => {
    try {
      const response = await axiosInstance.post('/api/v1/create/appointment', {
        session_id: session_id,
        subject: formData.subject,
        tutor: formData.tutor,
        timeSlot: formData.timeSlot,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

  // verify session is valid
  verifySession: async (session_id) => {
    try {
      // POST request to /verify_session endpoint
      const response = await axiosInstance.post('/verify_session', {
        params: {
          session_id: session_id
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.data.status_code;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.data.status_code;
      } else {
        console.error('Error message:', error.message);
        return error.data.status_code;
      }
    }
  },

};

export default FrontAPI;
