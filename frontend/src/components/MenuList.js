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

import { Link } from 'react-router-dom';

export default function BasicList() {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <nav aria-label="main menu">
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

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary="Favorite" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding component={Link} to="/Appointments">
            <ListItemButton>
              <ListItemIcon>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Appointments" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding component={Link} to="/FindTutor">
            <ListItemButton>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Find a tutor" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>

      <Divider />

      <nav aria-label="account setting">
        <List>
          {/* <ListItem disablePadding component={Link} to="/MyAccount">
            <ListItemButton>
              <ListItemText primary="My Account" />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding component={Link} to="/SignUp">
            <ListItemButton>
              <ListItemText primary="Sign Up" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding component={Link} to="/SignIn">
            <ListItemButton>
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}