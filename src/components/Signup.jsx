import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure you have firebase configured properly
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = theme.palette;

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Store user information in Firestore
      await addDoc(collection(db, 'pendingUsers'), {
        name,
        email,
        password, // You may want to hash this password or securely store it
        purchaseId,
        approved: false, // Admin will set this to true once approved
      });

      setMessage('We have received your information. If you have purchased the product, we will approve your login credentials.');
      
      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setPurchaseId('');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.background.default,
        p: 3,
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: 4,
          borderRadius: 4,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom color={colors.text.primary}>
          Sign Up
        </Typography>

        {message && <Alert severity="info">{message}</Alert>}

        <form onSubmit={handleSignup}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            autoFocus
            sx={{ mb: 2 }}
            InputLabelProps={{
              style: { color: colors.text.primary },
            }}
            InputProps={{
              style: { color: colors.text.primary },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Purchase ID"
            value={purchaseId}
            onChange={(e) => setPurchaseId(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              style: { color: colors.text.primary },
            }}
            InputProps={{
              style: { color: colors.text.primary },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            sx={{ mb: 2 }}
            InputLabelProps={{
              style: { color: colors.text.primary },
            }}
            InputProps={{
              style: { color: colors.text.primary },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            sx={{ mb: 3 }}
            InputLabelProps={{
              style: { color: colors.text.primary },
            }}
            InputProps={{
              style: { color: colors.text.primary },
            }}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mb: 2 }}>
            Sign Up
          </Button>
          <Button
            onClick={() => navigate('/login')}
            fullWidth
            variant="outlined"
            color="primary"
          >
            Already have an account? Login
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Signup;
