import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Typography, List, Grid, ListItem, ListItemAvatar, 
         ListItemText, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Search = (props) => {

    return (
        <React.Fragment>
            <Box component="form"
            sx={{ '& > :not(style)': { m: 1, width: '30ch' }, 
            marginBottom: "50px"}}
            noValidate
            autoComplete="off"
            textAlign="center"
            onSubmit={props.handleSearchSubmit}
            >
                <TextField id="instructorName" label="Instructor Name" variant="outlined" 
                name="instructorName" 
                value={props.searchInfo.instructorName}
                onChange={props.handleChange} />

                <TextField id="subject" label="Subject" variant="outlined"
                name="subject" 
                value={props.searchInfo.subject}
                onChange={props.handleChange} />

                {/* <TextField id="dayOfWeek" label="Day of the Week" variant="outlined"
                name="dayOfWeek" value={props.searchInfo.dayOfWeek}
                onChange={props.handleChange} /> */}
                
                <br/>
                <Button type="Submit" variant="contained" size="large">Search</Button>
            </Box>

            <Box sx={{  textAlign: 'center' }}>
            <Grid>
                <Typography sx={{ mt: 4, mb: 2, }} variant="h6" component="div">
                    Search Result
                </Typography>

                <List>
                {props.searchInfo.map((info, i) => (
                    <React.Fragment key={i}>
                        <ListItem
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" 
                            onClick={() => props.handleAddTutor(i)}>
                                <AddIcon />
                            </IconButton>
                        }
                        >

                        <ListItemAvatar>
                        <Avatar alt={info.name} src='url' />
                        </ListItemAvatar>

                        <ListItemText
                            primary={info.name + ' ' + info.id}
                            secondary={
                                <React.Fragment>
                                    <Typography component="span">{ info.subject }</Typography>
                                    <br/>
                                    {info.email}
                                </React.Fragment>}
                        />
                        </ListItem>
                    </React.Fragment>
                ))}
                </List>
            </Grid>
        </Box>

        </React.Fragment>
    );
}
 
export default Search;