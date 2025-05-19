import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Stack } from '@mui/material';
import './Header.css';
import logo from '../../assets/kiu-logo.png';
import Login from '../Login/Login';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Named import, NOT default

interface JwtPayload {
  email: string;
  user?: 'admin' | 'student';
}

// Avatar helper functions
function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name: string) {
  const nameParts = name.split(' ');
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 36,
      height: 36,
      fontSize: '1rem',
      marginRight: '0.5rem',
    },
    children: `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}`,
  };
}

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode(token) as JwtPayload;
        if (payload.email) {
          setEmail(payload.email);
          console.log(payload.email)
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Invalid token', e);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Called by Login component when login succeeds
  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = jwtDecode(token) as JwtPayload;
      if (payload.email) {
        setEmail(payload.email);
      }
    }
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setEmail('');
    alert('You have logged out successfully!');
    navigate('/');
  };

  return (
    <>
      <div className="custom-header">
        <Box className="logo-container">
          <img src={logo} alt="KIU Logo" className="kiu-logo" />
          <Typography variant="h5" className="logo-text">
            KIU - Smart Booking System
          </Typography>
        </Box>

        <Box className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn && (
            <Stack direction="row" alignItems="center" spacing={1} mr={2}>
              <Avatar {...stringAvatar(email)} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                {email}
              </Typography>
            </Stack>
          )}

          <button
            className="custom-header-login-button"
            onClick={isLoggedIn ? handleLogout : handleLoginClick}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </Box>
      </div>

      {showLogin && !isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
    </>
  );
};

export default Header;
