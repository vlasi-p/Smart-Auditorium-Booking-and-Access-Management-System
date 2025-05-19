// src/components/Auditoriums/Auditoriums.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './Auditoriums.css';

interface Auditorium {
  id: number;
  name: string;
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
  user: 'admin' | 'student';
  // ...other claims
}

const GROUPS = ['E', 'F', 'G'];

const Auditoriums: React.FC = () => {
  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string>('');
  const [selected, setSelected]         = useState<Auditorium | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    privateNumber: '',
    signature: '',
  });
  const [submitError, setSubmitError] = useState<string>('');
  const navigate = useNavigate();

  // Guard: only allow logged-in students
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.user !== 'student') {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  }, [navigate]);

  // Fetch available auditoriums
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<Auditorium[]>(
          'https://localhost:5001/auditoriums/available'
        );
        setAuditoriums(data);
      } catch {
        setError('Could not fetch auditoriums.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (aud: Auditorium) => {
    setSelected(aud);
    setSubmitError('');
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      privateNumber: '',
      signature: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
  if (error)   return <div className="error">{error}</div>;

  // Reservation form
  if (selected) {
    return (
      <div className="reservation-form-container">
        <h2>Reserve {selected.name}</h2>
        <form className="reservation-form" onSubmit={handleSubmit}>
          {[
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName',  label: 'Last Name' },
            { key: 'email',     label: 'Email', type: 'email' },
            { key: 'phone',     label: 'Phone' },
            { key: 'privateNumber', label: 'Student ID' },
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
            <button type="button" className="btn-cancel" onClick={() => setSelected(null)}>
              Back
            </button>
            <button type="submit" className="btn-submit">
              Submit Reservation
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Group and render cards
  const grouped: Record<string, Auditorium[]> = {};
  GROUPS.forEach(letter => {
    grouped[letter] = auditoriums.filter(a => a.name.startsWith(letter));
  });
  const others = auditoriums.filter(
    a => !GROUPS.includes(a.name.charAt(0))
  );

  return (
    <div className="auditoriums-page">
      {GROUPS.map(letter =>
        grouped[letter].length > 0 ? (
          <section key={letter} className="aud-group">
            <h2 className="group-title">{letter} Corpus</h2>
            <div className="auditorium-row">
              {grouped[letter].map(aud => (
                <div
                  key={aud.id}
                  className="auditorium-card"
                  onClick={() => handleSelect(aud)}
                >
                  <div className="door-panel">
                    <span className="aud-name">{aud.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null
      )}

      {others.length > 0 && (
        <section className="aud-group">
          <h2 className="group-title">Other</h2>
          <div className="auditorium-row">
            {others.map(aud => (
              <div
                key={aud.id}
                className="auditorium-card"
                onClick={() => handleSelect(aud)}
              >
                <div className="door-panel">
                  <span className="aud-name">{aud.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Auditoriums;
