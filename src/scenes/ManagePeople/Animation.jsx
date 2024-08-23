// src/scenes/ManagePeoples/Animation.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Animation = ({ type }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt="20px">
      {type === 'success' ? (
        <Typography color="green">✔️ RFID assigned successfully!</Typography>
      ) : (
        <Typography color="red">❌ Failed to assign RFID.</Typography>
      )}
    </Box>
  );
};

export default Animation;
