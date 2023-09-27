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

    return (
        <div>
            <Header title="FIND A TUTOR"/>
            <Body content={
                <Search />} />
        </div>
    );
}
 
export default FindTutor;