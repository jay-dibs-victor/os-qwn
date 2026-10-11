import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const NewJourney = props => {
  const [journey, setJourney] = useState(null);
  const [vehicle, setVehicle] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    axios
      .get(`${BASE_URL}/vehicles/${props.match.params.id}`)
      .then(res => {
        setVehicle(res.data);
      })
      .catch(console.error);
  }, []);

  const handleChange = ev => {
    const name = ev.target.name;
    setJourney(journey => ({
      ...journey,
      [name]: ev.target.value,
    }));
  };

  const handleSubmit = ev => {
    ev.preventDefault();

    journey.startDate = startDate;
    journey.endDate = endDate;
    journey.vehicle = props.match.params.id;

    axios
      .post(`${BASE_URL}/journeys`, journey)
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
                        value={`Add a journey to vehicle ${vehicle.code} / ${vehicle.plateNumber}`}
                        disabled
                      />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <p>Start Date:</p>
                      <DateTimePicker onChange={setStartDate} value={startDate} />
                    </label>
                    <label>
                      <p>End Date:</p>
                      <DateTimePicker onChange={setEndDate} value={endDate} />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <p>Origin Address:</p>
                      <input
                        name="origin"
                        type="text"
                        placeholder="Origin Address"
                        onChange={handleChange}
                        required
                      />
                    </label>
                    <label>
                      <p>Destination Address:</p>
                      <input
                        name="destination"
                        type="text"
                        placeholder="Destination Address"
                        onChange={handleChange}
                        required
                      />
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <p>Instruction:</p>
                      <textarea
                        name="instruction"
                        type="text"
                        placeholder="Instructions for the driver"
                        onChange={handleChange}
                        required
                      ></textarea>
                    </label>
                  </div>
                  <div className="button-wrapper">
                    <button className="form-button">Save New Journey</button>
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
