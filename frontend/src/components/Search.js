import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Typography, List, Grid, ListItem, ListItemAvatar, 
         ListItemText, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from "react-router-dom";

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
                <TextField id="first_name" label="First Name" variant="outlined" 
                name="first_name" 
                value={props.searchInfo.first_name}
                onChange={props.handleChange} />

                <TextField id="last_name" label="Last Name" variant="outlined" 
                name="last_name" 
                value={props.searchInfo.last_name}
                onChange={props.handleChange} />

                <TextField id="class_name" label="Subject" variant="outlined"
                name="class_name" 
                value={props.searchInfo.class_name}
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
                    <b>Search Result</b>
                </Typography>

                {/* display waiting icon */}
                {props.progress &&
                    <Box textAlign="center">
                        <CircularProgress />
                    </Box>
                }

                {/* display search results */}
                {(props.progress != null) && (props.progress === false && props.searchInfo.length === 0) ? 
                    <Typography sx={{ mt: 4, mb: 2, }} variant="h6" component="div">
                        No Result
                    </Typography> :

                    <List>
                    {props.searchInfo.map((info) => (
                        <React.Fragment key={info.tutor_id}>
                            <ListItem
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" 
                                onClick={() => props.handleAddTutor(info.tutor_id)}>
                                    <AddIcon />
                                </IconButton>
                            }
                            >

                            <ListItemAvatar>
                            <Avatar component={Link} to="/TutorProfile" state={{ fromSearch_FavoriteTutor: {info}}} alt={info.name} src={info.image_path} />
                            </ListItemAvatar>

                            <ListItemText
                                primary={info.name}
                                secondary={
                                    <React.Fragment>
                                        {/* multiple subjects */}
                                        {info.subject.map((subj, i) => (
                                            <span key={i}>
                                                <Typography component="span">{ subj }</Typography>
                                                <br/>
                                            </span>
                                        ))}
                                        {/* <br/>
                                        {info.email} */}
                                    </React.Fragment>}
                            />
                            </ListItem>
                        </React.Fragment>
                    ))}
                    </List>
                }
            </Grid>
        </Box>

        </React.Fragment>
    );
}
 
export default Search;