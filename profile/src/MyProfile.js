import { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Body from './components/Body.js';
import MyProfileInfo from './components/MyProfileInfo.js';
import Axios from 'axios';

const MyAccount = () => {
    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);

    // retrieve data from db
    useEffect(() => {
        // call GET api 
        Axios.get('http://localhost:3006/accountInfo1/')

        // get result and store data
        .then(response => {
            setAccInfo(response.data);
            console.log(accInfo)
        })

        // handle error
        .catch(err => console.log(err))
    }, [])

    return (
        <div>
            <Header title="MY ACCOUNT" />
            {/* return information only if retrieving data  is ready */}
            {accInfo && <Body content={<MyProfileInfo accInfo={accInfo[0]}/>}/>}

            {/* data is not ready -> display loading...  */}
            {!accInfo && <p>Loading...</p>}
        </div>
    );
}
 
export default MyAccount;