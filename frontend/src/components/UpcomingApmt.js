import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import FrontAPI from '../api/FrontAPI';
import CustomSnackbar from './CustomSnackbar';

function UpcomingApmt() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
    // TODO: change to switch ; link to homepage
      try {
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.fetchUpcomingAppointments(session_id);
        setUpcomingAppointments(response);
        
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        setSnackbarMessage('Error fetching upcoming appointments');
        setSnackbarOpen(true);
      }
    };

    fetchUpcomingAppointments();
  }, []);

  if (!Array.isArray(upcomingAppointments)) {
    return <p>No upcoming appointments</p>;
  }

  return (
    <Container  sx={{textAlign: 'center'}}>
      <Typography variant="h4">Upcoming Appointments</Typography>
      <TableContainer sx={{marginTop: "25px", marginBottom: "25px"}} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Time</b></TableCell>
              <TableCell><b>Tutor Name</b></TableCell>
              <TableCell><b>Student Name</b></TableCell>
              <TableCell><b>Subject</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingAppointments.map((appointment, index) => (
              <TableRow key={index}>
                <TableCell>{appointment.meeting_time}</TableCell>
                <TableCell>{appointment.tutor_name}</TableCell>
                <TableCell>{appointment.student_name}</TableCell>
                <TableCell>{appointment.class_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
        {/* CustomSnackbar for displaying error messages */}
        <CustomSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          onClose={() => setSnackbarOpen(false)}
        />
        <br/>
    </Container>
    
  );
}

export default UpcomingApmt;
