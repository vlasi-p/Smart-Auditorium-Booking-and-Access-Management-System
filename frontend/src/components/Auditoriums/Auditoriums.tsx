import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Auditoriums.css';

interface Auditorium {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  auditoriumName: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  startTime: string;
  endTime: string | null;
}

interface CreateReservationDto {
  AuditoriumId: number;
  AuditoriumName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  PrivateNumber: string;
  Signature: string;
  StartTime: string;
}

interface JwtPayload {
  email: string;
  user: 'admin' | 'student';
}

const GROUPS = ['E', 'F', 'G'];

const Auditoriums: React.FC = () => {
  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Auditorium | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    privateNumber: '',
    signature: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [activeReservation, setActiveRes] = useState<Reservation | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/');
    try {
      const { email, user } = jwtDecode<JwtPayload>(token);
      if (user !== 'student') return navigate('/');
      setForm(prev => ({ ...prev, email }));
    } catch {
      navigate('/');
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { email } = jwtDecode<JwtPayload>(token);
        const { data } = await axios.get<Reservation[]>(`https://localhost:5001/reservations/by-email/${email}`);
        const active = data.find(r => r.status === 'approved');
        setActiveRes(active || null);
      } catch {
        // Ignore fetch error
      }
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<Auditorium[]>('https://localhost:5001/auditoriums/available');
        setAuditoriums(data);
      } catch {
        setError('Could not fetch auditoriums.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCheckout = async () => {
    if (!activeReservation) return;
    setCheckingOut(true);
    try {
      await axios.post(`https://localhost:5001/reservations/checkout/${activeReservation.id}`);
      setActiveRes(null);
    } catch {
      setError('Failed to finish your reservation.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleSelect = (aud: Auditorium) => {
    setSelected(aud);
    setSubmitError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const payload: CreateReservationDto = {
      AuditoriumId: selected.id,
      AuditoriumName: selected.name,
      FirstName: form.firstName,
      LastName: form.lastName,
      Email: form.email,
      Phone: form.phone,
      PrivateNumber: form.privateNumber,
      Signature: form.signature,
      StartTime: new Date().toISOString(),
    };

    try {
      const { data } = await axios.post<{ id: number }>(
        'https://localhost:5001/reservations/request-reservation',
        payload
      );
      navigate(`/reservation/${data.id}`);
    } catch {
      setSubmitError('Failed to submit reservation. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading auditoriums…</div>;
  if (error) return <div className="error">{error}</div>;

  if (activeReservation) {
    return (
      <div className="active-reservation">
        <h2>You have an active reservation</h2>
        <p><strong>Auditorium:</strong> {activeReservation.auditoriumName}</p>
        <p><strong>Start time:</strong> {new Date(activeReservation.startTime).toLocaleString()}</p>
        <button onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? 'Finishing…' : 'Finish Reservation'}
        </button>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="reservation-form-container">
        <h2>Reserve {selected.name}</h2>
        <form className="reservation-form" onSubmit={handleSubmit}>
          {[ 
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone' },
            { key: 'privateNumber', label: 'Private Number' },
            { key: 'signature', label: 'Signature' },
          ].map(({ key, label, type }) => (
            <div className="form-row" key={key}>
              <label>{label}</label>
              <input
                name={key}
                type={type || 'text'}
                value={(form as any)[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          {submitError && <div className="form-error">{submitError}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setSelected(null)}>Back</button>
            <button type="submit" className="btn-submit">Submit Reservation</button>
          </div>
        </form>
      </div>
    );
  }

  const grouped: Record<string, Auditorium[]> = {};
  GROUPS.forEach(letter => grouped[letter] = auditoriums.filter(a => a.name.startsWith(letter)));
  const others = auditoriums.filter(a => !GROUPS.includes(a.name.charAt(0)));

  return (
    <div className="auditoriums-page">
      {GROUPS.map(letter =>
        grouped[letter].length > 0 && (
          <section key={letter} className="aud-group">
            <h2 className="group-title">{letter} Corpus</h2>
            <div className="auditorium-row">
              {grouped[letter].map(a => (
                <div key={a.id} className="auditorium-card" onClick={() => handleSelect(a)}>
                  <div className="door-panel"><span className="aud-name">{a.name}</span></div>
                </div>
              ))}
            </div>
          </section>
        )
      )}
      {others.length > 0 && (
        <section className="aud-group">
          <h2 className="group-title">Other</h2>
          <div className="auditorium-row">
            {others.map(a => (
              <div key={a.id} className="auditorium-card" onClick={() => handleSelect(a)}>
                <div className="door-panel"><span className="aud-name">{a.name}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Auditoriums;
