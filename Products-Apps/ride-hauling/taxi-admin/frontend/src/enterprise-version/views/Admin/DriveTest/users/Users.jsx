import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../core/api/apiClient';
import { Button, Card } from '../../../core/components';
import moment from 'moment';

const useDriveTests = () => useQuery({
  queryKey: ['admin', 'drive-tests'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin-drive-tests');
    return data.tests || data || [];
  },
});

/** DriveTest/users/Users — driver road test registry */
const DriveTestUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tests, isLoading } = useDriveTests();

  const filtered = tests?.filter((t) =>
    `${t.driver_name || ''} ${t.result || ''} ${t.evaluator || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Driver Vetting</span>
          <h2 className="fw-800 m-0">Drive Test Registry</h2>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search by driver or evaluator…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">DRIVER</th>
                <th>EVALUATOR</th>
                <th>TEST DATE</th>
                <th>SCORE</th>
                <th className="text-center">RESULT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((t, idx) => (
                  <tr key={t._id || t.id || idx}>
                    <td className="ps-4"><div className="fw-700 text-dark">{t.driver_name || 'Unknown'}</div></td>
                    <td><div className="font-12">{t.evaluator || 'Auto-evaluated'}</div></td>
                    <td><div className="font-12">{t.test_date ? moment(t.test_date).format('DD MMM YYYY') : 'N/A'}</div></td>
                    <td><div className="fw-700 text-primary">{t.score ?? 'N/A'}{t.score !== undefined ? '/100' : ''}</div></td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${t.result === 'passed' ? 'bg-success' : t.result === 'failed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {(t.result || 'Pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No drive test records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default DriveTestUsers;
