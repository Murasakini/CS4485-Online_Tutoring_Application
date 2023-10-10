import React from "react";
import {Box, Grid, Stack, Paper, Typography} from '@mui/material'
import { styled } from '@mui/material/styles';
import profile_photo from "../logo/profile_photo.png";

const Profile = (props) => {
    // define style for item tag
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
        fontSize: '20px',
        wordBreak: "break-word",
      }));

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={3} padding={2}>
                <Item>
                    <Grid container spacing={1} columns={12} 
                    justifyContent="center" alignItems="center">

                        {/* profile photo */}
                        <Grid item xs={4} >
                            <img style= {{ width: 200, height: 200, 
                            marginLeft:"6px", marginTop:"6px",}} 
                            src={profile_photo} alt="profile_photo" />
                        </Grid> 
                        
                        {/* personal info */}
                        <Grid item xs={8}>
                            Personal Information
                            <Typography style={{color:"black"}}>Name: Puppy</Typography> 
                            <Typography style={{color:"black"}}>Email: puppy.cute@animal.com</Typography> 
                            <Typography style={{color:"black"}}>Phone: 999-999-9999</Typography> 
                        </Grid>
                    </Grid> 
                </Item>
                <Item>
                    About Me
                    <Typography style={{color:"black"}}>I am the cutest puppy in the world.</Typography>
                </Item>
                <Item>
                    Tutoring Hours
                    <Typography style={{color:"black"}}>2</Typography>
                </Item>
                
                {/* only display list of subjects if profile type is tutor */}
                { (props.profileType === "tutor") &&
                <Item>
                    List of Subjects
                    <Typography style={{color:"black"}}>Database</Typography>
                    <Typography style={{color:"black"}}>Operating System</Typography>
                </Item>
                }
            </Stack>
        </Box>
    );
}
 
export default Profile;