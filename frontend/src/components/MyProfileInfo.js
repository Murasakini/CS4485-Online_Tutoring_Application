import * as React from "react";
import { TextField, Box, Button } from "@mui/material/";
import { Link } from "react-router-dom";

export default function MyProfileInfo(props) {
  const data = {
    name: props.accInfo.name,
    email: props.accInfo.email, 
    phone_num: props.accInfo.phone_num,
    about_me: props.accInfo.about_me,
    subject: props.accInfo.subject,
    tutor_id: props.accInfo.tutor_id,
    num_hours: props.accInfo.num_hours,
    netID: props.accInfo.netID,
    image: props.profileImg
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
        <img style= {{width: 250, height: 250, marginLeft:"6px", marginTop:"6px", objectFit:"contain"}} 
        src={data.image} alt={data.name} /> 

        <br />
        <input type="file" name="myImage" onChange={props.fileSelectHandler} />

        <Button onClick={props.handleUpload}
        variant="contained" size="small" style={{ marginBottom:"8px" }}>
          Upload
        </Button>
      </Box> 

      <TextField
        id="name"
        label="Name"
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
        id="netID"
        label="Net ID"
        defaultValue={data.netID}
        InputProps={{ readOnly: true }}
      />

      <TextField
        id="phone"
        label="Phone Number"
        defaultValue={(data.phone_num) ? data.phone_num : 'N/A'}
        InputProps={{ readOnly: true }}
      />

      {data.about_me &&
        <TextField
        id="about"
        label="About Me"
        defaultValue={(data.about_me) ? data.about_me : 'N/A'}
        multiline
        InputProps={{ readOnly: true }}
        />
      }

      {data.subject &&
          <TextField
          id="subject"
          label="Subject List"
          defaultValue={data.subject ? data.subject.join(', ') : 'N/A'}
          multiline
          InputProps={{ readOnly: true }}
        />
      }

      {(data.num_hours != null) &&
        <TextField
        id="num_hours"
        label="Total Tutoring hours"
        defaultValue={data.num_hours}
        InputProps={{ readOnly: true }}
        />
      }

      <br/>
      <Button component={Link} to='/EditMyProfile' state={{ fromMyAccount: {data}}}
        variant="contained" size="large" style={{ marginBottom:"8px" }}>
          Edit
      </Button>
    </Box>
  );
}
