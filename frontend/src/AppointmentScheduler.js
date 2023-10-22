import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FrontAPI from './api/FrontAPI';
import CalendarDisplay from './components/CalendarDisplay'; // Import the CalendarDisplay component

//#step 1: find available classes for user to get tutoring
//SELECT user_classes_readable.class_name, user_classes_readable.class_num, user_classes_readable.department_id 
//	FROM user_classes_readable 
//    LEFT JOIN auth_table ON user_classes_readable.user_id=auth_table.user_id 
//    WHERE auth_table.session_id = :session_id;

//#step 2: find available tutors for class
//SELECT tutor_id, first_name, last_name, class_name FROM tutor_classes_readable WHERE class_num = :class_num AND department_id = :department_id;

//#step 3: find when selected tutor is available
//SELECT time_available FROM tutor_schedules WHERE tutor_id= :tutor_id;

//#step 4: create appointment
//INSERT INTO appointments (user_id, tutor_id, class_num, department_id, meeting_time) VALUES (:user_id, :tutor_id, :class_num, :department_id, :meeting_time);

export default function AppointmentScheduler() {
  const [formData, setFormData] = useState({
    date: null,
    subject: '',
    tutor: '',  
    timeSlot: '',
    // fields go here
  });

  const [subjects, setSubjects] = useState([]); // subjects
  const [tutors, setTutors] = useState([]);     // tutors
  const [availableSlots, setAvailableSlots] = useState([]); // time slots
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  useEffect(() => {
    // fetch the list of subjects 
    FrontAPI.fetchSubjects()
      .then((data) => {
        setSubjects(data);
      })
      .catch((error) => {
        console.error('Failed to fetch subjects:', error);
      });
  }, []);
  
  const handleSubjectChange = (event) => {
    const selectedSubject = event.target.value;
    setFormData({
      ...formData,
      subject: selectedSubject,
      tutor: '', // Reset when subject changed
      timeSlot: '',
    });
  
    if (selectedSubject) {
      // fetch tutors for the subject
      FrontAPI.fetchTutors(selectedSubject)
        .then((data) => {
          setTutors(data);
        })
        .catch((error) => {
          console.error('Failed to fetch tutors:', error);
        });
    } else {
      // reset
      setTutors([]);
    }
  };
  
  const handleTutorChange = (event) => {
    const selectedTutor = event.target.value;
    setFormData({
      ...formData,
      tutor: selectedTutor,
      timeSlot: '', // reset when tutor changes
    });
  
    if (selectedTutor) {
      // fetch available time slots for selected tutor and subject
      FrontAPI.fetchTimeSlots(selectedTutor, formData.subject)
        .then((data) => {
          setAvailableSlots(data);
        })
        .catch((error) => {
          console.error('Failed to fetch available time slots:', error);
        });
    } else {
      // reset
      setAvailableSlots([]);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // send form
      console.log('Appointment data submitted:', {
        date: formData.date,
        subject: formData.subject,
        tutor: formData.tutor,
        timeSlot: selectedTimeSlot,
      });
      // reset form fields after submission
      setFormData({
        date: null,
        subject: '',
        tutor: '',
      });
      setSelectedTimeSlot('');
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  return (
    <div>
      <h2>Schedule an Appointment</h2>
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
              {subjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
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
              {tutors.map((tutor) => (
                <MenuItem key={tutor.id} value={tutor.name}>
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
            value={selectedTimeSlot}
            onChange={(event) => setSelectedTimeSlot(event.target.value)}
          >
            <MenuItem value="">
              <em>Select a time slot</em>
            </MenuItem>
            {/* Add the available time slots as MenuItem options */}
            {availableSlots.map((slot) => (
              <MenuItem key={slot.id} value={slot}>
                {new Date(slot).toLocaleString()} {/* Format and display date and time */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Schedule
        </Button>
      </form>

      {/* use the CalendarDisplay component */}
      <CalendarDisplay events={availableSlots} />
    </div>
  );
}
