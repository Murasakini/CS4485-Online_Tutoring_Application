import { useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import FrontAPI from './api/FrontAPI.js';
import './TwoFactorAuthentication.css'; // Import a separate CSS file for styling
import * as React from 'react';
import { Navigate, Link } from 'react-router-dom';
import CustomSnackbar from './components/CustomSnackbar.js';

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

export default function TwoFactorAuthentication() {
  // keep track if 2FA is successfull
  const [isSuccessful, setSuccessful] = useState(false);

  // display error message to the user
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 2FA code as a state
  const [code, setCode] = useState('');
  
  // get 2FA code
  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const response = await FrontAPI.validate2FA(code);
    console.log('Entered 2FA Code:', code);
      
    // Copied from handleSubmit in Signin.js 
    switch (response.status_code) { 
      case 200:
        // success
        setSuccessful(true);
        console.log('2FA successful');
        break;
      case 400:
        console.log(`Error ${response.status_code}: ${response.message}`);
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
        break;
      case 401:
        console.log(`Error ${response.status_code}: ${response.message}`);
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
        break;
      default:
        console.log('2FA failed');
        setSnackbarMessage(response.message);
        setSnackbarOpen(true);
        break;
    }
  };
  
  return (
    <React.Fragment>
      {isSuccessful ?

        // navigate to home page
        <Navigate to= "/" /> :
        
        // display input form  
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

          {/* CustomSnackbar for displaying error messages */}
          <CustomSnackbar
            open={snackbarOpen}
            message={snackbarMessage}
            onClose={() => setSnackbarOpen(false)}
          />

          </form>
        </div>
        </ThemeProvider>
      }
    </React.Fragment>
  );
}

