import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FrontAPI from './api/FrontAPI';
import CalendarDisplay from './components/CalendarDisplay';
import { addToDate } from './Utils'; 
import Header from './components/Header.js';
import {Box, Grid, Paper} from '@mui/material';
import MenuList from './components/MenuList.js';
import CustomSnackbar from './components/CustomSnackbar.js';

export default function AppointmentScheduler() {
  const [formData, setFormData] = useState({
    subject: '',
    tutor: '',    // this is tutor_id
    timeSlot: '',
  });
  
  const [cooldown, setCooldown] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const [tutorsList, setTutorsList] = useState([]);     // tutors
  const [availableSlots, setAvailableSlots] = useState([]); // time slots
  //const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    // display error msg to the user
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // disable submit if empty field
    const isSubmitDisabled = !formData.subject || !formData.tutor || !formData.timeSlot;

  useEffect(() => {
    // fetch the list of subjects. unconditional 
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    FrontAPI.fetchSubjects(session_id)
      .then((data) => {
        if (data.error) {
          // custom error handling
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          setSubjects(data);
        }
      })
      .catch((error) => {
        // network error
        setSnackbarMessage('Network error. Please try again.'); 
        setSnackbarOpen(true);
      });
  }, []);
  
  // handle when user change selected subject
  const handleSubjectChange = (event) => {
    const selectedSubject = event.target.value;
    setFormData({
      ...formData,
      subject: selectedSubject,
      // reset these when subject changed
      tutor: '', 
      timeSlot: '',
    });
  
    if (selectedSubject) {
      // fetch tutors for selected subject
      FrontAPI.fetchTutors(selectedSubject)
        .then((data) => {
          if (data.error) {
            // custom error handling
            setSnackbarMessage(data.message);
            setSnackbarOpen(true);
          } else {
            setTutorsList(data);
          }
        })
        .catch((error) => {
          // network error
          setSnackbarMessage('Failed to fetch tutors. Please try again.'); 
          setSnackbarOpen(true); 
        });
    } else {
      // reset
      setTutorsList([]);
    }
  };
  
  // handle when user change selected tutor
  const handleTutorChange = (event) => {
    const selectedTutor = event.target.value;
    setFormData({
      ...formData,
      tutor: selectedTutor,
      // reset when tutor changes
      timeSlot: '', 
    });
  
    if (selectedTutor) {
      // fetch available time slots for selected tutor and subject
      FrontAPI.fetchTimeSlots(selectedTutor)
      .then((data) => {
        if (data.error) {
          // custom error handling
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          setAvailableSlots(data);
        }
      })
      .catch((error) => {
        // network error
        setSnackbarMessage('Failed to fetch time slots. Please try again.'); 
        setSnackbarOpen(true); 
      });
    } else {
      // reset
      setAvailableSlots([]);
    }
  };

  // handle when user change selected timeslot
  const handleTimeSlotChange = (event) => {
    const selectedTimeSlot = event.target.value;
    setFormData({
      ...formData,
      timeSlot: selectedTimeSlot,
    });
    //setSelectedTimeSlot(selectedTimeSlot);
  };
  
  // handle when user click submit button
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cooldown) {
      // on cd
      return;
    }
    // cd is on
    setCooldown(true);
    // 5 sec timer
    setTimeout(() => {
      setCooldown(false);
    }, 5000);

      // verify user's session before allowing them to create an appointment
      const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
      const sessionResponse = await FrontAPI.verifySession(session_id);

      if (sessionResponse.error) {
        // handle invalid session
        console.log('User is not logged in or the session is invalid. Redirect to login.');
        return;
      }
      // createAppointment function from FrontAPI
      const response = await FrontAPI.createAppointment(formData, session_id);

      console.log(response);
      switch (response.status_code) {
        case 201:
          // success. 
          console.log('Successfully created appointment!');
          setSnackbarMessage('Successfully created appointment!');
          setSnackbarOpen(true);
          break;
        case 400:
          // Invalid fields
          console.log(`Error ${response.status_code}: ${response.message}`);
          setSnackbarMessage(response.message);
          setSnackbarOpen(true);
          break;
        case 409:
          // conflict?
          console.log(`Error ${response.status_code}: ${response.message}`);
          setSnackbarMessage(response.message);
          setSnackbarOpen(true);
          break;
        default:
          console.log(`Error ${response.status_code}: ${response.message}`);
          setSnackbarMessage(response.message);
          setSnackbarOpen(true);
          break;
      }
      // reset form fields after submission
      setFormData({
        subject: '',
        tutor: '',
        timeSlot: '',
      });
  };  

  // convert timestamps to events to fit data structure of big-calendar
  const events = availableSlots.map(slot => {
    const start = new Date(slot);
    const end = addToDate(start, 1);

    return {
      start,
      end,
      title: `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`,
    };
  });

  return (
    <div>
      <Header title="SCHEDULE APPOINTMENT" />

      <Box sx={{marginTop:"10px", marginLeft:"10px", marginRight:"10px", flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Paper>
              <MenuList />
            </Paper>
          </Grid>

          <Grid item xs={10}>
            <Paper>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth required>
                  <InputLabel>Subject</InputLabel>
                    <Select
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleSubjectChange}
                    >
                      <MenuItem value="">
                        <em>Select a subject</em>
                      </MenuItem>
                         {Array.isArray(subjects) && subjects.map((subject) => (
                         <MenuItem key={subject.class_name} value={`${subject.department_id}/${subject.class_num}`}>
                           {subject.department_name} - {subject.class_num} - {subject.class_name}
                         </MenuItem>
                      ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Tutor</InputLabel>
                    <Select
                      label="Tutor"
                      name="tutor"
                      value={formData.tutor}
                      onChange={handleTutorChange}
                    >
                      <MenuItem value="">
                        <em>Select a tutor</em>
                      </MenuItem>

                      {Array.isArray(tutorsList) && tutorsList.map((tutor) => (
                        <MenuItem key={tutor.tutor_id} value={tutor.tutor_id}> {/* TODO: change key to something else*/ }
                          {tutor.name}
                        </MenuItem>
                      ))}

                    </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Time Slot</InputLabel>
                    <Select
                      label="Time Slot"
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleTimeSlotChange}
                    >

                      <MenuItem value="">
                        <em>Select a time slot</em>
                      </MenuItem>

                      {/* add the available time slots as MenuItem options */}
                      {Array.isArray(availableSlots) && availableSlots.map((slot) => {
                        const startTime = new Date(slot.timestamp);
                        const endTime = addToDate(startTime, 1);
                        return (
                          <MenuItem key={slot.id} value={slot.timestamp}>
                            {`${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`}
                          </MenuItem>
                        );
                      })}
                    </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitDisabled} //not allow empty
                >
                  {cooldown ? 'Cooldown (5s)' : 'Schedule'}
                </Button>

                {/* CustomSnackbar for displaying error messages */}
                <CustomSnackbar
                  open={snackbarOpen}
                  message={snackbarMessage}
                  onClose={() => setSnackbarOpen(false)}
                />

              </form>

              {/* CalendarDisplay component --------  TODO: how to get title for events*/}
              <CalendarDisplay events={events} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
