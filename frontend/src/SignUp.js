import * as React from 'react';
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
import { useState, useEffect} from 'react';
import FrontAPI from './api/FrontAPI.js';
import Copyright from './Copyright';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


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

export default function SignUp() {
  const [confirmPassword, setConfirmPassword] = useState(''); // store reenter
  const [passwordsMatch, setPasswordsMatch] = useState(true); // check reenter password
  const [passwordValid, setPasswordValid] = useState(true); // check password
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    netId: '',
    tutor: false,
    criminalHistory: false,
    pendingCharges: false,
    probationOrParole: false,
    sexOffenderRegistry: false,
    outstandingWarrants: false,
    authorizationBackgroundCheck: false,
  });

  // get data from form
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    }
    else if (name === 'password') {
      // check if the password meets the validation criteria
      const isPasswordValid =
        value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(value);   
  
      // set the password validation message based on the validation result
      setPasswordValidationMessage(
        isPasswordValid ? '' : 'Password must be at least 12 characters long and contain at least 1 capital letter (A-Z), 1 number (0-9), and 1 special character (!@#$ ...)'
      );
  
      // update the error state based on validation result
      setPasswordValid(isPasswordValid);
  
      // update the form data
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    else if (name === 'repassword') {
      setConfirmPassword(value); // update confirmPassword state
      setFormData({
        ...formData,
        [name]: value,
      });
    } 
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    setPasswordsMatch(formData.password === confirmPassword);
  }, [formData.password, confirmPassword]);

  function handleMoreClick() {
    setShowMore(!showMore);
  }

// listen for submit event from "Sign Up" Button
const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    await FrontAPI.signUp(formData);
    // sucess
    setOpenDialog(true);
    console.log('Registration successful');
  } catch (error) {
    // error from FrontAPI
    console.error('Error:', error);
  }
};

  return (
      <ThemeProvider theme={theme}>
          <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}> 
            <Link href="https://www.utdallas.edu/">
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                <h4>UTD</h4>
              </Avatar>
            </Link>
          </Box>

          <h2>Online Tutoring Service</h2>
          <h2>SIGN UP</h2>

          <Box component="form" onSubmit={handleSubmit}>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address | Ex: email@utdallas.edu"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number | Ex: 2133139622"
                  name="phone"
                  autoComplete="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="netId"
                  label="NetID"
                  type="netId"
                  id="netId"
                  autoComplete="netId"
                  value={formData.netId}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={!passwordValid}
                  value={formData.password}
                  onChange={handleChange}
                />
                {!passwordValid && (
                  <p style={{ color: 'red' }}>{passwordValidationMessage}</p>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="repassword"
                  label="Re-enter Password"
                  type="password"
                  id="repassword"
                  autoComplete="new-password"
                  error={!passwordsMatch}
                  value={formData.repassword}
                  onChange={handleChange}
                />
                {!passwordsMatch && (
                  <p style={{ color: 'red' }}>Passwords do not match</p>
                )}
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-end"> 
              <Button onClick={handleMoreClick} label="I want to sign up as a tutor">
                {showMore ? 'Hide' : 'Show'} tutor account sign up
              </Button>
              {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <h3>CHECKBOX IF YES</h3>
                </Grid>
              }
              {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        name="tutor" 
                        checked={formData.tutor} 
                        onChange={handleChange} 
                      />
                    }
                    label="I want to sign up as a tutor"
                  />
                </Grid>
              }
              {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="criminalHistory"
                        checked={formData.criminalHistory}
                        onChange={handleChange}
                      />
                    }
                    label="Criminal History: Have you ever been convicted of a crime?"
                  />
                </Grid>
              }
              {showMore && 
              <Grid container justifyContent="flex-start"> 
                <FormControlLabel
                  control={
                    <Checkbox
                      name="pendingCharges"
                      checked={formData.pendingCharges}
                      onChange={handleChange}
                    />
                  }
                  label="Pending Charges: Do you currently have any pending criminal charges against you?"
                />
                </Grid>
                }
                {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="probationOrParole"
                        checked={formData.probationOrParole}
                        onChange={handleChange}
                      />
                    }
                    label="Probation or Parole: Are you currently on probation or parole?"
                  />
                </Grid>
                }
                {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="sexOffenderRegistry"
                        checked={formData.sexOffenderRegistry}
                        onChange={handleChange}
                      />
                    }
                    label="Sex Offender Registry: Are you registered as a sex offender?"
                  />
                </Grid>
                }
                {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="outstandingWarrants"
                        checked={formData.outstandingWarrants}
                        onChange={handleChange}
                      />
                    }
                    label="Outstanding Warrants: Do you have any outstanding arrest warrants?"
                  />
                </Grid>
                }
                {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="authorizationBackgroundCheck"
                        checked={formData.authorizationBackgroundCheck}
                        onChange={handleChange}
                      />
                    }
                    label="Authorization: Are you willing to consent to a criminal background check as part of this application or process?"
                  />
                </Grid>
                }
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={!passwordsMatch || !passwordValid}
            >
              Sign Up
            </Button>
            
            {/* hyper links */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body1">
                  Sign in with account
                </Link>
              </Grid>
            </Grid>

          </Box>

          <Grid item sx={{mt: 10}}>
            <Copyright/>
          </Grid>
          
          {/* dialog box to hlink to signIn page */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Registration Successful</DialogTitle>
            <DialogContent>
              <p>Your registration was successful. You can now sign in with your new account.</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Close
              </Button>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                  // navigation logic here to go to the sign-in page
                }}
                color="primary"
              >
                Sign In
              </Button>
            </DialogActions>
          </Dialog>

      </ThemeProvider>
  );
}
