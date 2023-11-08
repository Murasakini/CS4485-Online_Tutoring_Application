import Header from './components/Header.js'
import Body from './components/Body.js';
import FavortieTutor from './components/FavoriteTutors.js';
import { useEffect, useState } from 'react';
import FrontAPI from './api/FrontAPI.js';

const Favorite = () => {
        // hold json data from db and function to store data
        const [tutorList, setTutorList] = useState([]);

        // retrieve data from db
        const getTutorList = async () => {
            // api GET to get list of favorite tutors
            //const session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'
            const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
            const response = await FrontAPI.getFavoriteTutors(session_id);

            switch(response?.status_code) {
                case 201:  // success
                    console.log('Retrieve favorite list successful');
                    return response?.result;

                default:
                    console.log('Some error happened')
            }
        };

        // delete a tutor
        const handleDeleteTutor = async (tutor_id) => {
            // api POST to add user to the favorite list
            //const session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'
            const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
            const response = await FrontAPI.deleteUserFavorite(session_id, tutor_id);

            switch(response?.status_code) {
                case 201:  // add successfully
                    console.log(response);

                    // create new list without deleted tutor
                    const newTutorList = tutorList.filter((tutor) => {
                        return tutor.tutor_id !== tutor_id;
                    })

                    // store new list
                    setTutorList(newTutorList);

                    break;
                
                case 409:  // error adding tutor
                    console.log(response)
                    break;

                default: 
                    console.log('Some errors happened while making api call for adding')
            }
        };

        // store tutor list retrieved
        useEffect(() => {
            // define function to get tutor list
            const storeTutorList = async () => {
                // call function to get tutor list
                const tutors = await getTutorList();  

                // store list
                if (tutors) setTutorList(tutors);
            }

            storeTutorList();
            console.log(tutorList);
        }, []);

    return (
        <div>
            <Header title='FAVORITE' />       
            <Body content={<FavortieTutor tutorList={tutorList}
            handleDeleteTutor={handleDeleteTutor}/>}>
            </Body>
        </div>
    )
}

export default Favorite;