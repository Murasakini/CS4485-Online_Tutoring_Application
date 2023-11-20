import React from 'react';
import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import TutorProfileInfo from './components/TutorProfileInfo.js';
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';

const TutorAccount = () => {
    // store previous page
    const history = useNavigate();

    // get data passed from MyAccount page
    const location = useLocation();
    let fromSearch_FavoriteTutor = null;
    if (location.state)  // check if no value from previous page passed
        ({fromSearch_FavoriteTutor} = location.state);  // get value passed from previous page
    const tutor_id = fromSearch_FavoriteTutor?.info.tutor_id;  // return tutor_id from previous page

    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);
    const [profileImg, setProfileImg] = useState(null);

    // display error msg to the user
    const [severity, setSeverity] = useState('error');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // retrieve data from db
    const getTutorProfile = async () => {
        // api GET to get list of favorite tutors
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.getTutorProfile(session_id, tutor_id);
        console.log(response);
        switch(response?.status_code) {
            case 201:  // success
                // display messsage
                console.log(response);
                setSnackbarMessage(response?.message);
                setSnackbarOpen(false);
                setSeverity('success');  // set level of severity of message

                return response.result;
            
            case 200:  // no profile returned
                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                break;

            // add case 401:

            default:
                // display messsage
                console.log('Something wrong happened from the server');
                setSeverity('error');
                setSnackbarMessage('Something wrong happened from the server');
                setSnackbarOpen(true);
        }
    };

    // retrieve profile image from server
    const getProfileImage = async () => {
        // api GET to get my profile
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];

        fetch(FrontAPI.baseURL + `/api/v1/get_image?session_id=${session_id}&tutor_id=${tutor_id}`)
          .then((response) => response.blob())
          .then((myBlob) => {
            const objectURL = URL.createObjectURL(myBlob);
            setProfileImg(objectURL);
          })
          .catch(error => {
            console.error('There profile image is not found.', error);
          });
    };

    // store tutor list retrieved
    useEffect(() => {

        // define function to get tutor list
        const tutorProfile = async () => {
            // call function to get tutor list
            const profile = await getTutorProfile(); 
            await getProfileImage(); 

            // store list
            if (profile) setAccInfo(profile);
        }

        tutorProfile();
        console.log(accInfo);
    }, []);

    return (
        <React.Fragment>
            <Header title="TUTOR ACCOUNT" />
            {!fromSearch_FavoriteTutor ? 
                <Navigate to='/' /> :
            
                /* return information only if retrieving data  is ready */
                accInfo && 
                    <Body content={
                        <React.Fragment>
                            <TutorProfileInfo 
                            accInfo={accInfo} 
                            history={history}
                            profileImg={profileImg}/>

                            {/* CustomSnackbar for displaying error messages */}
                            <CustomSnackbar
                            open={snackbarOpen}
                            message={snackbarMessage}
                            onClose={() => setSnackbarOpen(false)}
                            severity={severity}/>
                        </React.Fragment>}
                />}
        </React.Fragment>
    );
}
 
export default TutorAccount;