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

const DEPARTMENTS = [
  [0, 'MATH'], [2, 'LANGUAGE'],  [3, 'SCIENCE'], [1, 'SOCIOLOGY']
];

const SUBJECTS = [
  [0, 'MATH', 1, 'Calculus 1'], [0, 'MATH', 4, 'Calculus 2'], [3, 'SCIENCE', 2, 'Computer'], 
  [2, 'LANGUAGE', 2, 'English'], [2, 'LANGUAGE', 5, 'French'],
  [1, 'SOCIOLOGY', 3, 'History'], [0, 'MATH', 2, 'Linear Algebra'], 
  [3, 'SCIENCE', 6, 'Physics', [1, 'SOCIOLOGY', 5, 'US Government']]
];

export default function EditProfileInfo(props) {
  const [departments, setDepartments] = React.useState([]);
  const [departmentNames, setDepartmentName] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [subjectNames, setSubjectNames] = React.useState([]);

  const handleChangeDepartments = (event) => {
    const {
      target: { value },
    } = event;
    
    setDepartments(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );

    console.log(departments);
  };

  const handleChangeSubjects = (event) => {
    const {
      target: { value },
    } = event;
    setSubjects(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );

    console.log(subjects);
  };

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
        src={props.accInfo.image} alt="profile_photo" />
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

      <div>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Departments</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={departments}
            onChange={handleChangeDepartments}
            input={<OutlinedInput label="Departments" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept[0]} value={dept[0]}>
                <Checkbox checked={departments.indexOf(dept[0]) > -1} />
                <ListItemText primary={dept[1]} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Subjects</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={subjects}
            onChange={handleChangeSubjects}
            input={<OutlinedInput label="Subjects" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {SUBJECTS.map((subj) => (
              departments.includes(subj[0]) &&
              <MenuItem key={subj[0].toString() + subj[2].toString} value={[subj[0], subj[2]]}>
                <Checkbox checked={subjects.indexOf([subj[0], subj[2]]) > -1} />
                <ListItemText primary={subj[1] + ' - ' + subj[3]} />
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