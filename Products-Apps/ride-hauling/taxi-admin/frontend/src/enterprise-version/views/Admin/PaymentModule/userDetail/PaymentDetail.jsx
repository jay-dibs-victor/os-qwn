import React from 'react';
import { useParams } from 'react-router-dom';
import { usePaymentHistory } from '../../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../../core/components';
import moment from 'moment';

/** PaymentDetail — single payment transaction view */
const PaymentDetail = () => {
  const { id } = useParams();
  const { data: payments } = usePaymentHistory();
  const record = payments?.find((p) => (p._id || p.id) === id);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Payment Record</span>
          <h2 className="fw-800 m-0">Transaction Detail</h2>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </Button>
      </div>
      {record ? (
        <Card className="glass shadow-md border-0 p-4">
          <div className="row g-4">
            {[
              ['Reference', record.reference || record.referenceCode],
              ['Amount', record.amount ? `${record.currency || '₦'}${record.amount.toLocaleString()}` : 'N/A'],
              ['Gateway', record.gateway || record.provider || 'Paystack'],
              ['Status', record.status],
              ['Email', record.user_email || record.email],
              ['Date', record.createdAt ? moment(record.createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'],
            ].map(([label, value]) => (
              <div className="col-md-4" key={label}>
                <span className="text-overline text-muted font-11 d-block mb-1">{label}</span>
                <p className="fw-700 text-dark m-0">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="text-center py-5 text-muted font-13">Payment record not found.</div>
      )}
    </div>
  );
};
export default PaymentDetail;
