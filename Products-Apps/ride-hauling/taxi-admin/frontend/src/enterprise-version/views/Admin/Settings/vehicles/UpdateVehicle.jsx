import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const UpdateVehicle = props => {
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/vehicles/${props.match.params.id}`)
      .then(res => {
        setVehicle(res.data);
      })
      .catch(console.error);
  }, []);

  const handleUrlRoute = url => {
    props.history.push(url);
  };

  const handleChange = ev => {
    const name = ev.target.name;
    setVehicle(vehicle => ({
      ...vehicle,
      [name]: ev.target.value,
    }));
  };

  const handleSubmit = ev => {
    ev.preventDefault();

    axios
      .put(`${BASE_URL}/vehicles/${props.match.params.id}`, vehicle)
      .then(res => {
        if (res.data.success) {
          props.history.push('/settings/vehicles');
        }
      })
      .catch(console.error);
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
            {vehicle !== null ? (
              <div>
                <div className="heading">New Vehicle</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-wrapper">
                    <div>
                      <label className="profile-photo update">
                        <input type="file" />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>ID Number / Code:</p>
                        <input
                          name="code"
                          value={vehicle.code}
                          type="text"
                          placeholder="Id Number"
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        <p>Plate Number:</p>
                        <input
                          name="plateNumber"
                          value={vehicle.plateNumber}
                          type="text"
                          placeholder="Plate Number"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Vechle Class:</p>
                        <select name="class" value={vehicle.class} onChange={handleChange} required>
                          <option value="Class 1">Class 1 (Motorcycle)</option>
                          <option vaue="Class 2">Class 2 (Passenger car)</option>
                          <option vaue="Class 3">Class 3 (4 tire, single unit)</option>
                          <option vaue="Class 4">Class 4 (Bus)</option>
                          <option vaue="Class 5">Class 5 (2 axle, 6 tire, single unit)</option>
                          <option vaue="Class 6">Class 6 (3 axle, single unit)</option>
                          <option vaue="Class 7">Class 7 (4 or more axle, single unit)</option>
                          <option vaue="Class 8">Class 8 (4 or less axle, single trailer)</option>
                          <option vaue="Class 9">Class 9 (5 axle tractor semitrailer)</option>
                          <option vaue="Class 10">Class 10 (6 or more axle, single trailer)</option>
                          <option vaue="Class 11">Class 11 (5 or less axle, multi-trailer )</option>
                          <option vaue="Class 12">Class 12 (6 axle, multi-trailer)</option>
                          <option vaue="Class 13">Class 13 (7 or more axle, multi-trailer)</option>
                        </select>
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Weight (kg)</p>
                        <input
                          name="weight"
                          value={vehicle.weight}
                          type="text"
                          placeholder="Weight"
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        <p>Volume (cubic meter)</p>
                        <input
                          name="volume"
                          value={vehicle.volume}
                          type="text"
                          placeholder="Volume"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Parking Address:</p>
                        <input
                          name="homeAddress"
                          value={vehicle.homeAddress}
                          type="text"
                          placeholder="Enter address"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="button-wrapper">
                      <button className="form-button">Update Vehicle</button>
                    </div>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateVehicle;
