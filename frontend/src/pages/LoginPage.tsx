// src/pages/LoginPage.tsx
import { Button, Container, TextField, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login logic, can be replaced with API call
    if (email) {
      navigate('/auditoriums');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
     
      
    </Container>
  );
};

export default LoginPage;
