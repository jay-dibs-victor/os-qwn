import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../NavBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
const CLOUDINARY_URL = 'https://res.cloudinary.com/dxmmpe1wt/image/upload/v1612076361/';

const UpdateDriver = props => {
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/drivers/${props.match.params.id}`)
      .then(res => {
        setDriver(res.data);
      })
      .catch(console.error);
  }, []);

  const handleUrlRoute = url => {
    props.history.push(url);
  };

  const handleChange = ev => {
    const name = ev.target.name;
    setDriver(driver => ({
      ...driver,
      [name]: ev.target.value,
    }));
  };

  const handleSubmit = ev => {
    ev.preventDefault();

    axios
      .put(`${BASE_URL}/drivers/${props.match.params.id}`, driver)
      .then(res => {
        if (res.data.success) {
          props.history.push('/settings/drivers');
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
            {driver !== null ? (
              <div>
                <div className="heading">Update Driver</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-wrapper">
                    <div>
                      <label
                        className="profile-photo update"
                        style={{
                          backgroundImage: `url(${CLOUDINARY_URL}/${driver.photoUrl})`,
                          backgroundSize: 'cover',
                        }}
                      >
                        <input type="file" />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>First Name:</p>
                        <input
                          name="firstName"
                          type="text"
                          value={driver.firstName}
                          placeholder="First Name"
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        <p>Last Name:</p>
                        <input
                          name="lastName"
                          type="text"
                          value={driver.lastName}
                          placeholder="Last Name"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Mobile Number:</p>
                        <input
                          name="mobileNumber"
                          type="text"
                          value={driver.mobileNumber}
                          placeholder="Mobile Number"
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        <p>Email Address:</p>
                        <input
                          name="email"
                          type="email"
                          value={driver.email}
                          placeholder="Email Address"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Drivers License Number:</p>
                        <input
                          name="licenseNumber"
                          type="text"
                          value={driver.licenseNumber}
                          placeholder="License Number"
                          onChange={handleChange}
                          required
                        />
                      </label>
                      <label>
                        <p>License Expiry Date:</p>
                        <input
                          name="licenseExpiry"
                          type="date"
                          value={driver.licenseExpiry.split('T')[0]}
                          placeholder="Expiry Date"
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <p>Contact Address:</p>
                        <input type="text" placeholder="Contact address" required />
                      </label>
                    </div>
                    <div className="button-wrapper">
                      <button className="form-button">Update Driver</button>
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

export default UpdateDriver;
