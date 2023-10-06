import { useState } from 'react';
import * as React from 'react';
import Header from './components/Header.js'
import Body from './components/Body.js'
import Search from './components/Search.js'

const FindTutor = () => {
    // const [instructorName, setInstructorName] = useState('')
    // const [subject, setSubject] = useState('')
    // const [dayOfWeek, setDayOfWeek] = useState('')

    // const handleSearchSubmit = (e) => {
    //     e.preventDefault();
    //     console.log(instructorName);
    //     console.log(subject);
    //     console.log(dayOfWeek);
    //   }

    // create holder for values and function to update values
    const [searchInfo, setSearchInfo] = useState({
        instructorName: "",
        subject: "",
        dayOfWeek: "",
    })

    // update values when any changes
    const handleChange = (e) => {
        // get input name and value
        const{name, value} = e.target;

        // update values
        setSearchInfo((prev) => {
            return {...prev, [name]: value};
        })
    }

    // do something when clicking save button (submit)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log(searchInfo);
    }


    return (
        <div>
            <Header title="FIND A TUTOR"/>
            <Body content={<Search searchInfo={searchInfo}
            handleChange={handleChange} handleSearchSubmit={handleSearchSubmit}/>} 
            />
        </div>
    );
}
 
export default FindTutor;