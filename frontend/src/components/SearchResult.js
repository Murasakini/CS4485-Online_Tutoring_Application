import React from "react";
import {Box, Stack, Paper, Typography} from '@mui/material'
import { styled } from '@mui/material/styles';

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
            <Typography textAlign="center" variant="h4">Search Result</Typography>
            <Stack spacing={3} padding={2}>
                <Item>
                    Instructor Name
                    <Typography style={{color:"black"}}>{props.instructorName}</Typography>
                </Item>
                <Item>
                    Subjects
                    <Typography style={{color:"black"}}>{props.subjects}</Typography>
                </Item>
                <Item>
                    Days of Week
                    <Typography style={{color:"black"}}>{props.dayOfWeek}</Typography>
                </Item>
            </Stack>
        </Box>
    );
}
 
export default Profile;