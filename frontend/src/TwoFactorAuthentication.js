import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
//import axios from 'axios';
import FrontAPI from './api/FrontAPI.js';
import './TwoFactorAuthentication.css'; // Import a separate CSS file for styling

const theme = createTheme({
    palette: {
      primary: {
        main: '#ff5722', //orange
      },
      secondary: {
        main: '#ffea00', //yellow
      },
    },
  });

function TwoFactorAuthentication() {
    const [code, setCode] = useState('');
  
    const handleCodeChange = (event) => {
      setCode(event.target.value);
    };
  
    const handleSubmit = (event) => {
      event.preventDefault();
      // You can add your code to submit and verify the 2FA code here
      console.log('Entered 2FA Code:', code);
    };
  
    return (
      <ThemeProvider theme={theme}>
        <div className="two-factor-authentication">
          <h2>Enter your verification code</h2>
          <p>A verification code has been sent to your email address. Please enter the code that you received:</p>
  
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Verification Code*"
              value={code}
              onChange={handleCodeChange}
              maxLength="6"
            />

          <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
            >
              Sign In
            </Button>
          </form>
        </div>
      </ThemeProvider>
    );
  }
  
  export default TwoFactorAuthentication;
