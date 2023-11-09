import { useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FrontAPI from './api/FrontAPI.js';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import CustomSnackbar from './components/CustomSnackbar.js';
import { useLocation } from 'react-router-dom';

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
  
  // parse the query parameters from the URL and get email & userType
  const location = useLocation(); 
  const queryParams = new URLSearchParams(location.search); 
  const email = queryParams.get('email'); 
  const userType = queryParams.get('userType');

  // keep track if 2FA is successfull
  const [isSuccessful, setSuccessful] = useState(false);

  // display error message to the user
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 2FA code & user info as a state
  const [formData, setFormData] = useState({
    email: '',
    userType: '',
    code: ''
  });

  // read 2FA code & user info
  const handleCodeChange = (event) => {
    const code = event.target.value;
      
    setFormData({
      email: email,
      userType: userType,
      code: code,
    });
  };

  // resend2FA cooldown
  const [isCoolDown, setCoolDown] = useState(false);

  // call resend2FA API
  const handleResend2FAClick = async () => {
    const resendData = {
      email: email,
      userType: userType,
    };
    
    if (isCoolDown) {
      setSnackbarMessage('Cooling down. Please try again later.');
      setSnackbarOpen(true);
    } else {

      try {
        const apiResponse = await FrontAPI.resend2FA(resendData);

        console.log(apiResponse.data);
      } catch (error) {
        console.error('API call failed:', error);
      }

      setSnackbarMessage('New code has been sent.');
      setSnackbarOpen(true);

      // Start the cooldown (set isCoolDown to true)
      setCoolDown(true);

      // Reset the cooldown after 10 seconds
      setTimeout(() => {setCoolDown(false);}, 10000);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    console.log('Entered 2FA Code:', formData.code);
    const response = await FrontAPI.validate2FA(formData);
    
    console.log(response);

    // Copied from handleSubmit in Signin.js 
    switch (response.status_code) { 
      case 200:
        // success
        // cookie hardcoded to last an hour ## TODO: make max age dependant on cookie_data.expire minus current time
        document.cookie = `sessionCookie=${response.cookie_data.session_id}; max-age=3600`
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
          >Please enter the code that you received. If you do not receive the code in 10 minutes, please&nbsp;
            <a href="#" onClick={handleResend2FAClick} 
              style={{
                textDecoration: 'underline',
                color: 'blue',
                cursor: 'pointer',
              }}>
              request a new verification code.
            </a>
          </p>

          <label className="control-label required" htmlFor="code" style={labelStyle}>
            Secure verification code 
            <abbr className="required disclaimer-basic" style={disclaimerRequiredStyle}> *</abbr>
          </label>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              //placeholder="Enter Verification Code"
              value={formData.code}
              onChange={handleCodeChange}
              maxLength="6"
              style={{
                textAlign: 'center',
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

