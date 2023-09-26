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
import { Copyright } from './SignIn.jsx'
import './App.css';
import { useState } from 'react';
import FrontAPI from './FrontAPI.jsx';

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
  
  const [showMore, setShowMore] = useState(false);
  function handleMoreClick() {
    setShowMore(!showMore);
  }
  //listen for submit event from "Sign in" Button
  const handleSubmit = (event) => {
    //preventDefault() prevents a page refresh
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
      netid: data.get('netid'),
    });
  };

  return (
      <ThemeProvider theme={theme}>
          <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}> 
            <Avatar sx={{bgcolor: 'primary.main', width: 60, height: 60}} href="https://www.utdallas.edu/">
              <h4>UTD</h4>
            </Avatar>
          </Box>

          <h2>Online Tutoring Service</h2>
          <h2>SIGN UP</h2>

          <Box component="form" onSubmit={handleSubmit} noValidate >

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="phone"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="netid"
                  label="NetID"
                  type="netid"
                  id="netid"
                  autoComplete="netid"
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Re-enter Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-end"> 
              <Button onClick={handleMoreClick} label="I want to sign up as a tutor">
                {showMore} tutor account
              </Button>
              {showMore && 
                <TextField
                  required
                  fullWidth
                  name="criminal"
                  label="Criminal Records"
                  type="criminal"
                  id="criminal"
                />
              }
              {showMore && 
                <FormControlLabel control={<Checkbox defaultChecked />} label="I want to sign up as a tutor"/>
              }
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
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
  );
}
