import React, { useState, useEffect } from 'react';
import apiClient from '../../../core/api/apiClient';

const FlightMgt = () => {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setIsLoading(true);
    try {
      // Assuming Admin can list all inventory
      const { data } = await apiClient.get('/flights'); 
      if (data.status === 200) setFlights(data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await apiClient.post('/flights/sync');
      alert('Global metadata sync triggered in background!');
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Flight Inventory Management</h2>
        <div className="d-flex gap-2">
           <button className="btn btn-warning" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : '🔄 Trigger Global Sync'}
           </button>
           <button className="btn btn-primary" onClick={() => {/* TODO: Add Modal */}}>
              ➕ Add Manual Flight
           </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
           <table className="table table-hover">
              <thead className="table-light">
                 <tr>
                    <th>Flight #</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Departure</th>
                    <th>Price</th>
                    <th>Source</th>
                    <th>Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {isLoading ? (
                   <tr><td colSpan="7" className="text-center">Loading flights...</td></tr>
                 ) : flights.length === 0 ? (
                   <tr><td colSpan="7" className="text-center">No flights found.</td></tr>
                 ) : flights.map(f => (
                   <tr key={f.id}>
                      <td>{f.flight_number}</td>
                      <td>{f.departure_airport_id}</td>
                      <td>{f.arrival_airport_id}</td>
                      <td>{new Date(f.departure_time).toLocaleString()}</td>
                      <td>₦{parseFloat(f.price).toLocaleString()}</td>
                      <td>
                         <span className={`badge ${f.source === 'amadeus' ? 'bg-info' : 'bg-success'}`}>
                            {f.source || 'Manual'}
                         </span>
                      </td>
                      <td>
                         <button className="btn btn-sm btn-outline-danger">Delete</button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default FlightMgt;
