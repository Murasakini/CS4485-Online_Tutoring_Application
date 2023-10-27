import * as React from 'react';
import { Navigate, Link } from 'react-router-dom'; // Link from react-router-dom
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LinkMui from '@mui/material/Link'; // Rename Link from @mui/material/Link to avoid conflict
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CustomSnackbar from './components/CustomSnackbar.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { useState } from 'react';
import FrontAPI from './api/FrontAPI.js';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Copyright from './components/Copyright';

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

export default function SignIn() {
  // keep track if logging in successfully
  const [isSuccessful, setSuccessful] = useState(false);

  // display error msg to the user
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // form as a state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // get data from the form
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // listen for the submit event from the "Sign in" Button
  const handleSubmit = async (event) => {
    // preventDefault() prevents a page refresh
    event.preventDefault();
    const response = await FrontAPI.signIn(formData);

    switch (response.status_code) {
      case 200:
        // success
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
        // navigate to the home page
        <Navigate to="/" /> :

        // display input form
        <ThemeProvider theme={theme}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <LinkMui href="https://www.utdallas.edu/">
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                <h4>UTD</h4>
              </Avatar>
            </LinkMui>
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
              control={<Checkbox value="remember" />}
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
                <List>
                  <ListItem disablePadding component={Link} to="#">
                    <ListItemText primary="Forgot your password?" />
                  </ListItem>
                </List>
              </Grid>

              <Grid item>
                <List>
                  <ListItem disablePadding component={Link} to="/SignUp">
                    <ListItemText primary="Don't have an account? Sign Up" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>

          </Box>

          <Grid item sx={{ mt: 10 }}>
            <Copyright />
          </Grid>

        </ThemeProvider>
      }
    </React.Fragment>
  );
}
