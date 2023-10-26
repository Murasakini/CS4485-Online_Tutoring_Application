import * as React from 'react';
import { Navigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CustomSnackbar from './components/CustomSnackbar.js';
import MuiAlert from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { useState } from 'react';
import FrontAPI from './api/FrontAPI.js';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff5722',
    },
    secondary: {
      main: '#ffea00',
    },
  },
});

export function Copyright() {
  return (
    <h4>
      Copyright © 
      <Link color="inherit" href="https://www.utdallas.edu/">
        The University of Texas at Dallas
      </Link>
    </h4>
  );
}

export default function SignIn() {
  // keep track if logging in successfully
  const [isSuccessful, setSuccessful] = useState(false);

  // display error msg to user
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  //form as a state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  //get data from form
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //listen for submit event from "Sign in" Button
  const handleSubmit = async (event) => {
    //preventDefault() prevents a page refresh 
    event.preventDefault();
    const response = await FrontAPI.signIn(formData);
  
    switch (response.status_code) {
      case 200:
        // success
        localStorage.setItem('sessionCookie', response.result);
        setSuccessful(true);
        console.log('Login successful');
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
        console.log('Login failed');
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
            <h2>SIGN IN</h2>

            <Box component="form" onSubmit={handleSubmit}>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address | @utdallas.edu domain only"
                name="email"
                autoComplete="email"
                autoFocus
                type="email"
                value={formData.email}
                onChange={handleChange}
                inputProps={{
                    pattern: '^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?@utdallas.edu$',
                    maxLength: 45, // Limit to 45 characters
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                inputProps={{
                    maxLength: 45, // Limit to 45 characters
                }}
              />
              
              <FormControlLabel
                control={<Checkbox value="remember"/>}
                label="Remember me"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
              >
                Sign In
              </Button>

              {/* CustomSnackbar component for displaying error messages */}
              <CustomSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                onClose={() => setSnackbarOpen(false)}
              />
                  
              {/* hyper links */}
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Link href="#" variant="body1">
                    Forgot your password?
                  </Link>
                </Grid>

                <Grid item>
                  <Link href="#" variant="body1">
                    Don't have an account? Sign Up
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
