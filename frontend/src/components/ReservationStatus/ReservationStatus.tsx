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

const POLL_INTERVAL = 10_000;

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
    const interval = setInterval(fetchReservation, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (reservation?.status === 'rejected') {
      setMessage('Your reservation has been rejected by the administrator.');
      setTimeout(() => navigate('/auditoriums'), 3000);
    }
  }, [reservation, navigate]);

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

  const handleClose = () => navigate('/auditoriums');

  if (loading) return <div className="status-loading">Loading reservation…</div>;
  if (error) return <div className="status-error">{error}</div>;
  if (!reservation) return <div className="status-error">No reservation found.</div>;

  return (
    <div className="status-container">
      <button className="close-button" onClick={handleClose}>&times;</button>

      {reservation.status === 'approved' && !message && (
        <>
          <div className="approval-message">
            Your reservation has been <strong>approved</strong> by the administrator.
          </div>

          <div className="important-reminder">
            ⚠️ Do not forget to <strong>finish the reservation</strong> after completing your work.
          </div>

          <button
            className="finish-button"
            onClick={handleFinish}
            disabled={checkingOut}
          >
            {checkingOut ? 'Finishing…' : 'Finish Reservation'}
          </button>
        </>
      )}

      {message && <div className="checkout-success">{message}</div>}

      {(reservation.status !== 'approved' || message) && (
        <>
          <h2>Reservation Details</h2>
          <div className="status-card">
            <div><strong>Auditorium:</strong> {reservation.auditoriumName}</div>
            <div><strong>Start Time:</strong> {new Date(reservation.startTime).toLocaleString()}</div>
            <div><strong>Status:</strong> {reservation.status}</div>
            <div><strong>Student:</strong> {reservation.firstName} {reservation.lastName}</div>
            <div><strong>Email:</strong> {reservation.email}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationStatus;
