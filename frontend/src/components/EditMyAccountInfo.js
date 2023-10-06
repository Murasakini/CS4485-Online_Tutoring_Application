import * as React from 'react';
import { TextField, Box, Button } from '@mui/material/';
import { Link } from 'react-router-dom';

export default function EditAccountInfo(props) {
  return (
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '100ch' }, textAlign:"center"
        }}
        noValidate
        autoComplete="off"
        onSubmit={props.handleSaveSubmit}
      >
        {/* profile photo */}
        <Box>
          <img style= {{width: 200, height: 200, marginLeft:"6px", marginTop:"6px",}} 
          src={props.accInfo.photo} alt="profile_photo" />
        </Box>
        <TextField
          id="name"
          label="First and Last Name"
          name="name"
          value={props.accInfo.name}
          onChange={props.handleChange}
        />
        <TextField
          id="email"
          label="Email Address"
          name="email"
          value={props.accInfo.email}
          onChange={props.handleChange}
        />
        <TextField
          id="phone"
          label="Phone Number"
          name="phone"
          value={props.accInfo.phone}
          onChange={props.handleChange}
        />
        <TextField
          id="about"
          label="About Me"
          name="about"
          value={props.accInfo.about}
          onChange={props.handleChange}
          multiline
        />
        <TextField
          id="subject"
          label="Subject List"
          name="subject"
          value={props.accInfo.subject}
          onChange={props.handleChange}
        />

        <br />
        <Button type="Submit" 
        // component={Link} to='/MyAccount'
        variant="contained" size="large" style={{marginBottom:"8px"}}>
          Save
        </Button>
        <Button component={Link} to='/MyAccount'
        variant="contained" size="large" style={{marginBottom:"8px"}}>
          Return
        </Button>
      </Box>
    );
  }
//}