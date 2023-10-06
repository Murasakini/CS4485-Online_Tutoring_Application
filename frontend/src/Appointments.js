import Header from './components/Header.js'
import Body from './components/Body.js';
import AppointmentList from './components/AppointmentList.js';

const Appointments = () => {
    return (
        <div>
            <Header title='APPOINTMENTS' />
            <Body content={<AppointmentList title="Upcomming Appointments"/>}>
            </Body>
        </div>
    );
}
 
export default Appointments;