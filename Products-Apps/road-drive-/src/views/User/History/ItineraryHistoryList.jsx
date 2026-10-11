import React from 'react';

const ItineraryHistoryList = ({ items = [{}, {}] }) => {
  if (!items || items.length === 0) {
    return (
      <tr>
        <td colSpan="4" className="text-center py-4 text-muted">No itineraries found.</td>
      </tr>
    );
  }

  return (
    <>
      {items.map((item, i) => (
        <tr key={i}>
          <td className="px-4 border-bottom border-light">
            <span className="fw-bold d-block text-dark">{item.pickup || 'Allen avenue, Ikeja'}</span>
            <small className="text-muted">Pickup</small>
          </td>
          <td className="border-bottom border-light">
            <span className="fw-bold d-block text-dark">{item.dropoff || 'Lekki Phase II'}</span>
            <small className="text-muted">Dropoff</small>
          </td>
          <td className="border-bottom border-light text-muted">
            {item.date || '24-Nov-2025 9:30am'}
          </td>
          <td className="px-4 border-bottom border-light text-end">
            <span className="badge bg-primary text-dark rounded-pill px-3 py-2">
              {item.type || 'Driver'}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ItineraryHistoryList;
