import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import Person2Icon from '@mui/icons-material/Person2';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { Link } from 'react-router-dom';
import FrontAPI from '../api/FrontAPI.js';
import { UserContext } from '../App.js';

export default function BasicList() {
  // global variable to hold account type
  const { user, setUser } = React.useContext(UserContext);
  
  // delete a tutor
  const logOut = async () => {
    // api get to log out
    const session_id = document.cookie.split("; ").find((row) => row.startsWith("sessionCookie="))?.split("=")[1];
    const response = await FrontAPI.logOut(session_id);

    switch(response?.status_code) {
        case 201:  // add successfully
            // display messsage
            console.log(response);

            break;

        case 409:  // error adding tutor
            // display messsage
            console.log(response?.message);

            break;

        default: 
            console.log('Some errors happened while making api call for adding')
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <nav aria-label="main menu">
        {user &&
          <List>
            <ListItem disablePadding component={Link} to="/">
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding component={Link} to="/MyProfile">
              <ListItemButton>
                <ListItemIcon>
                  <Person2Icon />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>

            {user === 'user' &&
              <ListItem disablePadding component={Link} to="/Favorite">
                <ListItemButton>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Favorite" />
                </ListItemButton>
              </ListItem>
            }

            {user === 'user' &&
              <ListItem disablePadding component={Link} to="/AppointmentScheduler">
                <ListItemButton>
                  <ListItemIcon>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Appointments" />
                </ListItemButton>
              </ListItem>
            }

            {user === 'tutor' && 
              <ListItem disablePadding component={Link} to="/TutorScheduler">
                <ListItemButton>
                  <ListItemIcon>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Tutor Scheduler" />
                </ListItemButton>
              </ListItem>
            }

            <ListItem disablePadding component={Link} to="/FindTutor">
              <ListItemButton>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Find a tutor" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding component={Link} to="/Leaderboard">
              <ListItemButton>
                <ListItemIcon>
                  <LeaderboardIcon />
                </ListItemIcon>
                <ListItemText primary="Leaderboard" />
              </ListItemButton>
            </ListItem>
          </List>
        }
      </nav>

      <Divider />

      <nav aria-label="Sign-out">
        <List>
          <ListItem disablePadding component={Link} to="/SignIn"
            onClick={() => logOut()}>
            <ListItemButton>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
