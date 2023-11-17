import { useEffect, useState,  } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import EditMyProfileInfo from './components/EditMyProfileInfo.js'
import FrontAPI from './api/FrontAPI.js';

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
  const [subjects, setSubjects] = useState([]);

  // retrieve data from db
  const getDepartmentList = async () => {
    // api GET to get list of favorite tutors
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    const response = await FrontAPI.getDepartments(session_id);

    switch(response?.status_code) {
        case 201:  // success
          console.log(response.message);
          return response?.result;

        case 200:
          console.log(response.message);
          break;

        default:
            console.log('Some errors happened from the server.');
    }
};

  // handle change of departments dropdown selection
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

  // do something when clicking save button (submit)
  const handleSaveSubmit = (e) => {
      e.preventDefault();
      accInfo['subjects'] = subjects;
      console.log(accInfo);
      // e.preventDefault();
      // console.log(accInfo);
      // Axios.put("http://localhost:3006/accountInfo/1", accInfo)
      // .then(response => console.log(response.data))
      // .catch(err => console.log(err));
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
        <EditMyProfileInfo
        accInfo={accInfo}
        handleChange={handleChange}
        departmentList={departmentList} 
        subjects={subjects} departments={departments}
        handleChangeDepartments={handleChangeDepartments}
        handleChangeSubjects={handleChangeSubjects}
        handleSaveSubmit={handleSaveSubmit}
        />}
      />
    </div>
  );
}
 
export default EditMyProfile;
