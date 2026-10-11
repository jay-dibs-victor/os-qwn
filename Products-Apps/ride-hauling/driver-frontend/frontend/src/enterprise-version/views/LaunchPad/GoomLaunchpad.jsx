import React, { useState } from 'react';

/**
 * CollectionCard — queens-driverapp
 * Replaces the old class-based Collection component.
 */
const CollectionCard = ({ name, description, numQuestions, selected, setSelected, icon }) => {
  return (
    <div
      className={`card-box collection-card ${selected === name ? 'collection-card--selected' : ''}`}
      onClick={() => setSelected(name)}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
    >
      <div className="collection-icon m-b-15">
        <i className={`md ${icon} text-custom`} style={{ fontSize: '24px' }}></i>
      </div>
      <div className="collection-name h4 m-t-0 m-b-10">
        {name}
        {selected === name && (
          <span className="badge badge-xs badge-success pull-right">SELECTED</span>
        )}
      </div>
      <div className="collection-description text-muted font-13 m-b-10">{description}</div>
      <div className="collection-questions text-primary font-11 font-600">
        {numQuestions} Modules Available
      </div>
    </div>
  );
};

/**
 * GoomLaunchpad (CollectionList) — queens-driverapp
 * Modernized launchpad for selecting services.
 */
const GoomLaunchpad = () => {
  const [selected, setSelected] = useState('Taxi Service');

  const collections = [
    {
      name: 'Taxi Service',
      description: 'Book a cab with a taxi driver or choose to drive yourself',
      numQuestions: '400',
      icon: 'md-directions-car',
    },
    {
      name: 'Byke Ride',
      description: 'Take a tour with a dispatch rider',
      numQuestions: '21',
      icon: 'md-motorcycle',
    },
    {
      name: 'Cargo Shipping',
      description: 'Logistics and freights system. Send your goods to any location',
      numQuestions: '12',
      icon: 'md-local-shipping',
    },
    {
      name: 'Air Travel',
      description: 'Travel the world one click away by air',
      numQuestions: '20',
      icon: 'md-airplanemode-active',
    },
    {
      name: 'Train Station',
      description: 'Book a train service',
      numQuestions: '16',
      icon: 'md-train',
    },
    {
      name: 'Dispatch Delivery',
      description: 'Send your parcels via a dispatch rider',
      numQuestions: '4',
      icon: 'md-delivery-dining',
    },
    {
      name: 'Mail Man',
      description: 'Send your parcels via a mail man',
      numQuestions: '4',
      icon: 'md-mail',
    },
  ];

  return (
    <div className="launchpad-container p-20">
      <div className="row">
        <div className="col-sm-12 m-b-30">
          <h2 className="text-dark">Service LaunchPad</h2>
          <p className="text-muted">Select a logistics module to begin operations</p>
        </div>
      </div>

      <div className="row">
        {collections.map((col) => (
          <div key={col.name} className="col-md-3 m-b-20">
            <CollectionCard
              {...col}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        ))}
      </div>

      <div className="row m-t-20">
        <div className="col-sm-12 text-center">
          <button className="btn btn-custom btn-lg waves-effect waves-light">
            Launch {selected}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoomLaunchpad;
