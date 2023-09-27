import * as React from 'react';
import { TextField, Box, Button } from '@mui/material/';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function EditAccountInfo() {
  // create holder for values and function to update values
  const [accInfo, setAccInfo] = useState({
    name: 'Puppy Cute',
    email: 'puppy.cute@animal.com',
    phone: '(999)999-999',
    about: 'I am the cutest puppy in the world.',
    subject: 'Math',
  })

  // update values when any changes
  const handleChange = (e) => {
    // get input name and value
    const {name, value} = e.target;

    // update values
    setAccInfo((prev) => {
      return {...prev, [name]: value}
    })
  };

  // do something when clicking save button (submit)
  const handleSaveSubmit = (e) => {
    e.preventDefault();
    console.log(accInfo);
  }

  return (
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '100ch' }, textAlign:"center"
        }}
        noValidate
        autoComplete="off"
        onSubmit={handleSaveSubmit}
      >
        <TextField
          id="name"
          label="First and Last Name"
          name="name"
          value={accInfo.name}
          onChange={handleChange}
        />
        <TextField
          id="email"
          label="Email Address"
          name="email"
          value={accInfo.email}
          onChange={handleChange}
        />
        <TextField
          id="phone"
          label="Phone Number"
          name="phone"
          value={accInfo.phone}
          onChange={handleChange}
        />
        <TextField
          id="about"
          label="About Me"
          name="about"
          value={accInfo.about}
          onChange={handleChange}
          multiline
        />
        <TextField
          id="subject"
          label="Subject List"
          name="subject"
          value={accInfo.subject}
          onChange={handleChange}
        />

        <br />
        <Button type="Submit" 
        component={Link} to='/MyAccount'
        variant="contained" size="large" style={{marginBottom:"8px"}}>
          Save
        </Button>
      </Box>
    );
  }
//}