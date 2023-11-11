import { useState,  } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header.js';
import Body from './components/Body.js';
import EditMyProfileInfo from './components/EditMyProfileInfo.js'
import Axios from 'axios';

const EditMyProfile = () => {
    // get data passed from MyAccount page
    const location = useLocation();
    const {fromMyAccount} = location.state;
    
    // get data from MyAccount and store as initial state
    const [accInfo, setAccInfo] = useState({
        photo: fromMyAccount.data.photo,
        name: fromMyAccount.data.name,
        email: fromMyAccount.data.email, 
        phone: fromMyAccount.data.phone,
        about: fromMyAccount.data.about,
        subject: fromMyAccount.data.subject
    });

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
        // e.preventDefault();
        // console.log(accInfo);
        // Axios.put("http://localhost:3006/accountInfo/1", accInfo)
        // .then(response => console.log(response.data))
        // .catch(err => console.log(err));
    }

    return (
        <div>
            <Header title="MY ACCOUNT" />
            <Body content={
                <EditMyProfileInfo
                accInfo={accInfo}
                handleChange={handleChange} 
                handleSaveSubmit={handleSaveSubmit}/>}
            />
        </div>
    );
}
 
export default EditMyProfile;
