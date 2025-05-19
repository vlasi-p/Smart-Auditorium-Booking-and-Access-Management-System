import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Circle } from 'lucide-react';
import './Dashboard.css';

// Type definitions
interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  auditoriumName: string;
  startTime: string;
  endTime: string;
  status: string;
  securityCode: string;
  email: string;
}

interface Building {
  name: string;
  colors: string[];
  reservations: Reservation[];
}


export default function ReservationDashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh data after status updates
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await axios.get<Reservation[]>('https://localhost:5001/admin/all-reservations');
        const grouped: { [key: string]: Reservation[] } = {};

        for (const res of response.data) {
          const buildingKey = res.auditoriumName.charAt(0); // assumes Auditorium E1, F2, etc.
          if (!grouped[buildingKey]) {
            grouped[buildingKey] = [];
          }
          grouped[buildingKey].push(res);
        }

        const colorPalette: { [key: string]: string[] } = {
          E: ['#1976d2', '#d32f2f'],
          F: ['#fdd835', '#388e3c'],
          G: ['#f57c00', '#4fc3f7']
        };

        const result: Building[] = Object.keys(grouped).map((key) => ({
          name: key,
          colors: colorPalette[key] || ['#ccc', '#999'],
          reservations: grouped[key]
        }));

        setBuildings(result);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    }

    fetchReservations();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage auditorium reservations across campus buildings</p>
      </div>

      <div className="table-container">
        <table className="table-full">
          <tbody>
            {buildings.map((b) => (
              <BuildingRow key={b.name} building={b} onStatusUpdate={triggerRefresh} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        Showing {buildings.reduce((sum, b) => sum + b.reservations.length, 0)} reservations across {buildings.length} buildings
      </div>
    </div>
  );
} 


// Status badge component
function StatusBadge({ status }: { status: string }) {
  let statusClass = '';
  
  switch(status) {
    case 'approved':
      statusClass = 'status-accepted';
      break;
    case 'rejected':
      statusClass = 'status-rejected';
      break;
    default:
      statusClass = 'status-pending';
  }
  
  return (
    <span className={`status-badge ${statusClass}`}>
      {status}
    </span>
  );
}

// Reservation row component
function ReservationRow({ 
  res, 
  onUpdate, 
  onStatusUpdate 
}: { 
  res: Reservation; 
  onUpdate: (updatedRes: Reservation) => void;
  onStatusUpdate: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDecision = async (decision: 'Accepted' | 'Rejected') => {
    try {
      // Send the decision to the server
      await axios.post('https://localhost:5001/admin/decide-reservation', {
        ReservationId: Number(res.id),
        Decision: decision === 'Accepted' ? 'approve' : 'reject'
      });
  
      // Update parent component state
      const updated: Reservation = {
        ...res,
        status: decision
      };
      onUpdate(updated);
      
      // Trigger a refresh to ensure server data is updated
      onStatusUpdate();
    } catch (error: any) {
      console.error('API call failed:', error);
      alert('Failed to send decision to the server. See console for details.');
    }
  };

  // Determine if buttons should be disabled
  const isPending = res.status === 'pending';

  return (
    <tr className="reservation-row">
      <td className="td-cell">{res.id}</td>
      <td className="td-cell">{res.firstName}</td>
      <td className="td-cell">{res.lastName}</td>
      <td className="td-cell">{res.auditoriumName}</td>
      <td className="td-cell">{formatDate(res.startTime)}</td>
      <td className="td-cell">{formatDate(res.endTime)}</td>
      <td className="td-cell">
        <StatusBadge status={res.status} />
      </td>
      <td className="td-cell">
        <span className="security-code">{res.securityCode}</span>
      </td>
      <td className="td-cell">{res.email}</td>
      <td className="td-cell">
        <div className="button-container">
          <button 
            className={`button ${isPending ? 'button-accept' : 'button-disabled'}`}
            onClick={() => handleDecision('Accepted')}
            disabled={!isPending}
          >
            Accept
          </button>
          <button 
            className={`button ${isPending ? 'button-reject' : 'button-disabled'}`}
            onClick={() => handleDecision('Rejected')}
            disabled={!isPending}
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

// Building row component
function BuildingRow({ 
  building, 
  onStatusUpdate 
}: { 
  building: Building; 
  onStatusUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState(building.reservations);

  // Update reservation list when building data changes
  useEffect(() => {
    setReservations(building.reservations);
  }, [building]);

  const updateReservation = (updatedRes: Reservation): void => {
    setReservations((prev: Reservation[]) =>
      prev.map((res: Reservation) => (res.id === updatedRes.id ? updatedRes : res))
    );
  };

  const pendingCount = reservations.filter(r => r.status === 'Pending').length;

  return (
    <>
      <tr className="building-row">
        <td colSpan={10} className="p-0">
          <button 
            onClick={() => setOpen(!open)}
            className="building-button"
          >
            <div className="building-colors">
              {building.colors.map((color, index) => (
                <Circle key={index} size={16} fill={color} color={color} />
              ))}
            </div>
            <div className="building-name-container">
              <h3 className="building-name">Building {building.name}</h3>
              {pendingCount > 0 && (
                <span className="pending-badge">
                  {pendingCount} pending
                </span>
              )}
            </div>
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </td>
      </tr>
      {open && (
        <>
          <tr className="table-header">
            <th className="th-cell">ID</th>
            <th className="th-cell">First Name</th>
            <th className="th-cell">Last Name</th>
            <th className="th-cell">Auditorium</th>
            <th className="th-cell">Start Time</th>
            <th className="th-cell">End Time</th>
            <th className="th-cell">Status</th>
            <th className="th-cell">Security Code</th>
            <th className="th-cell">Email</th>
            <th className="th-cell">Actions</th>
          </tr>
          {reservations.map((res) => (
            <ReservationRow 
              key={res.id} 
              res={res} 
              onUpdate={updateReservation} 
              onStatusUpdate={onStatusUpdate} 
            />
          ))}
        </>
      )}
    </>
  );
}