import * as React from "react";
import { TextField, Box, Button } from "@mui/material/";
import { Link } from "react-router-dom";
import profile_photo from "../logo/profile_photo.png";

export default function AccountInfo(props) {
  const data = {
    photo: profile_photo,
    name: props.accInfo.name,
    email: props.accInfo.email, 
    phone: props.accInfo.phone,
    about: props.accInfo.about,
    subject: props.accInfo.subject
  }
  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "100ch" },
        textAlign: "center",
      }}
      noValidate
      autoComplete="off"
    >
      {/* profile photo */}
      <Box>
        <img style= {{width: 200, height: 200, marginLeft:"6px", marginTop:"6px",}} 
        src={data.photo} alt="profile_photo" />
      </Box> 

      <TextField
        id="name"
        label="First and Last Name"
        defaultValue={data.name}
        InputProps={{ readOnly: true }}
      />

      <TextField
        id="email"
        label="Email Address"
        defaultValue={data.email}
        InputProps={{ readOnly: true }}
      />

      <TextField
        id="phone"
        label="Phone Number"
        defaultValue={data.phone}
        InputProps={{ readOnly: true }}
      />

      <TextField
        id="about"
        label="About Me"
        defaultValue={data.about}
        multiline
        InputProps={{ readOnly: true }}
      />

      <TextField
        id="subjects"
        label="Subject List"
        defaultValue={data.subject}
        InputProps={{ readOnly: true }}
      />
      <br />

      <Link to="/EditMyAccount" state={{ fromMyAccount: {data}}} >
        <Button
          variant="contained"
          size="large"
          style={{ marginBottom: "8px" }}
        >
          Edit
        </Button>
      </Link>
    </Box>
  );
}
