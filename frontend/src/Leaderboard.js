import React, { useState, useEffect } from "react";
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import FrontAPI from "./api/FrontAPI";

function Leaderboard() {
  const [tutorLeaderboard, setTutorLeaderboard] = useState([]);
  const [userLeaderboard, setUserLeaderboard] = useState([]);

  useEffect(() => {
    // the tutor and user leaderboards
    const fetchLeaderboards = async () => {
      // add ERROR HANDLING for these 2
      const tutorLeaderboardData = await FrontAPI.fetchTutorLeaderboard();
      const userLeaderboardData = await FrontAPI.fetchUserLeaderboard();

      setTutorLeaderboard(tutorLeaderboardData.message);
      setUserLeaderboard(userLeaderboardData.message);
    };

    fetchLeaderboards();
  }, []);

  return (
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
                  <TableCell>{entry.hours}</TableCell>
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
                  <TableCell>{entry.hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Container>
  );
}

export default Leaderboard;
