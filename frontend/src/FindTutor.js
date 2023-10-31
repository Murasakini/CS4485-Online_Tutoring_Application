import { useState } from 'react';
import * as React from 'react';
import Header from './components/Header.js'
import Body from './components/Body.js'
import Search from './components/Search.js'
import Axios from 'axios';

const FindTutor = () => {
    // create holder for values and function to update values
    const [searchInfo, setSearchInfo] = useState([]);
    const [searchResult, setSearchResult] = useState([]);

    // update values when any changes
    const handleChange = (e) => {
        // get input name and value
        const {name, value} = e.target;

        // update values
        setSearchInfo((prev) => {
            return {...prev, [name]: value};
        })
    }

    // retrieve data from db
    const getTutorList = async () => {
        // check which value is specified
        //if (searchInfo.instructorName || searchInfo.subject) {  
        
        try { 
            let query = '';
            if (searchInfo.instructorName)  query += `name=${searchInfo.instructorName}`;
            if (searchInfo.subject) query += `&subject=${searchInfo.subject}`;

            // api GET
            const response = await Axios.get(`http://localhost:3006/tutor?${query}`)

            if (response.data) setSearchResult(response.data);

        } catch(err) {
            if (err.response) {
                console.log(err.data);
                console.log(err.status);
                console.log(err.header);
            }
            else console.log(`Error:${err.message}`);
        }
        
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
        console.log(searchInfo);

        // reset search result
        setSearchResult([]);

        // retrieve tutor info
        getTutorList();
        console.log(searchResult);
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