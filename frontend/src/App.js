import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home.js';
import MyProfile from './MyProfile.js';
import EditMyProfile from './EditMyProfile.js'
import Appointments from './Appointments.js';
import FindTutor from './FindTutor.js';
import './App.css'
import MyAccount from './MyAccount.js';
import EditMyAccount from './EditMyAccount.js'
import SignIn from './SignIn.js';


function App() {
  return (
    <Router>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/SignIn' element={<SignIn />} />
            <Route path='/MyProfile' element={<MyProfile />} />
            <Route path='/EditMyProfile' element={<EditMyProfile />} />
            <Route path='/Appointments' element={<Appointments />} />
            <Route path='/FindTutor' element={<FindTutor />} />
            <Route path='/MyAccount' element={<MyAccount />} />
            <Route path='/EditMyAccount' element={<EditMyAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
