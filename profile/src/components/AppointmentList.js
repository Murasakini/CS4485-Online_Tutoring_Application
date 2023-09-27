import React from "react";
import {Box, Stack, Paper, Typography} from '@mui/material'
import { styled } from '@mui/material/styles';

const AppointmentList = (props) => {
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
            <Typography textAlign="center" variant="h4">{props.title}</Typography>
            <Stack spacing={3} padding={2}>
                <Item>
                    Date and Time
                    <Typography style={{color:"black"}}>Tuesday, December 24, 2023 at 9:00 AM</Typography>
                </Item>
                <Item>
                    Instructor
                    <Typography style={{color:"black"}}>Jack.</Typography>
                </Item>
                <Item>
                    Subject
                    <Typography style={{color:"black"}}>Algebra</Typography>
                </Item>
            </Stack>
        </Box>
    );
}
 
export default AppointmentList;