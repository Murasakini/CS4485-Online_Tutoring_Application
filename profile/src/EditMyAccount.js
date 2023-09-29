import { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Body from './components/Body.js';
import EditAccountInfo from './components/EditMyAccountInfo.js'
import Axios from 'axios';


const EditMyAccount = () => {
    // create holder for values and function to update values
    const [accInfo, setAccInfo] = useState([{
        name: 'Puppy Cute',
        email: 'puppy.cute@animal.com',
        phone: '(999)999-999',
        about: 'I am the cutest puppy in the world.',
        subject: 'Math',
    }]);

    // // retrieve data from db
    // useEffect(() => {
    //     // call GET api 
    //     Axios.get('http://localhost:3006/accountInfo/')

    //     // get result and store data
    //     .then(response => {
    //         setAccInfo(response.data);
    //         console.log(accInfo)
    //     })

    //     // handle error
    //     .catch(err => console.log(err))
    // }, [])

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
        console.log(accInfo);
        Axios.put("http://localhost:3006/accountInfo/1", accInfo)
        .then(response => console.log(response.data))
        .catch(err => console.log(err));
    }


    return (
        <div>
            <Header title="MY ACCOUNT" />
            <Body content={
                <EditAccountInfo
                accInfo={accInfo}
                handleChange={handleChange} 
                handleSaveSubmit={handleSaveSubmit}/>}
            />
        </div>
    );
}
 
export default EditMyAccount;
