import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import MyProfileInfo from './components/MyProfileInfo.js';
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';

const TutorAccount = () => {
    // store previous page
    const history = useNavigate();

    // get data passed from MyAccount page
    const location = useLocation();
    const {fromSearch_FavoriteTutor} = location.state;  // get value passed from previous page
    const tutor_id = fromSearch_FavoriteTutor.info.tutor_id;  // return tutor_id from previous page
    console.log('tutor_id',tutor_id);

    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);

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

    // store tutor list retrieved
    useEffect(() => {

        // define function to get tutor list
        const tutorProfile = async () => {
            // call function to get tutor list
            const profile = await getTutorProfile();  

            // store list
            if (profile) setAccInfo(profile);
        }

        tutorProfile();
        console.log(accInfo);
    }, []);

    return (
        <React.Fragment>
            <Header title="TUTOR ACCOUNT" />
            {/* return information only if retrieving data  is ready */}
            {accInfo && 
                <Body content={
                    <React.Fragment>
                        <MyProfileInfo accInfo={accInfo} allowEdit={false} history={history}/>

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