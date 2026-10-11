import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useUser, useUpdateUserMutation } from '../../../../core/hooks/useUserHooks';
import { Card, Button } from '../../../../core/components';

export default function UserDetail() {
  const { id } = useParams();
  const history = useHistory();
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUserMutation();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const el = document.getElementById('loggedInOnly');
    if (el) {
      el.style.display = 'block';
      el.style.opacity = 1;
    }
  }, []);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form) return;
    const uid = form._id || id;
    updateUser.mutate({ id: uid, userData: form });
  };

  if (isLoading || !form) return <div>Loading user...</div>;

  return (
    <div className="content-page">
      <div className="content">
        <div className="container" id="admin" data-pageid="admin-users-detail">
          <div className="row">
            <div className="col-lg-12 card-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Button variant="secondary" onClick={() => history.goBack()}><i className="md md-chevron-left"></i> Back to List</Button>
                </div>
                <div>
                  <h4 className="m-b-10 header-title">User Detail <span className="m-l-10 text-purple font-13"><b>{form._id || id}</b></span></h4>
                </div>
                <div>
                  <div className="btn-group">
                    <Button variant="secondary">Options</Button>
                  </div>
                </div>
              </div>
              <div className="clearfix" />
              <div className="m-t-10" style={{ border: '1px solid #4c3392' }} />
              <div className="col-lg-6 m-t-10">
                <Card>
                  <form className="form-horizontal" onSubmit={handleSave}>
                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">Status</label>
                      <div className="col-sm-7">
                        <select className="form-control" value={form.status || 'Active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                          <option>Active</option>
                          <option>Disabled</option>
                          <option>Suspended</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">First Name</label>
                      <div className="col-sm-7">
                        <input type="text" required className="form-control" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">Last Name</label>
                      <div className="col-sm-7">
                        <input type="text" required className="form-control" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">Phone Number</label>
                      <div className="col-sm-7">
                        <input type="text" required className="form-control" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">User Name</label>
                      <div className="col-sm-7">
                        <input type="text" required className="form-control" value={form.full_name || form.name || ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">Email Address</label>
                      <div className="col-sm-7">
                        <input type="email" required className="form-control" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">User Certificate</label>
                      <div className="col-sm-7">
                        <input type="text" required className="form-control" value={form.certificate || form.user_certificate || ''} onChange={(e) => setForm({ ...form, certificate: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group col-sm-12">
                      <label className="col-sm-4 control-label">Wallet Balance</label>
                      <div className="col-sm-7">
                        <input type="text" required disabled className="form-control" value={form.wallet_balance || form.balance || '0.00'} />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="col-sm-offset-4 col-sm-8">
                        <Button variant="primary" type="submit">Save Changes</Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
