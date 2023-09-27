import React from 'react';
import {Box, Grid, Paper} from '@mui/material'
import MenuList from './MenuList.js'

const Body = (props) => {
    return (
        <Box sx={{marginTop:"10px", marginLeft:"10px", marginRight:"10px", flexGrow: 1 }}>
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    <Paper>
                        <MenuList />
                    </Paper>
                </Grid>
                <Grid item xs={10}>
                    <Paper>
                        {props.content}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
 
export default Body;