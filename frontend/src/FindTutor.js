import { useState } from 'react';
import * as React from 'react';
import Header from './components/Header.js'
import Body from './components/Body.js'
import Search from './components/Search.js'
import Axios from 'axios';
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
        const session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'

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

        
        // try { 
        //     let query = '';
        //     if (searchInfo.instructorName)  query += `name=${searchInfo.instructorName}`;
        //     if (searchInfo.subject) query += `&subject=${searchInfo.subject}`;

        //     // api GET
        //     const response = await Axios.get(`http://localhost:3006/tutor?${query}`)

        //     if (response.data) setSearchResult(response.data);

        // } catch(err) {
        //     if (err.response) {
        //         console.log(err.data);
        //         console.log(err.status);
        //         console.log(err.header);
        //     }
        //     else console.log(`Error:${err.message}`);
        // }
        
    };

    // add tutor into favorit list
    const handleAddTutor = async (i) => {
        try {
            // api POST to add tutor into favorite list 
            const response = await Axios.post("http://localhost:3006/favoriteTutors/", searchResult[i]);
            console.log(response.data);
        } catch(err) {
            if (err.response) {
                console.log(err.data);
                console.log(err.status);
                console.log(err.header);
            }
            else console.log(`Error: ${err.message}`);
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