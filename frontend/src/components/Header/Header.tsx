// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import './Header.css';
import logo from '../../assets/kiu-logo.png';
import Login from '../Login/Login';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
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

        <Box className="nav-links">
        <button className="custom-header-login-button" onClick={handleLoginClick}>
      Login
      </button>
        </Box>
      </div>

      {showLogin && <Login />}
    </>
  );
};

export default Header;
