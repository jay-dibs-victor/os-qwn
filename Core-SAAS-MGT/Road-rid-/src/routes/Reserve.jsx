import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Reserve() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper">
      <section id="hero" className="hero hero-home"> 
        <div className="hero-copy">
          <span className="eyebrow">Reserve your ride</span>
          <h1>Plan your trip up to 90 days in advance.</h1>
          <p>Choose a time, lock in a driver, and arrive with confidence on the day you travel.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/ride">Request a ride</Link>
            <Link className="secondary-button" to="/courier">Explore Courier</Link>
          </div>
        </div>
      </section>

      <section className="reserve-form">
        <form onSubmit={handleSubmit}>
          <div className="search-row">
            <label>Pickup location</label>
            <input type="text" placeholder="Enter pickup location" aria-label="Pickup location" required />
          </div>
          <div className="search-row">
            <label>Dropoff location</label>
            <input type="text" placeholder="Enter dropoff location" aria-label="Dropoff location" required />
          </div>
          <div className="search-row small-row">
            <label>Date</label>
            <input type="date" aria-label="Pickup date" required />
          </div>
          <div className="search-row small-row">
            <label>Time</label>
            <input type="time" aria-label="Pickup time" required />
          </div>
          <button className="primary-button" type="submit">Reserve now</button>
          {submitted && <p className="search-note success">Your ride is reserved. We’ll notify you when it’s time to go.</p>}
        </form>
      </section>
    </div>
  );
}
