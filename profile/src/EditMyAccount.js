import Header from './components/Header.js'
import Body from './components/Body.js';
import EditAccountInfo from './components/EditMyAccountInfo.js'


const EditMyAccount = () => {
    return (
        <div>
            <Header title="MY ACCOUNT" />
            <Body content={
                <EditAccountInfo />}
            />
        </div>
    );
}
 
export default EditMyAccount;
