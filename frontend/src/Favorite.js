import Header from './components/Header.js'
import Body from './components/Body.js';
import FavortieTutor from './components/FavoriteTutors.js';
import { useEffect, useState } from 'react';
import Axios from 'axios';

const Favorite = () => {
        // hold json data from db and function to store data
        const [tutorList, setTutorList] = useState([]);

        // retrieve data from db
        const getTutorList = async () => {
            // api GET
            try {
            const response = await Axios.get('http://localhost:3006/favoriteTutors/');
            return response.data;

            } catch(err) {
                if (err.response) {
                    console.log(err.data);
                    console.log(err.status);
                    console.log(err.header);
                }
                else console.log(`Error:${err.message}`);
            }

            // TODO: add error handling
        };

        // delete a tutor
        const handleDeleteTutor = async (id) => {
            try {
                // api DELETE with id
                await Axios.delete(`http://localhost:3006/favoriteTutors/${id}`);

            } catch(err) {
                if (err.response) {
                    console.log(err.data);
                    console.log(err.status);
                    console.log(err.header);
                }
                else console.log(`Error:${err.message}`);
            }

            // create new list without deleted tutor
            const newTutorList = tutorList.filter((tutor) => {
                return tutor.id !== id;
            })

            // store new list
            setTutorList(newTutorList);
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