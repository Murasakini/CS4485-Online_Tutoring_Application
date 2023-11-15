import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FrontAPI from './api/FrontAPI';
import CalendarDisplay from './components/CalendarDisplay';
import TextField from '@mui/material/TextField';
import {generateAllPossibleTimeSlots, calculateAvailableTimeSlots, addToDate} from './Utils';
import CustomSnackbar from './components/CustomSnackbar';

export default function TutorAppointmentScheduler() {
  // start date (rounded up to the next hour). used for determining possible time slots
  const currentDateTime = new Date();
  const roundedUpHour = new Date(currentDateTime);
  roundedUpHour.setHours(currentDateTime.getHours() + 1, 0, 0, 0);

  const [formData, setFormData] = useState({
    tutorId: '',
    subject: '',
    timeSlot: '',
    startDate: roundedUpHour,
    endDate: addToDate(roundedUpHour, 1 * 30 * 24), // 1 month from the start
  });

  const [subjects, setSubjects] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [openSnackbar, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cooldown, setCooldown] = useState(false);

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
          setSubjects(data.class_name);
        }
      })
      .catch((error) => {
        // network error
        setSnackbarMessage('Network error. Please try again.');
        setSnackbarOpen(true);
      });
  }, []);
  
  useEffect(() => {
    if (formData.tutorId) {
      // tutor's time slots (already have) with user input tutor ID
      FrontAPI.fetchTimeSlots(formData.tutorId)
        .then((data) => {
          if (data.error) {
            // custom error handling
            setSnackbarMessage(data.message);
            setSnackbarOpen(true);
          } else {
            // startDate and endDate to generateAllPossibleTimeSlots
            const allPossibleTimeSlots = generateAllPossibleTimeSlots(formData.startDate, formData.endDate);
            const availableSlots = calculateAvailableTimeSlots(allPossibleTimeSlots, data.timestamp);
            setAvailableSlots(availableSlots);
          }
        })
        .catch((error) => {
          // network error
          setSnackbarMessage('Network error. Please try again.');
          setSnackbarOpen(true);
        });
    }
  }, [formData.tutorId, formData.startDate, formData.endDate]);
  
  // handle when user change tutorID
  const handleTutorIdChange = (event) => {
    const tutorId = event.target.value;
    setFormData({
      ...formData,
      tutorId: tutorId,
    });
  };
  
  // handle when user change subject
  const handleSubjectChange = (event) => {
    const selectedSubject = event.target.value;
    setFormData({
      ...formData,
      subject: selectedSubject,
    });
  };

  // handle when user change timeslot
  const handleTimeSlotChange = (event) => {
    const selectedTimeSlot = event.target.value;
    setFormData({
      ...formData,
      timeSlot: selectedTimeSlot,
    });
  };

  // handle when user click submit
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
        console.log('Successfully created availability!');
        setSnackbarMessage('Successfully created availability!');
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
  };  

  /*
      // reset only timeSlot field after submission for ease of submitting another slot
      setFormData({
        ...formData,
        timeSlot: '',
      });
  */ 

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
      <h2>Schedule an Appointment for Tutor</h2>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth required>
          <TextField
            id="tutorId" 
            label="Tutor ID"
            name="tutorId" 
            value={formData.tutorId}
            onChange={handleTutorIdChange}
            inputProps={{
              maxLength: 45, // Limit to 45 characters
            }}
          />
        </FormControl>

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
          disabled={!formData.tutorId || !formData.subject || !formData.timeSlot}
        >
          {cooldown ? 'Cooldown (5s)' : 'Sign Up'}
        </Button>

        <CustomSnackbar
          open={openSnackbar}
          message={snackbarMessage}
          onClose={() => setSnackbarOpen(false)}
        />
      </form>

      {/* CalendarDisplay component */}
      <CalendarDisplay events={events} />
    </div>
  );
}
