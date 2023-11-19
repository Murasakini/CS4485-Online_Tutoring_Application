import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import FrontAPI from '../api/FrontAPI';
import CustomSnackbar from './CustomSnackbar';
import { Navigate } from "react-router-dom";

function UpcomingApmt() {
  const [verified, setVerified] = useState(true);   // hold status of session id

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      // validate session id
      const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
      const verify = await FrontAPI.verifySession(session_id);
      console.log("verfiy", verify);

      if (verify.status_code === 400 || verify.status_code === 401)  {// invalid or missing session id
        setVerified(false);
        return;
      }

      setVerified(true);

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
    <React.Fragment>
      {!verified ?
        <Navigate to='/SignIn' replace={true} /> :
        
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
      }
    </React.Fragment>
  )
}

export default UpcomingApmt;
