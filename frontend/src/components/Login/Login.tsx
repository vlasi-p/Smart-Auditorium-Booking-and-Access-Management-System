import React, { useState } from 'react';
import { Button, Container, TextField, Typography, Paper, Box, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './Login.css';  // Import the CSS file for custom styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  const navigate = useNavigate();  // Hook to navigate to other pages

  // Simulating sending the verification code
  const sendCode = () => {
    if (email) {
      setIsEmailSent(true); // Simulate email sent
      alert('A verification code has been sent to your email!');
    }
  };

  // Handle login by validating the code
  const handleLogin = () => {
    // Replace this with actual logic to verify the code
    if (code === '1234') { // Hardcoded code for now
      setIsLoggedIn(true);  // Set logged-in state to true
      alert('Login successful!');
      navigate('/auditoriums');  // Navigate to the auditoriums page on successful login
    } else {
      alert('Invalid code, please try again.');
    }
  };

  if (isLoggedIn) {
    // Optionally, you can display a message or redirect the user
    return <Typography variant="h6">You are logged in! Redirecting...</Typography>;
  }

  return (
    <Container maxWidth="sm" className="login-container">
      <Paper elevation={3} className="login-paper">
        <Typography variant="h5" gutterBottom className="login-title">
          {isEmailSent ? 'Enter the Code Sent to Your Email' : 'Enter your KIU email'}
        </Typography>
        <Box className="input-container">
          {!isEmailSent ? (
            // Email Input
            <TextField
              fullWidth
              label="University Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          ) : (
            // Code Input
            <TextField
              fullWidth
              label="Verification Code"
              variant="outlined"
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field"
            />
          )}
          
          {!isEmailSent ? (
            // Send Code Button
            <Button
              variant="contained"
              color="primary"
              onClick={sendCode}
              className="login-button"
            >
              Send Code
            </Button>
          ) : (
            // Login Button
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              className="login-button"
            >
              Login
            </Button>
          )}
          
          {isEmailSent && !isLoggedIn && (
            // Styled success alert with custom class
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className="custom-alert">
              A verification code has been sent to your email.
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
