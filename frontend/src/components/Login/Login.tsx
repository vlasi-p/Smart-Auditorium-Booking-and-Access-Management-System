import React, { useState } from 'react';
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Box,
  Alert,
  IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

interface JwtPayload {
  user: 'admin' | 'student';
}

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const navigate = useNavigate();

  const sendCode = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('https://localhost:5001/auth/request-otp', { Email: email });
      setIsEmailSent(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!code) {
      setError('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post('https://localhost:5001/auth/verify-otp', {
        Email: email,
        Otp: code
      });
      const token: string = resp.data.token;
      localStorage.setItem('token', token);
      console.log(localStorage.getItem("token"))

      const payload = jwtDecode<JwtPayload>(token);
      const userType = payload.user;

      setIsLoggedIn(true);
      onLoginSuccess();

      setTimeout(() => {
        if (userType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/auditoriums');
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Invalid OTP or login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCard = () => {
    setShowCard(false);
  };

  return (
    <Container maxWidth="sm" className="login-container">
      {!isLoggedIn && showCard && (
        <Paper elevation={24} className="login-paper">
          
          <Box className="login-header">
            <Typography variant="h4" className="login-title">
              {isEmailSent
                ? 'Enter the Code Sent to Your Email'
                : 'Enter your KIU Email'}
            </Typography>
            <IconButton onClick={handleCloseCard} className="close-button">
              <CloseIcon style={{ color: 'red' }} />
            </IconButton>
          </Box>

          {/* Input Fields and Buttons */}
          <Box className="input-container">
            {!isEmailSent ? (
              <TextField
                fullWidth
                label="University Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
              />
            ) : (
              <TextField
                fullWidth
                label="Verification Code"
                variant="outlined"
                margin="normal"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="input-field"
              />
            )}

            {!isEmailSent ? (
              <Button
                variant="contained"
                onClick={sendCode}
                disabled={loading}
                className="login-button"
              >
                {loading ? 'Sending Code…' : 'Send Code'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                className="login-button"
              >
                {loading ? 'Verifying…' : 'Login'}
              </Button>
            )}

            {isEmailSent && !loading && (
              <Alert
                icon={<CheckIcon fontSize="inherit" />}
                severity="success"
                className="custom-alert"
              >
                A verification code has been sent to your email.
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Login;
