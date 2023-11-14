import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import FrontAPI from './api/FrontAPI';
import CustomSnackbar from './components/CustomSnackbar';

function UpcomingApmt() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
    // TODO: change to switch ; link to homepage
      try {
        const response = await FrontAPI.fetchUpcomingAppointments();
        setUpcomingAppointments(response);
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        setSnackbarMessage('Error fetching upcoming appointments');
        setSnackbarOpen(true);
      }
    };

    fetchUpcomingAppointments();
  }, []);

  return (
    <Container>
      <Typography variant="h4">Upcoming Appointments</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Tutor Name</TableCell>
              <TableCell>Subject</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingAppointments.map((appointment, index) => (
              <TableRow key={index}>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.tutor_name}</TableCell>
                <TableCell>{appointment.subject}</TableCell>
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
    </Container>
    
  );
}

export default UpcomingApmt;
