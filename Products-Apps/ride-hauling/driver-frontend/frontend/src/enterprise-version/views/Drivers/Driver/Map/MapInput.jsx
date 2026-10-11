import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/**
 * MapInput — queens-driverapp
 * Modernized functional component for source/destination input.
 * Replaces legacy direct DOM access and manual geocoding.
 */
const MapInput = ({ onRouteSubmit }) => {
  const formik = useFormik({
    initialValues: {
      origin: '',
      destination: '',
    },
    validationSchema: Yup.object({
      origin: Yup.string().required('Origin is required'),
      destination: Yup.string().required('Destination is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      onRouteSubmit(values);
      resetForm();
    },
  });

  return (
    <div className="card-box shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '30px' }}>
      <h4 className="font-bold text-dark m-b-20 font-16">Route Navigation</h4>
      <div className="alert alert-info font-13 m-b-25" style={{ borderRadius: '12px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #e0f2fe' }}>
        Enter your source and destination to simulate or track a journey.
      </div>
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group m-b-20">
          <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Origin Address</label>
          <div className="relative">
            <input
              name="origin"
              type="text"
              className={`form-control premium-input p-l-40 ${formik.touched.origin && formik.errors.origin ? 'is-invalid' : ''}`}
              placeholder="e.g. 123 Airport Rd, Lagos"
              {...formik.getFieldProps('origin')}
            />
             <i className="md md-my-location absolute" style={{ left: '15px', top: '12px', color: '#FFB800' }}></i>
          </div>
          {formik.touched.origin && formik.errors.origin && (
            <div className="text-danger font-11 m-t-5">{formik.errors.origin}</div>
          )}
        </div>

        <div className="form-group m-b-30">
          <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Destination Address</label>
          <div className="relative">
            <input
              name="destination"
              type="text"
              className={`form-control premium-input p-l-40 ${formik.touched.destination && formik.errors.destination ? 'is-invalid' : ''}`}
              placeholder="e.g. Victoria Island, Lagos"
              {...formik.getFieldProps('destination')}
            />
            <i className="md md-place absolute" style={{ left: '15px', top: '12px', color: '#ff4757' }}></i>
          </div>
          {formik.touched.destination && formik.errors.destination && (
            <div className="text-danger font-11 m-t-5">{formik.errors.destination}</div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn-premium w-full p-y-12"
          style={{ width: '100%' }}
        >
          Track Journey
        </button>
      </form>
    </div>
  );
};

export default MapInput;
