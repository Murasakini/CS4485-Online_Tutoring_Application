import React from 'react';
import { useEffect, useState,  } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import EditMyProfileInfo from './components/EditMyProfileInfo.js'
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';

const EditMyProfile = () => {
  // get data passed from MyAccount page
  const location = useLocation();
  const {fromMyAccount} = location.state;
  
  // get data from MyAccount and store as initial state
  const [accInfo, setAccInfo] = useState({
      image: fromMyAccount.data.image,
      name: fromMyAccount.data.name,
      email: fromMyAccount.data.email, 
      phone: fromMyAccount.data.phone,
      about: fromMyAccount.data.about,
      subject: fromMyAccount.data.subject,
      subjects: []
  });

  // store department and subject selections
  const [departmentList, setDepartmentList] = useState([]);  // store list of departments from server
  const [departments, setDepartments] = useState([]);

  const [subjectList, setSubjectList] = useState([]);  // store list of departments from server
  const [subjects, setSubjects] = useState([]);

  // display error msg to the user
  const [severity, setSeverity] = useState('error');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // retrieve data from db
  const getDepartmentList = async () => {
    // api GET to get list of favorite tutors
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    const response = await FrontAPI.getDepartments(session_id);

    switch(response?.status_code) {
        case 201:  // success
          console.log(response);
          return response?.result;

        case 200:  // no list returned
          console.log(response?.message);
          break;

        default:
            console.log('Some errors happened from the server.');
    }
};

  // handle change of departments dropdown selection
  const handleChangeDepartments = async (event) => {
    const {
      target: { value },
    } = event;
    
    setDepartments(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );

    const departments = event.target.value;  // get the list of selections

    // api GET to get list of favorite tutors
    setSubjectList([]);  // reset 
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    const response = await FrontAPI.getSubjectsOfDepartments(session_id, departments);

    switch(response?.status_code) {
        case 201:  // success
          console.log(response);
          setSubjectList(response?.result);
          console.log(subjectList);
          return response?.result;

        case 200:  // no list returned
          setSubjectList([]);  // reset 
          console.log(response?.message);
          break;

        default:
          setSubjectList([]);  // reset 
          console.log('Some errors happened from the server.');
    }

    console.log(departments);
  };

  // handle change of subjects dropdown selection
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


  // update values when any changes
  const handleChange = (e) => {
      // get input name and value
      const {name, value} = e.target;

      // update values
      setAccInfo((prev) => {
      return {...prev, [name]: value}
      })
  };

  // submit updating subject request
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    // api POST to update subjects
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    const response = await FrontAPI.updateSubject(session_id, subjects);

    switch(response?.status_code) {
      case 201:  // success
        console.log(response);
        setSnackbarMessage(response?.message);
        setSnackbarOpen(true);
        setSeverity('success');  // set level of severity of message
        return response?.result;

      case 409:  // update fail
        // display messsage
        console.log(response?.message);
        setSeverity('error');
        setSnackbarMessage(response?.message);
        setSnackbarOpen(true);
        break;

      default:
        // display messsage
        console.log(response?.message);
        setSeverity('error');
        setSnackbarMessage('Some errors happened from the server.');
        setSnackbarOpen(true);
        console.log('Some errors happened from the server.');
    }

    accInfo['subjects'] = subjects;
    console.log(accInfo);
  }

  // store tutor list retrieved
  useEffect(() => {
    // define function to get tutor list
    const storeDepartmentList = async () => {
        // call function to get tutor list
        const dept = await getDepartmentList();  

        // store list
        if (dept) setDepartmentList(dept);
    }

    storeDepartmentList();
    console.log(departmentList);
  }, []);

  return (
    <div>
      <Header title="MY ACCOUNT" />
      <Body content={
        <React.Fragment>
          <EditMyProfileInfo
            accInfo={accInfo}
            departmentList={departmentList} subjectList={subjectList}
            handleChange={handleChange}
            subjects={subjects} departments={departments}
            handleChangeDepartments={handleChangeDepartments}
            handleChangeSubjects={handleChangeSubjects}
            handleSaveSubmit={handleSaveSubmit}
          />

            {/* CustomSnackbar for displaying error messages */}
            <CustomSnackbar
              open={snackbarOpen}
              message={snackbarMessage}
              onClose={() => setSnackbarOpen(false)}
              severity={severity}
            />
        </React.Fragment>
        }
      />
    </div>
  );
}
 
export default EditMyProfile;
