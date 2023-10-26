import * as React from 'react';
import { Navigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Copyright } from './SignIn.js'
import './App.css';
import { useState, useEffect} from 'react';
import FrontAPI from './api/FrontAPI.js';

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
  // keep track if logging in successfully
  const [isSuccessful, setSuccessful] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState(''); // store reenter
  const [passwordsMatch, setPasswordsMatch] = useState(true); // check reenter password
  const [passwordValid, setPasswordValid] = useState(true); // check password
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [criminal, setCriminal] = useState(false); // AND operator of all crime related questionaire boxes

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
    criminal: false,
  });

  // get data from form
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
      if (name === 'tutor') {
        setShowMore(checked);
      }
    }
    else if (name === 'password') {
      // check if the password meets the validation criteria
      const isPasswordValid =
        value.length >= 12 && 
        /[A-Z]/.test(value) && 
        /[a-z]/.test(value) &&
        /[0-9]/.test(value) && 
        /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(value);   
  
      // set the password validation message based on the validation result
      setPasswordValidationMessage(
        isPasswordValid ? '' : 'Password must be at least 12 characters long and contain at least 1 capital letter (A-Z), at least 1 lowercase letter (a-z), 1 number (0-9), and 1 special character (!@#$ ...)'
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

  // password matching
  useEffect(() => {
    setPasswordsMatch(formData.password === confirmPassword);
  }, [formData.password, confirmPassword]);

  // AND of all crime related questionaire boxes
  useEffect(() => {
    const {
      criminalHistory,
      pendingCharges,
      probationOrParole,
      sexOffenderRegistry,
      outstandingWarrants,
      authorizationBackgroundCheck,
    } = formData;
  
    // update
    setCriminal(
      !(
        criminalHistory ||
        pendingCharges ||
        probationOrParole ||
        sexOffenderRegistry ||
        outstandingWarrants ||
        authorizationBackgroundCheck
      )
    );    
  }, [formData]);
  

  // listen for submit event from "Sign in" Button
  const handleSubmit = async (event) => {
    // preventDefault() prevents a page refresh
    event.preventDefault();

    try {
      let isTutor = false;

      // check if user click '
      if (formData.tutor)
        isTutor = true;

      const response = await FrontAPI.signUp(formData, isTutor);

      console.log(response)
  
      if (response.status_code === 201) {
        // success msg
        console.log('Registration successful');

        // set sign up status as successful
        setSuccessful(true);

      } else {
        // fail msg
        console.log('Registration failed');
      }
    } 
    catch (error) {
      // error msg
      console.error('Error:', error);
    }
  };

  return (
    <React.Fragment>
    {isSuccessful ? 
      // navigate to home page
      <Navigate to="/" /> :
      
      // display input form
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
                  label="Email Address | @utdallas.edu domain only"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  inputProps={{
                    pattern: '^[a-zA-Z0-9]+@utdallas.edu$',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="US Phone Number | Ex: 2133139622 | 10-digit US phone number"
                  name="phone"
                  autoComplete="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  inputProps={{
                    pattern: "^[0-9]{10}$", // 10 digits
                  }}
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
                <Grid container justifyContent="flex-start"> 
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        name="tutor" 
                        checked={formData.tutor} 
                        onChange={handleChange} 
                      />
                    }
                    label="I want to sign up as a TUTOR"
                  />
                </Grid>

              {showMore && 
                <Grid container justifyContent="flex-start"> 
                  <h3>Checkbox if NO for questions below</h3>
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
                    <h3>Checkbox if YES for this question below</h3>
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

      </ThemeProvider>
              }      
    </React.Fragment>
  );
}
