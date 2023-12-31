import * as React from 'react';
import { Navigate, Link } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { useState, useEffect} from 'react';
import FrontAPI from './api/FrontAPI.js';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Copyright from './components/Copyright';
import CustomSnackbar from './components/CustomSnackbar';
import { UserContext } from './App.js';

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
  // global variable to hold account type 
  const { user, setUser } = React.useContext(UserContext);

  // keep track if logging in successfully
  const [isSuccessful, setSuccessful] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState(''); // store reenter
  const [passwordsMatch, setPasswordsMatch] = useState(true); // check reenter password
  const [passwordValid, setPasswordValid] = useState(true); // check password
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [openSnackbar, setSnackbarOpen] = useState(false);      // for dialog
  const [snackbarMessage, setSnackbarMessage] = useState('');  // for dialog msg
  const [cooldown, setCooldown] = useState(false);

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
  
    setFormData({
      ...formData,
      criminal: !(
        criminalHistory ||
        pendingCharges ||
        probationOrParole ||
        sexOffenderRegistry ||
        outstandingWarrants ||
        authorizationBackgroundCheck
      ),
    });
  }, [formData]);
  

  // listen for submit event from "Sign in" Button
  const handleSubmit = async (event) => {
    
    // preventDefault() prevents a page refresh
    event.preventDefault();

    if (cooldown) {
      // on cd
      return;
    }
    // cd is on
    setCooldown(true);
    // 5 sec timer
    setTimeout(() => {
      setCooldown(false);
    }, 5000);

    let isTutor = false;

      // check if user click '
      if (formData.tutor)
        isTutor = true;

      const response = await FrontAPI.signUp(formData, isTutor);

      console.log(response)
      switch (response.status_code) {
              case 201:
                // Registration success
                console.log('Registration successful');
                setSuccessful(true);
                setSnackbarMessage('Registration successful! Please navigate to Sign In page.');
                setSnackbarOpen(true);

                // set account type globally
                setUser(response.user_type);
                break;
              case 400:
                // Bad request
                console.log(`Error ${response.status_code}: ${response.message}`);
                setSnackbarMessage(response.message);
                setSnackbarOpen(true);
                break;
              case 409:
                // Unauthorized
                console.log(`Error ${response.status_code}: ${response.message}`);
                setSnackbarMessage(response.message);
                setSnackbarOpen(true);
                break;
              default:
                console.log('Registration failed');
                setSnackbarMessage(response.message);
                setSnackbarOpen(true);
                break;
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
                  label="First Name | ASCII only"
                  value={formData.firstName}
                  onChange={handleChange}
                  inputProps={{
                    pattern: '^[A-Za-z]+$', // ASCII characters
                    maxLength: 45, // Limit to 45 characters
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name | ASCII only"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  inputProps={{
                    pattern: '^[A-Za-z]+$', // ASCII characters
                    maxLength: 45, // Limit to 45 characters
                  }}
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
                    pattern: '^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?@utdallas.edu$',
                    maxLength: 45, // Limit to 45 characters
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
                    maxLength: 10, // stops when hit 10
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="netId"
                  label="NetID | Ex: abc123456"
                  type="netId"
                  id="netId"
                  autoComplete="netId"
                  value={formData.netId}
                  onChange={handleChange}
                  inputProps={{
                    pattern: '^[a-z]{3}[0-9]{6}$', // 3 letters and 6 numbers
                    maxLength: 9, // Limit to 9 characters
                  }}
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
                  inputProps={{
                    maxLength: 45, // Limit to 45 characters
                  }}
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
                  inputProps={{
                    maxLength: 45, // Limit to 45 characters
                  }}
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
              {cooldown ? 'Cooldown (5s)' : 'Sign Up'}
            </Button>

            <CustomSnackbar
              open={openSnackbar}
              message={snackbarMessage}
              onClose={() => setSnackbarOpen(false)}
            />
            
            {/* hyper links */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                  <List>
                    <ListItem disablePadding component={Link} to="/SignIn">
                      <ListItemText primary="Sign in with account" />
                    </ListItem>
                  </List>
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
