import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchResult from './SearchResult.js';
import { useState } from 'react';

const Search = (props) => {
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
        <React.Fragment>
            <Box component="form"
            sx={{ '& > :not(style)': { m: 1, width: '30ch' }, 
            marginBottom: "50px"}}
            noValidate
            autoComplete="off"
            textAlign="center"
            onSubmit={handleSearchSubmit}
            >
                <TextField id="instructorName" label="Instructor Name" variant="outlined" 
                name="instructorName" value={searchInfo.instructorName}
                onChange={handleChange} />

                <TextField id="subject" label="Subject" variant="outlined"
                name="subject" value={searchInfo.subject}
                onChange={handleChange} />

                <TextField id="dayOfWeek" label="Day of the Week" variant="outlined"
                name="dayOfWeek" value={searchInfo.dayOfWeek}
                onChange={handleChange} />

                <Button type="Submit" variant="contained" size="large">Search</Button>
            </Box>

            <SearchResult 
            instructorName={searchInfo.instructorName} 
            subjects={searchInfo.subject} 
            dayOfWeek={searchInfo.dayOfWeek} />

        </React.Fragment>
    );
}
 
export default Search;