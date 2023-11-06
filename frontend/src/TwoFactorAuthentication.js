import { useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
//import './App.css';
//import './TwoFactorAuthentication.css'; // Import a separate CSS file for styling
import FrontAPI from './api/FrontAPI.js';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import CustomSnackbar from './components/CustomSnackbar.js';
import SignIn from './SignIn.js';////////////////////////////////////////////////////////////////////////
import { useLocation } from 'react-router-dom'; /////////////////////////////////////////////////////////

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

  // Define the inline styles
  const labelStyle = {
    fontFamily: 'SourceSansProSemibold, sans-serif',
    lineHeight: '20px',
    textAlign: 'left',
    display: 'block',
    color: '#000000',
    marginTop: '20px',
    marginBottom: '8px',
    fontWeight: 550,
    fontSize: '14px',
  };
  
  // Define the inline styles
  const disclaimerRequiredStyle = {
    fontFamily: 'inherit',
    fontWeight: 300,
    fontSize: '14px',
    height: 'auto',
    lineHeight: '18px',
    position: 'relative',
    textAlign: 'left',
    margin: 'auto',
    paddingTop: '5px',
    paddingBottom: '10px',
    color: '#d40303',
  };

export default function TwoFactorAuthentication() {
  //const myVariable = SignIn().myvar.current;////////////////////////////////////////////////////////
  //console.log(myVariable);//////////////////////////////////////////////////////////////////////////
  
  const location = useLocation(); ////////////////////////////////////////////////////////////////////
  const queryParams = new URLSearchParams(location.search); //////////////////////////////////////////
  const email = queryParams.get('email'); ////////////////////////////////////////////////////////////
  const userType = queryParams.get('userType');

  console.log('Email in TwoFactorAuthentication:', email)/////////////////////////////////////////////
  console.log('userType in TwoFactorAuthentication: ', userType)//////////////////////////////////////
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
        <div 
          style={{
              textAlign: 'center',
              maxWidth: '300px',
              margin: '0 auto',
              padding: '30px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#f9f9f9',
            }}>
          <h2
            style={{
                color: '#333',
                fontSize: '23px',
                marginBottom: '10px',
              }}
            >Enter your verification code</h2>
          <p
            style={{
              color: '#666',
              fontSize: '14px',
            }}
          >A verification code has been sent to {email}.  </p> 

          <p
            style={{
              textAlign: 'left',
              color: '#666',
              fontSize: '14px',
            }}
          >Please enter the code that you received. If you do not receivee the code in 10 minutes, please request a new verification code.</p>
          
          
          <label class="control-label required" for="code" style={labelStyle}>
            Secure verification code 
            <abbr class="required disclaimer-basic" style={disclaimerRequiredStyle}> *</abbr>
          </label>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              //placeholder="Enter Verification Code"
              value={code}
              onChange={handleCodeChange}
              maxLength="6"
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                fontSize: '16px',
              }}
            />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Submit
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

