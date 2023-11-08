import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CustomSnackbar = ({ open, message, onClose, severity }) => {
  // default severity is error
  let severity_level = "error";

  if (severity) severity_level = severity

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <MuiAlert elevation={6} variant="filled" severity={severity_level} onClose={onClose}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default CustomSnackbar;
