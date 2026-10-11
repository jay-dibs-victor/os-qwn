import React from 'react';
import { Button, Card } from '../../../../core/components';
import moment from 'moment';

/** WalletTransactionDetail — tx detail view */
const WalletTransactionDetail = () => {
  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Wallet Ledger</span>
          <h2 className="fw-800 m-0">Transaction Detail</h2>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </Button>
      </div>
      <Card className="glass shadow-md border-0 p-4">
        <div className="text-center py-5">
          <i className="bi bi-wallet2 font-48 text-muted d-block mb-3" style={{ opacity: 0.4 }}></i>
          <p className="fw-700 text-dark mb-1">Select a transaction to view its details</p>
          <p className="font-13 text-muted">Navigate from the wallet history table to view a specific entry.</p>
        </div>
      </Card>
    </div>
  );
};
export default WalletTransactionDetail;
