import { useState } from 'react';

export default function Marketplace() {
  const [vehicles, setVehicles] = useState([
    { id: 1, model: 'Toyota Camry', year: 2023, status: 'Available', plate: 'KJA-1234' },
    { id: 2, model: 'Hyundai Elantra', year: 2022, status: 'Active', plate: 'KJA-5678' }
  ]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="marketplace-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Vehicle Marketplace</h2>
        <button className="btn-black" onClick={() => setShowModal(true)}>+ Add Vehicle</button>
      </div>

      <div className="fleet-grid" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {vehicles.map(v => (
          <div key={v.id} className="vehicle-card" style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
            <h3>{v.model} ({v.year})</h3>
            <p>Plate: {v.plate}</p>
            <span className={`badge ${v.status.toLowerCase()}`}>{v.status}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Vehicle</h2>
            <input placeholder="Vehicle Model" style={{width: '100%', padding: '12px', margin: '8px 0'}} />
            <input placeholder="Plate Number" style={{width: '100%', padding: '12px', margin: '8px 0'}} />
            <button className="btn-black" onClick={() => setShowModal(false)}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}
