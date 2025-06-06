import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './Header.css';
import logo from '../../assets/kiu-logo.png';
import Login from '../Login/Login';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  user?: 'admin' | 'student';
}

interface ReservationDTO {
  id: number;
  auditoriumName: string;
  startTime: string;
  status: string;
}

const Header: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [openResDialog, setOpenResDialog] = useState(false);
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        const extractedEmail = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        if (extractedEmail) {
          setEmail(extractedEmail);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        const extractedEmail = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        if (extractedEmail) {
          setEmail(extractedEmail);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
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

  const handleOpenResDialog = async () => {
    setOpenResDialog(true);
    setError('');
    setReservations([]);

    if (!email) {
      setError('No email found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const url = `https://localhost:5001/reservations/by-email/${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load reservations: ${response.status} - ${errorText}`);
      }

      const data: ReservationDTO[] = await response.json();
      const approved = data.filter((r) => {
        const status = r.status?.toLowerCase();
        return status === 'approved' || status === 'active';
      });

      setReservations(approved);

      if (approved.length === 0 && data.length > 0) {
        setError(`Found ${data.length} reservation(s) but none are approved/active. Statuses: ${data.map(r => r.status).join(', ')}`);
      }
    } catch (err: any) {
      setError(`Could not fetch reservations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResDialog = () => {
    setOpenResDialog(false);
    setReservations([]);
    setError('');
  };

const handleFinish = async (reservationId: number) => {
  try {
    const response = await fetch(
      `https://localhost:5001/reservations/checkout/${reservationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to finish reservation');
    }

    // Optionally read and log result
    const result = await response.json();
    console.log('Finished:', result);

    // Remove the finished reservation from state
    setReservations((prev) => prev.filter((res) => res.id !== reservationId));
  } catch (error) {
    console.error('Error finishing reservation:', error);
  }
};


  return (
    <>
      <div className="custom-header">
        <Box
          className="logo-container"
          
          sx={{ cursor: 'pointer' }}
        >
          <img src={logo} alt="KIU Logo" className="kiu-logo" />
          <Typography variant="h5" className="logo-text">
            KIU - Auditorium Smart Booking System
          </Typography>
        </Box>

        <Box className="nav-links">
          {isLoggedIn && (
            <Stack direction="row" alignItems="center" spacing={1} mr={2}>
              <Typography variant="body1" sx={{ color: 'white' }}>
                {email}
              </Typography>
            </Stack>
          )}

          {isLoggedIn && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenResDialog}
              disabled={loading}
              sx={{
                marginRight: 2,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#115293' },
              }}
            >
              {loading ? 'Loading...' : 'Active Reservations'}
            </Button>
          )}

          <button
            className="custom-header-login-button"
            onClick={isLoggedIn ? handleLogout : handleLoginClick}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </Box>
      </div>

      {showLogin && !isLoggedIn && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      <Dialog
        onClose={handleCloseResDialog}
        aria-labelledby="active-reservations-dialog-title"
        open={openResDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="active-reservations-dialog-title">
          Active Reservations
          <IconButton
            aria-label="close"
            onClick={handleCloseResDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Typography gutterBottom>Loading reservations...</Typography>
          ) : error ? (
            <Typography gutterBottom color="error">
              {error}
            </Typography>
          ) : reservations.length === 0 ? (
            <Typography gutterBottom>
              You have no active (approved) reservations.
            </Typography>
          ) : (
            reservations.map((res) => (
              <Box
                key={res.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    Auditorium: {res.auditoriumName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Start Time: {new Date(res.startTime).toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleFinish(res.id)}
                >
                  Finish
                </Button>
              </Box>
            ))
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseResDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
