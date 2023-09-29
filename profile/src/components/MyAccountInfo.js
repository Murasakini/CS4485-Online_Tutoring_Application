import * as React from "react";
import { TextField, Box, Button } from "@mui/material/";
import { Link } from "react-router-dom";

export default function AccountInfo(props) {
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
      <TextField
        id="name"
        label="First and Last Name"
        defaultValue={props.accInfo.name}
        InputProps={{ readOnly: true }}
      />
      <TextField
        id="email"
        label="Email Address"
        defaultValue={props.accInfo.email}
        InputProps={{ readOnly: true }}
      />
      <TextField
        id="phone"
        label="Phone Number"
        defaultValue={props.accInfo.phone}
        InputProps={{ readOnly: true }}
      />
      <TextField
        id="about"
        label="About Me"
        defaultValue={props.accInfo.about}
        multiline
        InputProps={{ readOnly: true }}
      />
      <TextField
        id="subjects"
        label="Subject List"
        defaultValue={props.accInfo.subject}
        InputProps={{ readOnly: true }}
      />
      <br />

      <Button
        component={Link}
        to="/EditMyAccount"
        variant="contained"
        size="large"
        style={{ marginBottom: "8px" }}
      >
        Edit
      </Button>
    </Box>
  );
}
