import { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Body from './components/Body.js';
import MyProfileInfo from './components/MyProfileInfo.js';
import FrontAPI from './api/FrontAPI.js';

const MyAccount = () => {
    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);

    // display error msg to the user
    const [severity, setSeverity] = useState('error');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // retrieve data from db
    const getMyProfile = async () => {
        // api GET to get list of favorite tutors
        //const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const session_id = '5f2c087ec29249a89a6359084eb62e5e';
        const response = await FrontAPI.getMyProfile(session_id);

        switch(response?.status_code) {
            case 201:  // success
                // display messsage
                console.log(response);
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);
                setSeverity('success');  // set level of severity of message

                return response.result;
            
            case 200:  // no profile returned
                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                break;

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
        const myProfile = async () => {
            // call function to get tutor list
            const profile = await getMyProfile();  

            // store list
            if (profile) setAccInfo(profile);
        }

        myProfile();
        console.log(accInfo);
    }, []);

    return (
        <div>
            <Header title="MY ACCOUNT" />
            {/* return information only if retrieving data  is ready */}
            {accInfo && <Body content={<MyProfileInfo accInfo={accInfo}/>}/>}

            {/* data is not ready -> display loading...  */}
            {!accInfo && <p>Loading...</p>}
        </div>
    );
}
 
export default MyAccount;