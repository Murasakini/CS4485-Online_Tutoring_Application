import * as React from "react";
import { TextField, Box, Button } from "@mui/material/";

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
    image_path: props.accInfo.image_path
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
        <img style= {{width: 300, height: 300, marginLeft:"6px", marginTop:"6px", objectFit:"contain"}} 
        src={data.image_path} alt="profile_photo" />
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
            defaultValue={data.subject ? data.subject.map((subj) => (' ' + subj.class_name)) : 'N/A'}
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
        <br />

        <Button
            variant="contained"
            size="large"
            style={{ marginBottom: "8px" }}
            onClick={() => props.history(-1)}
        >
            Go Back
        </Button>

    </Box>
  );
}
