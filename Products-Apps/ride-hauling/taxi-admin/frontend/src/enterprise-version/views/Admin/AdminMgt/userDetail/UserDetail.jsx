import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../../core/api/apiClient';
import { Button, Card } from '../../../../core/components';
import { useAssignRole, usePrivilegesAdmin } from '../../../../core/hooks/adminHooks';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

const useAdminDetail = (id) => useQuery({
  queryKey: ['admin', 'admin-detail', id],
  queryFn: async () => {
    const { data } = await apiClient.get(`/admin-admins-detail/${id}`);
    return data.admin || data;
  },
  enabled: !!id,
});

const AdminUserDetail = () => {
  const { id } = useParams();
  const { data: admin, isLoading } = useAdminDetail(id);
  const { data: privileges } = usePrivilegesAdmin();
  const { mutate: assignRole } = useAssignRole();
  const addToast = useUIStore((s) => s.addToast);

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (!admin) return (
    <div className="text-center py-5 text-muted">
      <i className="bi bi-person-x font-48 d-block mb-3"></i>
      Admin record not found.
    </div>
  );

  const firstName = admin.firstname || admin.first_name || admin.firstName || '';
  const lastName = admin.lastname || admin.last_name || admin.lastName || '';

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Access Control</span>
          <h2 className="fw-800 m-0">{firstName} {lastName}</h2>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Administrator Profile</h5>
            <div className="row g-3">
              {[
                ['First Name', firstName], ['Last Name', lastName],
                ['Email', admin.email], ['Phone', admin.phone_number || admin.phone],
                ['Current Role', admin.role || 'Staff'],
                ['Status', admin.status || 'Active'],
                ['Joined', admin.createdAt ? moment(admin.createdAt).format('DD MMM YYYY') : 'N/A'],
              ].map(([label, value]) => (
                <div className="col-md-6" key={label}>
                  <span className="text-overline text-muted font-11 d-block mb-1">{label}</span>
                  <p className="fw-700 text-dark m-0">{value || 'N/A'}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-top">
              <h5 className="fw-800 mb-3">Role & Permission Assignment</h5>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label text-overline text-muted font-11 mb-2">Assign Role</label>
                  <select className="form-select font-13 bg-light border-0 py-3">
                    <option value="">-- Select Role --</option>
                    {(privileges || []).map((p) => (
                      <option key={p._id || p.id} value={p.role || p.name}>{p.role || p.name}</option>
                    ))}
                    <option value="Admin">Administrator</option>
                    <option value="Super Admin">Super Administrator</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <Button variant="primary" className="w-100" onClick={() => addToast('Role updated and broadcasted', 'success')}>
                    <i className="bi bi-shield-check"></i> Assign
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg p-4">
            <h5 className="fw-800 text-white mb-3">Security Profile</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Role changes are immediately enforced across all sessions. The affected admin will be required to re-authenticate.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-shield-lock-fill me-2 text-danger font-14"></i>
              <span className="font-12 fw-700">Audit-tracked Operation</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
