import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Circle, Clock, Archive } from 'lucide-react';
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
  const [historyBuildings, setHistoryBuildings] = useState<Building[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Function to refresh data after status updates
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchReservations() {
      try {
        // Replace this with your actual API call
        const response = await fetch('https://localhost:5001/admin/all-reservations');
        const data = await response.json();
        
        
        const grouped: { [key: string]: Reservation[] } = {};
        const historyGrouped: { [key: string]: Reservation[] } = {};

        for (const res of data) {
          const buildingKey = res.auditoriumName.charAt(0); // assumes Auditorium E1, F2, etc.
          
          // Separate active and history reservations
          if (res.status === 'pending' || res.status === 'approved') {
            if (!grouped[buildingKey]) {
              grouped[buildingKey] = [];
            }
            grouped[buildingKey].push(res);
          } else if (res.status === 'completed' || res.status === 'rejected') {
            if (!historyGrouped[buildingKey]) {
              historyGrouped[buildingKey] = [];
            }
            historyGrouped[buildingKey].push(res);
          }
        }

        const colorPalette: { [key: string]: string[] } = {
          E: ['#1976d2', '#d32f2f'],
          F: ['#fdd835', '#388e3c'],
          G: ['#f57c00', '#4fc3f7']
        };

        // Active reservations
        const result: Building[] = Object.keys(grouped).map((key) => ({
          name: key,
          colors: colorPalette[key] || ['#ccc', '#999'],
          reservations: grouped[key]
        }));

        // History reservations
        const historyResult: Building[] = Object.keys(historyGrouped).map((key) => ({
          name: key,
          colors: colorPalette[key] || ['#ccc', '#999'],
          reservations: historyGrouped[key]
        }));

        setBuildings(result);
        setHistoryBuildings(historyResult);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    }

    fetchReservations();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  const activeCount = buildings.reduce((sum, b) => sum + b.reservations.length, 0);
  const historyCount = historyBuildings.reduce((sum, b) => sum + b.reservations.length, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage auditorium reservations across campus buildings</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'active' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Clock size={16} />
          Active Reservations
          {activeCount > 0 && <span className="tab-count">{activeCount}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Archive size={16} />
          History
          {historyCount > 0 && <span className="tab-count">{historyCount}</span>}
        </button>
      </div>

      {/* Active Reservations Tab */}
      {activeTab === 'active' && (
        <>
          <div className="table-container">
            <table className="table-full">
              <tbody>
                {buildings.map((b) => (
                  <BuildingRow key={b.name} building={b} onStatusUpdate={triggerRefresh} showActions={true} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {activeCount} active reservations across {buildings.length} buildings
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          <div className="history-info">
            <p className="history-note">
              Completed reservations are kept for 30 days. Rejected reservations are automatically deleted after 24 hours.
            </p>
          </div>

          <div className="table-container">
            <table className="table-full">
              <tbody>
                {historyBuildings.map((b) => (
                  <BuildingRow key={b.name} building={b} onStatusUpdate={triggerRefresh} showActions={false} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {historyCount} historical reservations across {historyBuildings.length} buildings
          </div>
        </>
      )}
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
    case 'completed':
      statusClass = 'status-completed';
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
  onStatusUpdate,
  showActions = true
}: { 
  res: Reservation; 
  onUpdate: (updatedRes: Reservation) => void;
  onStatusUpdate: () => void;
  showActions?: boolean;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '...';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '...';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDecision = async (decision: 'Accepted' | 'Rejected') => {
    try {
      // Replace with your actual API call
      const response = await fetch('https://localhost:5001/admin/decide-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ReservationId: Number(res.id),
          Decision: decision === 'Accepted' ? 'approve' : 'reject'
        })
      });
      
      // Mock implementation for demonstration
      console.log(`${decision} reservation ${res.id}`);
      
      // Update parent component state
      const updated: Reservation = {
        ...res,
        status: decision.toLowerCase()
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
      {showActions && (
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
      )}
    </tr>
  );
}

// Building row component
function BuildingRow({ 
  building, 
  onStatusUpdate,
  showActions = true
}: { 
  building: Building; 
  onStatusUpdate: () => void;
  showActions?: boolean;
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

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const completedCount = reservations.filter(r => r.status === 'completed').length;
  const rejectedCount = reservations.filter(r => r.status === 'rejected').length;

  return (
    <>
      <tr className="building-row">
        <td colSpan={showActions ? 10 : 9} className="p-0">
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
              {showActions && pendingCount > 0 && (
                <span className="pending-badge">
                  {pendingCount} pending
                </span>
              )}
              {!showActions && (completedCount > 0 || rejectedCount > 0) && (
                <div className="history-badges">
                  {completedCount > 0 && (
                    <span className="history-badge completed-badge">
                      {completedCount} completed
                    </span>
                  )}
                  {rejectedCount > 0 && (
                    <span className="history-badge rejected-badge">
                      {rejectedCount} rejected
                    </span>
                  )}
                </div>
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
            {showActions && <th className="th-cell">Actions</th>}
          </tr>
          {reservations.map((res) => (
            <ReservationRow 
              key={res.id} 
              res={res} 
              onUpdate={updateReservation} 
              onStatusUpdate={onStatusUpdate}
              showActions={showActions}
            />
          ))}
        </>
      )}
    </>
  );
}