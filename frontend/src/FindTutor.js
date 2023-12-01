import { useState, useEffect } from 'react';
import * as React from 'react';
import Header from './components/Header.js'
import Body from './components/Body.js'
import Search from './components/Search.js'
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';
import { Navigate } from 'react-router-dom';

const FindTutor = () => {
    const[verified, setVerified] = useState(true);   // hold status of session id

    // create holder for values and function to update values
    const [searchInfo, setSearchInfo] = useState({});
    const [searchResult, setSearchResult] = useState([]);
    const [progress, setProgress] = useState(null);

    // display error msg to the user
    const [severity, setSeverity] = useState('error');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        // define function to get tutor list
        const verifySession = async () => {
            // validate session id
            const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
            const verify = await FrontAPI.verifySession(session_id);
            console.log("verfiy", verify);

            if (verify.status_code === 400 || verify.status_code === 401)  {// invalid or missing session id
                setVerified(false);
                return;
            }

            setVerified(true);
        }

        verifySession();
    }, []);

    // update values when any changes
    const handleChange = (e) => {
        // get input name and value
        const {name, value} = e.target;

        // update values of input fields
        setSearchInfo((prev) => {
            return {...prev, [name]: value};
        })
    }

    // retrieve data from db
    const getTutorList = async () => {
        // api GET to get list of favorite tutors
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        searchInfo['session_id'] = session_id;  // add session id to the search request

        const response = await FrontAPI.findTutors(searchInfo);

        switch(response?.status_code) {
            case 201:  // found
                // display messsage
                console.log(response);
                setSeverity('success');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                // store the search result
                setSearchResult([]);
                setSearchResult(response?.result);
                

                // set status of progress/ for displaying waiting icon
                setProgress(false);  // finish progress 

                break;

            case 200:  // duplicate adding
                // display messsage
                console.log(response?.message);
                setSeverity('info');  // set level of severity of message
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);
                break;

            case 401:  // invalid session id
                setVerified(false);

                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                // set status of progress/ for displaying waiting icon
                setProgress(false);  // finish progress
                break;

            default:
                // display messsage
                console.log('Some error happened');
                setSeverity('error');
                setSnackbarMessage('Some errors happened');
                setSnackbarOpen(true);

                // set status of progress/ for displaying waiting icon
                setProgress(false);  // finish progress 
        }
    };

    // add tutor into favorit list
    const handleAddTutor = async (tutor_id) => {
        
        // api POST to add user to the favorite list
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.addUserFavorite(session_id, tutor_id);

        switch(response?.status_code) {
            case 201:  // add successfully
                // display messsage
                console.log(response);
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                // set level of severity of message
                setSeverity('success');

                break;

            case 401:  // invalid session id
                setVerified(false);

                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                // set status of progress/ for displaying waiting icon
                setProgress(false);  // finish progress
                break;

            case 403:  // duplicate adding
                // display messsage
                console.log(response?.message);
                setSeverity('warning');  // set level of severity of message
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);
                break;
            
            case 409:  // error adding tutor
                // display messsage
                console.log('Some error happened');
                setSeverity('error');  // set level of severity of message
                setSnackbarMessage(response?.status_code + ": " + response?.message);
                setSnackbarOpen(true);

                break;

            default: 
                // display messsage
                setSeverity('error');  // set level of severity of message
                setSnackbarMessage(response?.status_code + ": " + response?.message);
                setSnackbarOpen(true);
                console.log('Some errors happened while adding the tutor')
        }
    }

    // do something when clicking save button (submit)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // set status of progress/ for displaying waiting icon
        setProgress(true);  // start searching progress

        // reset search result
        setSearchResult([]);

        // retrieve tutor info
        getTutorList();
        console.log(searchResult.result);
    }


    return (
        <React.Fragment>
            <Header title="FIND A TUTOR"/>

            {!verified ?
                <Navigate to='/SignIn' replace={true} /> :

                <Body content={
                    <React.Fragment>
                        <Search 
                        searchInfo={searchResult}
                        handleChange={handleChange} 
                        handleSearchSubmit={handleSearchSubmit}
                        handleAddTutor={handleAddTutor}
                        progress={progress}/>

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
    );
}
 
export default FindTutor;