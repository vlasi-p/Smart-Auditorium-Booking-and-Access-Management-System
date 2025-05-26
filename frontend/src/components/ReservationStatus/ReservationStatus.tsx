import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ReservationStatus.css';

interface Reservation {
  id: number;
  auditoriumName: string;
  startTime: string;
  endTime: string | null;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  privateNumber: string;
  signature: string;
}

const POLL_INTERVAL = 10_000; // ms

const ReservationStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState(''); 

  const fetchReservation = async () => {
    try {
      const { data } = await axios.get<Reservation>(`https://localhost:5001/reservations/${id}`);
      setReservation(data);
      setError('');
    } catch {
      setError('Failed to load reservation.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchReservation();
    const iv = setInterval(fetchReservation, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [id]);

  
  useEffect(() => {
    if (reservation?.status === 'rejected') {
      setMessage('Your reservation has been rejected by the administrator.');
      setTimeout(() => navigate('/auditoriums'), 3000);
    }
  }, [reservation, navigate]);

  // Handle checkout
  const handleFinish = async () => {
    if (!reservation) return;
    setCheckingOut(true);
    try {
      await axios.post(`https://localhost:5001/reservations/checkout/${reservation.id}`);
      setMessage('Reservation successfully checked out.');
      await fetchReservation();
      setTimeout(() => navigate('/auditoriums'), 3000);
    } catch {
      setError('Failed to finish usage.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading)   return <div className="status-loading">Loading reservation…</div>;
  if (error)     return <div className="status-error">{error}</div>;
  if (!reservation) return <div className="status-error">No reservation found.</div>;

  // If approved & not yet finished — show approval message + finish button only
  if (reservation.status === 'approved' && !message) {
    return (
      <div className="status-container">
        <div className="approval-message">
          Your reservation has been <strong>approved</strong> by the administrator.
        </div>
        <button
          className="finish-button"
          onClick={handleFinish}
          disabled={checkingOut}
        >
          {checkingOut ? 'Finishing…' : 'Finish Reservation'}
        </button>
      </div>
    );
  }

  return (
    <div className="status-container">
      {/* If checkout or rejection message exists, show it and hide card */}
      {message ? (
        <div className="checkout-success">{message}</div>
      ) : (
        <>
        
          <h1>Reservation Details</h1>
          <div className="status-card">
            
            <div><strong>Auditorium:</strong> {reservation.auditoriumName}</div>
            <div>
              <strong>Start Time:</strong>{' '}
              {new Date(reservation.startTime).toLocaleString()}
            </div>
            
            <div><strong>Status:</strong> {reservation.status}</div>
            <div>
              <strong>Student:</strong> {reservation.firstName} {reservation.lastName}
            </div>
            <div><strong>Email:</strong> {reservation.email}</div>
            
            
            
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationStatus;
