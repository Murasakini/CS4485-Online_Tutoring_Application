import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home.js';
import MyProfile from './MyProfile.js';
import EditMyProfile from './EditMyProfile.js'
import FindTutor from './FindTutor.js';
import './App.css'
import EditMyAccount from './EditMyAccount.js'
import SignIn from './SignIn.js';
import SignUp from './SignUp.js';
import AppointmentScheduler from './AppointmentScheduler.js';
import TwoFactorAuthentication from './TwoFactorAuthentication.js';
import Favorite from './Favorite.js';
import Leaderboard from './Leaderboard.js';
import TutorProfile from './TutorProfile.js';
import TutorScheduler from './TutorScheduler.js'

export const UserContext = React.createContext(null);

function App() {
  // global variable to hold account type
  const [user, setUser] = useState(null); 
  
  return (
    <Router>
      <div className="App">
        <UserContext.Provider value={{ user: user, setUser: setUser }}>
          <div className="content">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/SignUp' element={<SignUp />} />
              <Route path='/SignIn' element={<SignIn />} />
              <Route path='/MyProfile' element={<MyProfile />} />
              <Route path='/EditMyProfile' element={<EditMyProfile />} />
              <Route path='/Favorite' element={<Favorite />} />
              <Route path='/TutorProfile' element={<TutorProfile />} />
              <Route path='/AppointmentScheduler' element={<AppointmentScheduler />} />
              <Route path='/TutorScheduler' element={<TutorScheduler />} />
              <Route path='/FindTutor' element={<FindTutor />} />
              <Route path='/EditMyAccount' element={<EditMyAccount />} />
              <Route path='/TwoFactorAuthentication' element={<TwoFactorAuthentication/>} />
              <Route path='/Leaderboard' element={<Leaderboard />} />
            </Routes>
          </div>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
