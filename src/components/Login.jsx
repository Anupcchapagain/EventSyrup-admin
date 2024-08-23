import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = theme.palette;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.background.default, // Consistent background color
        p: 3,
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          background: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
          padding: 4,
          borderRadius: 4,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom color={colors.text.primary}>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            sx={{ mb: 2 }}
            InputLabelProps={{
              style: { color: colors.text.primary }, // Label color
            }}
            InputProps={{
              style: { color: colors.text.primary }, // Input text color
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
            autoComplete="current-password"
            sx={{ mb: 3 }}
            InputLabelProps={{
              style: { color: 'black' }, // Label color
            }}
            InputProps={{
              style: { color: 'black' }, // Input text color
            }}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mb: 2 }}>
            Login
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            fullWidth
            variant="outlined"
            color="primary"
          >
            Don’t have an account? Sign Up
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Login;
