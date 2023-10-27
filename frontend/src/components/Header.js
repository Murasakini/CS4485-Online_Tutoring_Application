import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
// import Avatar from "@mui/material/Avatar";
import logo from '../logo/logo.png'
import { Link } from "react-router-dom";
// import ProfilePhoto from "../logo/profile_photo.png";

function Header(props) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
            <Link to="/">
              <img style={{ width: 50, height: 50 }} src={logo} alt="logo" />
            </Link>

            <Typography variant="h6" sx={{ marginLeft:"auto" }}>
            <b>{props.title}</b>
            </Typography>

            {/* <Avatar
            sx={{ marginLeft: "auto", background: "white" }}
            alt="Remy Sharp"
            src={ProfilePhoto}
            /> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;