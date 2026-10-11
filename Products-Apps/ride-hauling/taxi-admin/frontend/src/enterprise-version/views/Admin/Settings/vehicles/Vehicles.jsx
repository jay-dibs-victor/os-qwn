import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const Vehicle = props => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/vehicles`)
      .then(res => {
        // console.log(res.data);
        setVehicles(res.data);
      })
      .catch(console.error);
  }, []);

  const handleUrlRoute = url => {
    props.history.push(url);
  };

  return (
    <div>
      <NavBar {...props} onMapMenu={false} handleUrlRoute={handleUrlRoute} />
      <div className="admin-wrapper">
        <div>
          <div className="admin-sidebar">
            <div>Users</div>
            <div onClick={() => handleUrlRoute('/settings/drivers')}>Drivers</div>

            <div onClick={() => handleUrlRoute('/settings/vehicles')}>Vehicles</div>

            <div onClick={() => handleUrlRoute('/settings/journeys')}>Journeys</div>
          </div>
          <div className="admin-list">
            <div>
              <button onClick={() => handleUrlRoute('/settings/vehicles/new')}>Add Vehicle</button>
            </div>
            <div className="entity-list">
              <ul className="heading">
                <li></li>
                <li></li>
                <li>ID / Plate Number</li>
                <li>Class</li>
                <li>Curent Location</li>
                <li>Weight / Volume</li>
                <li>Status</li>
                <li>Action</li>
              </ul>
              {vehicles.map((vehicle, idx) => (
                <ul key={idx} className="entity-row">
                  <li>{idx + 1}</li>
                  <li></li>
                  <li>
                    {vehicle.code} / {vehicle.plateNumber}
                  </li>
                  <li>{vehicle.class.split('(')[0]}</li>
                  <li>{vehicle.locationAddress}</li>
                  <li>
                    {vehicle.weight} kg / {vehicle.volume} cubic
                  </li>
                  <li>{vehicle.status}</li>
                  <li>
                    <span
                      onClick={() => {
                        handleUrlRoute(`/settings/vehicles/${vehicle._id}/edit`);
                      }}
                    >
                      Update
                    </span>
                    &nbsp;|&nbsp;
                    <span>Delete</span>
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicle;
