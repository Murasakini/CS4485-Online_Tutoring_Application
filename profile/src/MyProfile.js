import Header from './components/Header.js'
import Body from './components/Body.js';
import Profile from './components/Profile.js';

const MyProfile = () => {
    return (
        <div>
            <Header title="MY PROFILE"/>
            <Body content={<Profile profileType="tutor"/>}/>
        </div>
    );
}
 
export default MyProfile;