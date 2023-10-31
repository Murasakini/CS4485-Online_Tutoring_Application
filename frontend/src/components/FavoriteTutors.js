import React from "react";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

const FavortieTutor = (props) => {
    return (
        <Box sx={{  textAlign: 'center' }}>
            <Grid>
                <Typography sx={{ mt: 4, mb: 2, }} variant="h5" component="div">
                    My Favorite Tutors
                </Typography>

                <List>
                {props.tutorList.map((info) => (
                    <React.Fragment key={info.id}>
                        <ListItem
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" 
                            onClick={() => props.handleDeleteTutor(info.id)}>
                                <DeleteIcon />
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

                <Button component={Link} to="/FindTutor"
                variant="contained" style={{ marginBottom: "8px" }}>
                    Add A Tutor
                </Button>
            </Grid>
        </Box>
    )
}

export default FavortieTutor;