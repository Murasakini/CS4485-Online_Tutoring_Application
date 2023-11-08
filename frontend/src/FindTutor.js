import { useState } from 'react';
import * as React from 'react';
import Header from './components/Header.js'
import Body from './components/Body.js'
import Search from './components/Search.js'
import FrontAPI from './api/FrontAPI.js';

const FindTutor = () => {
    // create holder for values and function to update values
    const [searchInfo, setSearchInfo] = useState({});
    const [searchResult, setSearchResult] = useState([]);

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
        // const session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        // add session id to the search request
        searchInfo['session_id'] = session_id;
        const response = await FrontAPI.findTutors(searchInfo);

        switch(response?.status_code) {
            case 201:  // found
                console.log(response);

                // store the search result
                setSearchResult([]);
                setSearchResult(response?.result);
                break;

            default:
                console.log('Some error happened')
        }
    };

    // add tutor into favorit list
    const handleAddTutor = async (tutor_id) => {
        
        // api POST to add user to the favorite list
        // const session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'
        const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
        const response = await FrontAPI.addUserFavorite(session_id, tutor_id);

        switch(response?.status_code) {
            case 201:  // add successfully
                console.log(response);
                break;
            
            case 409:  // error adding tutor
                console.log(response)
                break;

            default: 
                console.log('Some errors happened while making api call for adding')
        }
    }

    // do something when clicking save button (submit)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // reset search result
        setSearchResult([]);

        // retrieve tutor info
        getTutorList();
        console.log(searchResult.result);
    }


    return (
        <React.Fragment>
            <Header title="FIND A TUTOR"/>
            <Body content={<Search searchInfo={searchResult}
            handleChange={handleChange} 
            handleSearchSubmit={handleSearchSubmit}
            handleAddTutor={handleAddTutor}/>} 
            />
        </React.Fragment>
    );
}
 
export default FindTutor;