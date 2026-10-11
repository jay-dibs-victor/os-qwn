import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../../core/api/apiClient';
import { Button, Card } from '../../../../core/components';
import moment from 'moment';

const useDriverDetail = (id) => useQuery({
  queryKey: ['admin', 'driver-detail', id],
  queryFn: async () => {
    const { data } = await apiClient.get(`/admin-drivers-mgt/${id}`);
    return data.driver || data;
  },
  enabled: !!id,
});

const DriverUserDetail = () => {
  const { id } = useParams();
  const { data: driver, isLoading } = useDriverDetail(id);

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (!driver) return (
    <div className="text-center py-5 text-muted">
      <i className="bi bi-person-x font-48 d-block mb-3"></i>
      Driver record not found.
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Driver Management</span>
          <h2 className="fw-800 m-0">{driver.firstname} {driver.lastname}</h2>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Driver Profile</h5>
            <div className="row g-3">
              {[
                ['First Name', driver.firstname],
                ['Last Name', driver.lastname],
                ['Email', driver.email],
                ['Phone', driver.phone_number],
                ['Vehicle', driver.car_assigned || 'None Assigned'],
                ['Status', driver.is_approved ? 'Vetted' : 'Pending Review'],
                ['Joined', driver.createdAt ? moment(driver.createdAt).format('DD MMM YYYY') : 'N/A'],
              ].map(([label, value]) => (
                <div className="col-md-6" key={label}>
                  <span className="text-overline text-muted font-11 d-block mb-1">{label}</span>
                  <p className="fw-700 text-dark m-0">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg p-4">
            <h5 className="fw-800 text-white mb-3">Vetting Status</h5>
            <div className={`p-3 rounded-3 mb-3 ${driver.is_approved ? 'bg-success' : 'bg-warning'} bg-opacity-20`}>
              <i className={`bi ${driver.is_approved ? 'bi-shield-check text-success' : 'bi-hourglass text-warning'} me-2 font-14`}></i>
              <span className="font-12 fw-700">{driver.is_approved ? 'Approved & Active' : 'Awaiting Admin Approval'}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverUserDetail;
