import axios from 'axios';
import { SHA256 } from 'crypto-js';

const baseURL = '';
// const baseURL = 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'withCredentials': 'True'
  }
});

// TODO: 2 last returns in catch block is iffy. need looking into bcs they do not neccessarily have status_code

// api functions
const FrontAPI = {
  "baseURL": baseURL,
  
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
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // send sign in info for checking
  signIn: async (formData) => {
    try {
      let response;
      let response_2fa; // for 2fa reponse
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
      ////// 2FA call //////
      if (response.status === 200) {
        response_2fa = await axiosInstance.post('/api/v1/TwoFactorAuthentication/SendEmail', {
          userType: formData.userType, 
          email: formData.email
        }); // dont know what to do with response_2fa
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // validate 2FA code
  validate2FA: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/v1/TwoFactorAuthentication/validate', {
        code: formData.code,
        email: formData.email,
        userType: formData.userType
      });

      return response.data;
    } catch (error) {
      // Copied from signIn
      if (error.response) { 
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.response.data;
      } else {
        console.error('Error message:', error.message);
        return error.response.data;
      }
    }
  },

  // resends 2FA code 
  resend2FA: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/v1/TwoFactorAuthentication/ResendCode', {
        email: formData.email,
        userType: formData.userType
      });

      return response
    } catch (error) {
      if (error.response) { 
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return error.response;
      } else {
        console.error('Error message:', error.message);
        return error.response;
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
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
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
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get timeslot of tutor using tutor_id
  fetchTimeSlots: async (tutor, session_id) => {
    try {
      const response = await axiosInstance.get('/api/v1/tutor_timeslots', {
        params: {
          tutor_id: tutor,
          session_id: session_id
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
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
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
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // create a tutor availability entry
  createAvailability: async (formData, session_id) => {
    try {
      const response = await axiosInstance.post('/api/v1/create/availability', {
        session_id: session_id,
        timeSlot: formData.timeSlot,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },


  // verify session is valid
  verifySession: async (session_id) => {
    try {
      // POST request to /verify_session endpoint
      const response = await axiosInstance.get('/api/v1/verify_session', {
        params: {
          session_id: session_id,
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get favorite tutors list
  getFavoriteTutors: async (session_id) => {
    try {
      // access endpoint and get data
      const response = await axiosInstance.get('/api/v1/favorite_tutors', {
        params: {
          session_id: session_id
        }, data:{
          message: 'dummy'
        }
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get favorite tutors list
  findTutors: async (search_data) => {
    try {
      // access endpoint and get data
      const response = await axiosInstance.post('/api/v1/find_tutors', search_data);

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get favorite tutors list
  addUserFavorite: async (session_id, tutor_id) => {
    try {
      // access endpoint and send data
      const response = await axiosInstance.post('/api/v1/add_favorite_tutors', {
        session_id: session_id,
        tutor_id: tutor_id
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // delete tutors from favorite list
  deleteUserFavorite: async (session_id, tutor_id) => {
    try {
      // access endpoint and send data
      const response = await axiosInstance.post('/api/v1/remove_favorite_tutor', {
        session_id: session_id,
        tutor_id: tutor_id
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  getMyProfile: async (session_id) => {
    try {
      // access endpoint and get data
      const response = await axiosInstance.get('/api/v1/my_profile', {
        params: {
          session_id: session_id
        }
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);

        return error.response.data

      } else if (error.request) {
        console.error('No response received:', error.request);

      } else {
        console.error('Error message:', error.message);
      }
    }
  },
 
  getTutorProfile: async (session_id, tutor_id) => {
    try {
      // access endpoint and get data
      const response = await axiosInstance.get('/api/v1/tutor_profile', {
        params: {
          session_id: session_id,
          tutor_id: tutor_id
        }
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data

      } else if (error.request) {
        console.error('No response received:', error.request);

      } else {
        console.error('Error message:', error.message);
      }
    }
  },

  // get # of total tutoring hours for logged in user
  getTotalHours: async (session_id) => {
    try {
      // POST request to /total_hours endpoint
      const response = await axiosInstance.get('/api/v1/total_hours', {
        params: {
          session_id: session_id,
        },  data:{
          message: 'dummy'
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
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get sorted leaderboard of all tutors and their hours
  fetchTutorLeaderboard: async () => {
    try {
      // POST request to /tutor_leaderboard endpoint
      const response = await axiosInstance.get('/api/v1/tutor_leaderboard', {
        data:{
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
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get sorted leaderboard of all users and their hours
  fetchUserLeaderboard: async () => {
    try {
      // POST request to /user_leaderboard endpoint
      const response = await axiosInstance.get('/api/v1/user_leaderboard', {
        data:{
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
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // fetch upcoming appointments for the current user
  fetchUpcomingAppointments: async (session_id) => {
    try {
      const response = await axiosInstance.get('/api/v1/upcoming_appointments', {
        params: {
          session_id: session_id,
        },  data:{
          message: 'dummy'
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
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // upload profile image
  uploadImage: async (session_id, uploadImage) => {
    // create header Content-Type with multipart/form-data instead of application/json
    const axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    try {
      // create form data to send to server
      const img = new FormData(); 
      img.append('file', uploadImage);  // file
      img.append('session_id', session_id);  // session id

      // access endpoint and get data
      const response = await axiosInstance.post('/api/v1/media_upload', img);

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data

      } else if (error.request) {
        console.error('No response received:', error.request);

      } else {
        console.error('Error message:', error.message);
      }
    }
  },

  // get profile image
  /*
  The api call is resided in MyProfile.js or TutorProfile.js due to the nature of the returned file 
  */
  
  // delete tutors from favorite list
  updateProfile: async (session_id, profile) => {
    try {
      // access endpoint and send data
      const response = await axiosInstance.post('/api/v1/update_profile', {
        session_id: session_id,
        profile: profile
      });

      //console.log(response)
      return response.data;

      // handle errors
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;

      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },

  // get a list of department
  getDepartments: async (session_id) => {
    try {
      // GET to get list of departments
      const response = await axiosInstance.get('/api/v1/get_departments', {
        params: {
          session_id: session_id,
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

  // get list of subjects along with their department
  getSubjectsOfDepartments: async (session_id, department_list) => {
    try {
      // POST request to /total_hours endpoint
      const response = await axiosInstance.post('/api/v1/get_subjects_of_departments', {
          session_id: session_id,
          departments: department_list
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

  // get list of subjects along with their department
  updateSubject: async (session_id, subjectList) => {
    try {
      // POST request to send updated subjects to the endpoint
      const response = await axiosInstance.post('/api/v1/update_profile', {
          session_id: session_id,
          updated_info: subjectList
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

  // logout
  logout: async (session_id) => {
    try {
      // POST request to /logout endpoint
      const response = await axiosInstance.post('/logout', {
        session_id: session_id,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('No response received:', error.request);
        return { status_code: -1, message: 'Network error occurred' };
      } else {
        console.error('Error message:', error.message);
        return { status_code: -1, message: 'Network error occurred' };
      }
    }
  },
};

export default FrontAPI;
