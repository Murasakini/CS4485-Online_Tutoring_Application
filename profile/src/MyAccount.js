import { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Body from './components/Body.js';
import AccountInfo from './components/MyAccountInfo.js';
import Axios from 'axios';

const MyAccount = () => {
    // hold json data from db and function to store data
    const [accInfo, setAccInfo] = useState(null);

    // retrieve data from db
    useEffect(() => {
        // call GET api 
        Axios.get('http://localhost:3006/accountInfo/')

        // get result and store data
        .then(response => {
            setAccInfo(response.data);
            console.log(accInfo)
        })

        // handle error
        .catch(err => console.log(err))
    }, [])

    // // retrieve data from db
    // useEffect(() => {
    //     // api call to db
    //     fetch("http://localhost:3006/accountInfo")
    //     // return response
    //     .then((response) => {
    //         return response.json();
    //     })

    //     // store data
    //     .then((data) => {
    //         console.log(data);
    //         setAccInfo(data);
    //     });
    // }, []);

    return (
        <div>
            <Header title="MY ACCOUNT" />
            {/* return information only if retrieving data  is ready */}
            {accInfo && <Body content={<AccountInfo accInfo={accInfo[0]}/>}/>}

            {/* data is not ready -> display loading...  */}
            {!accInfo && <p>Loading...</p>}
        </div>
    );
}
 
export default MyAccount;