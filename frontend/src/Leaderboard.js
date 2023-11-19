import React, { useState, useEffect } from "react";
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import FrontAPI from "./api/FrontAPI";
import CustomSnackbar from './components/CustomSnackbar';
import { Navigate } from "react-router-dom";

function Leaderboard() {
  const[verified, setVerified] = useState(true);   // hold status of session id

  const [tutorLeaderboard, setTutorLeaderboard] = useState([]);
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchLeaderboards = async () => {

      // validate session id
      const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
      const verify = await FrontAPI.verifySession(session_id);
      console.log("verfiy", verify);

      if (verify.status_code === 400 || verify.status_code === 401)  {// invalid or missing session id
        setVerified(false);
        return;
      }

      setVerified(true);

      const tutorLeaderboardData = await FrontAPI.fetchTutorLeaderboard();
      switch (tutorLeaderboardData.status_code) {
        case 200:
          setTutorLeaderboard(tutorLeaderboardData.message);
          break;
        default:
          setSnackbarMessage(`Error ${tutorLeaderboardData.status_code}: ${tutorLeaderboardData.message}`);
          setSnackbarOpen(true);
          break;
      }

      const userLeaderboardData = await FrontAPI.fetchUserLeaderboard();
      switch (userLeaderboardData.status_code) {
        case 200:
          setUserLeaderboard(userLeaderboardData.message);
          break;
        default:
          setSnackbarMessage(`Error ${userLeaderboardData.status_code}: ${userLeaderboardData.message}`);
          setSnackbarOpen(true);
          break;
      }
    };

    fetchLeaderboards();
  }, []);

  return (
    <React.Fragment>
      {!verified ?
        <Navigate to='/SignIn' replace={true} /> :
      
        <Container>
          <Typography variant="h4">Leaderboards</Typography>
          <div style={{ display: "flex" }}>
            <TableContainer component={Paper} style={{ marginRight: "20px" }}>
              <Typography variant="h6">Tutor Leaderboard</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tutorLeaderboard.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.num_hours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper}>
              <Typography variant="h6">User Leaderboard</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLeaderboard.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.num_hours}</TableCell>
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
          </div>
        </Container>
      }
    </React.Fragment>
  );
}

export default Leaderboard;
