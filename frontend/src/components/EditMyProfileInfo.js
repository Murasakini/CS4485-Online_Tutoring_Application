import * as React from 'react';
import { TextField, Box, Button } from '@mui/material/';
import { Link } from 'react-router-dom';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function EditProfileInfo(props) {
  const DEPARTMENTS = props.departmentList;
  const SUBJECTS = props.subjectList;

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
        <img style= {{width: 250, height: 250, marginLeft:"6px", marginTop:"6px", objectFit:"contain"}} 
        src={props.accInfo.image} alt={props.accInfo.name} />
      </Box>
      <TextField
        id="name"
        label="First and Last Name"
        name="name"
        value={props.accInfo.name}
        onChange={props.handleChange}
        // InputProps={{ readOnly: true }}
      />
      {/* <TextField
        id="email"
        label="Email Address"
        name="email"
        value={props.accInfo.email}
        onChange={props.handleChange}
        InputProps={{ readOnly: true }}
        helperText="No edit allowed"
      /> */}
      {/* <TextField
        id="phone"
        label="Phone Number"
        name="phone"
        value={props.accInfo.phone}
        onChange={props.handleChange}
        InputProps={{ readOnly: true }}
        helperText="No edit allowed"
      /> */}
      
      {props.accInfo.about_me != null &&
        <TextField
          id="about_me"
          label="About Me"
          name="about_me"
          value={props.accInfo.about_me}
          onChange={props.handleChange}
          multiline
          // InputProps={{ readOnly: true }}
        />
      }

      <TextField
        id="subject"
        label="Subject List"
        name="subject"
        value={props.accInfo.subject[0]?.class_name ? 
               props.accInfo.subject.map((subj) => (' ' + subj?.class_name)) : 
               props.accInfo.subject.length > 0 ?
               props.accInfo.subject.join(', ') : 'N/A'}
        onChange={props.handleChange}
        InputProps={{ readOnly: true }}
        helperText="Change subjects by selecting department(s) and the corresponding subject(s) in the dropdown menu below."
      />

      <div>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Departments</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="departments"
            multiple
            value={props.departments}
            onChange={props.handleChangeDepartments}
            input={<OutlinedInput label="departments" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept} value={dept}>
                <Checkbox checked={props.departments.indexOf(dept) > -1} />
                <ListItemText primary={dept} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Subjects</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="subjects"
            multiple
            value={props.subjects}
            onChange={props.handleChangeSubjects}
            input={<OutlinedInput label="Subjects" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {SUBJECTS.map((subj) => (
              <MenuItem key={subj} value={subj}>
                <Checkbox checked={props.subjects.indexOf(subj) > -1} />
                <ListItemText primary={subj} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <br />
      <Button type="Submit"
      variant="contained" size="large" style={{marginBottom:"8px"}}>
        Save
      </Button>

      <Button component={Link} to='/MyProfile'
      variant="contained" size="large" style={{marginBottom:"8px"}}>
        Return
      </Button>
    </Box>
    );
  }
//}