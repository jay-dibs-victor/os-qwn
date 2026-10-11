import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const NewJourney = props => {
  const [drivers, setDrivers] = useState([]);
  const [driver, setDriver] = useState('');

  useEffect(() => {
    axios
      .get(`${BASE_URL}/drivers`)
      .then(res => {
        setDrivers(res.data);
      })
      .catch(console.error);
  }, []);

  const handleChange = ev => {
    console.log(ev.target.value);
    setDriver(ev.target.value);
  };

  const handleSubmit = ev => {
    ev.preventDefault();

    const journeyId = props.match.params.id;
    axios
      .put(`${BASE_URL}/journeys/${journeyId}`, { driver: driver, status: 'scheduled' })
      .then(res => {
        if (res.data.success) {
          props.history.push('/settings/journeys');
        }
      })
      .catch(console.error);
  };

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
          <div className="admin-form">
            <div>
              <div className="heading">New Journey</div>
              <form onSubmit={handleSubmit}>
                <div className="form-wrapper">
                  <div className="form-group">
                    <label>
                      <input
                        type="text"
                        placeholder="Origin Address"
                        style={{ marginBottom: '30px' }}
                        value={'Schedule a journey for the vehicle'}
                        disabled
                      />
                    </label>
                  </div>
                  <div className="form=group">
                    <select onChange={handleChange}>
                      <option value="none">Select a Driver</option>
                      {drivers.map((driver, idx) => (
                        <option key={idx} value={driver._id}>
                          {driver.firstName} {driver.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="button-wrapper">
                    <button className="form-button">Schedule Journey</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewJourney;
