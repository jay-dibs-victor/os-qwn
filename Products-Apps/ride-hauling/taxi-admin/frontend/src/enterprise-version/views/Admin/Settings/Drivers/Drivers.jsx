import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
const Driver = props => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/drivers`)
      .then(res => {
        // console.log(res.data);
        setDrivers(res.data);
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
              <button onClick={() => handleUrlRoute('/settings/drivers/new')}>Add Driver</button>
            </div>
            <div className="entity-list">
              <ul className="heading">
                <li></li>
                <li></li>
                <li>Full Name</li>
                <li>Mobile Number</li>
                <li>Email Address</li>
                <li>Driver's License</li>
                <li>Status</li>{' '}
                {
                  // driving, unassigned
                }
                <li>Action</li>
              </ul>
              {drivers.map((driver, idx) => (
                <ul key={idx} className="entity-row">
                  <li>{idx + 1}</li>
                  <li></li>
                  <li>
                    {driver.firstName} {driver.lastName}
                  </li>
                  <li>{driver.mobileNumber}</li>
                  <li>{driver.email}</li>
                  <li>{driver.licenseNumber}</li>
                  <li>{driver.status}</li>
                  <li>
                    <span
                      onClick={() => {
                        handleUrlRoute(`/settings/drivers/${driver._id}/edit`);
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

export default Driver;
