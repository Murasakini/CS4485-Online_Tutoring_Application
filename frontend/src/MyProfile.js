import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Body from './components/Body.js';
import MyProfileInfo from './components/MyProfileInfo.js';
import FrontAPI from './api/FrontAPI.js';
import CustomSnackbar from './components/CustomSnackbar.js';
import { Navigate } from 'react-router-dom';

const MyAccount = () => {
    const[verified, setVerified] = useState(true);   // hold status of session id

    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);
    const [uploadImg, setUploadImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);

    // display error msg to the user
    const [severity, setSeverity] = useState('error');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // retrieve data from db
    const getMyProfile = async () => {
        // api GET to get my profile
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.getMyProfile(session_id);

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

        fetch(FrontAPI.baseURL + `/api/v1/get_image?session_id=${session_id}`)
          .then((response) => response.blob())
          .then((myBlob) => {
            const objectURL = URL.createObjectURL(myBlob);
            setProfileImg(objectURL);
          })
          .catch(error => {
            // display messsage
            console.error('There profile image is not found.', error);
            console.log('There profile image is not found.');
            setSeverity('error');
            setSnackbarMessage('There profile image is not found.');
            setSnackbarOpen(true);
          });
    };

    // store tutor list retrieved
    useEffect(() => {
        // define function to get tutor list
        const myProfile = async () => {
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
            const profile = await getMyProfile();   // get profile info
            await getProfileImage();  // get image 

            // store list
            if (profile) setAccInfo(profile);
        }

        myProfile();
        console.log(accInfo);
    }, []);

    // store selected file
    const fileSelectHandler = (event) => {
        //event.preventDefault();
        const inputImage = event.target.files[0];  // store the file select      
        setUploadImg(inputImage);
    }

    // upload file to server
    const handleUpload = async (event) => {
        event.preventDefault();
        
        // api GET to get my profile
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.uploadImage(session_id, uploadImg);

        switch(response?.status_code) {
            case 201:  // success
                // display messsage
                console.log(response);
                setSnackbarMessage(response?.message + ' Refresh to see the new image.');
                setSnackbarOpen(true);
                setSeverity('success');  // set level of severity of message
                
                break;

            case 400:
                event.preventDefault();
                // display messsage
                console.log(response?.message);
                setSeverity('error');
                setSnackbarMessage(response?.message);
                setSnackbarOpen(true);

                break;

            default:
                event.preventDefault();
                // display messsage
                console.log('Something wrong happened from the server');
                setSeverity('error');
                setSnackbarMessage('Something wrong happened from the server');
                setSnackbarOpen(true);
        }
    }

    return (
        <React.Fragment>
            <Header title="MY PROFILE" />
            {/* return information only if retrieving data  is ready */}
            {!verified ?
                <Navigate to='/SignIn' replace={true} /> :

                accInfo &&
                <Body content={
                    <React.Fragment>
                        <MyProfileInfo 
                        accInfo={accInfo} 
                        fileSelectHandler={fileSelectHandler}
                        handleUpload={handleUpload}
                        profileImg={profileImg}
                        />

                        {/* CustomSnackbar for displaying error messages */}
                        <CustomSnackbar
                        open={snackbarOpen}
                        message={snackbarMessage}
                        onClose={() => setSnackbarOpen(false)}
                        severity={severity}
                        />
                    </React.Fragment>}
                />}
        </React.Fragment>
    );
}
 
export default MyAccount;