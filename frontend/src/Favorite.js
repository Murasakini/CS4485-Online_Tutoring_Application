import Header from './components/Header.js'
import Body from './components/Body.js';
import FavortieTutor from './components/FavoriteTutors.js';
import React, { useEffect, useState } from 'react';
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';
import { Navigate } from 'react-router-dom';

const Favorite = () => {
    const[verified, setVerified] = useState(true);   // hold status of session id

    // hold json data from db and function to store data
    const [tutorList, setTutorList] = useState([]);

    // display error msg to the user
    const [severity, setSeverity] = useState('error');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // retrieve data from db
    const getTutorList = async () => {
        // api GET to get list of favorite tutors
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.getFavoriteTutors(session_id);

        switch(response?.status_code) {
            case 201:  // success
                console.log('Retrieve favorite list successful');
                return response?.result;

            default:
                console.log('Some error happened')
        }
    };

    // delete a tutor
    const handleDeleteTutor = async (tutor_id) => {
        // api POST to add user to the favorite list
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.deleteUserFavorite(session_id, tutor_id);

        switch(response?.status_code) {
            case 201:  // add successfully
                // display messsage
                console.log(response);
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);
                setSeverity('success');  // set level of severity of message

                // create new list without deleted tutor
                const newTutorList = tutorList.filter((tutor) => {
                    return tutor.tutor_id !== tutor_id;
                })

                // store new list
                setTutorList(newTutorList);

                break;

            case 409:  // error adding tutor
                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                break;

            default: 
                console.log('Some errors happened while making api call for adding')
        }
    };

    // store tutor list retrieved
    useEffect(() => {
        // define function to get tutor list
        const storeTutorList = async () => {
            // validate session id
            const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
            const verify = await FrontAPI.verifySession(session_id);
            console.log("verfiy", verify);

            if (verify.status_code === 400 || verify.status_code === 401)  {// invalid or missing session id
                setVerified(false);
                return;
            }

            setVerified(true);

            // call function to get tutor list
            const tutors = await getTutorList();  

            // store list
            if (tutors) setTutorList(tutors);
        }

        storeTutorList();
        console.log(tutorList);
    }, []);

    return (
        <React.Fragment>
            <Header title='FAVORITE' />     

            {!verified ?
                <Navigate to='/SignIn' replace={true} /> :
  
                <Body content={
                    <React.Fragment>
                        <FavortieTutor tutorList={tutorList}
                        handleDeleteTutor={handleDeleteTutor}/>

                        {/* CustomSnackbar for displaying error messages */}
                        <CustomSnackbar
                        open={snackbarOpen}
                        message={snackbarMessage}
                        onClose={() => setSnackbarOpen(false)}
                        severity={severity}/>
                    </React.Fragment>
            }/>
        }
        </React.Fragment>
    )
}

export default Favorite;