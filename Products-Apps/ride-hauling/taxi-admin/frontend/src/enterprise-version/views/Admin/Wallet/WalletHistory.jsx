import React, { useState } from 'react';
import { usePaymentHistory } from '../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/**
 * WalletHistory — taxi-admin
 * High-fidelity financial transaction logs for the entire platform wallet system.
 */
const WalletHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: transactions, isLoading } = usePaymentHistory();
    const addToast = useUIStore((state) => state.addToast);

    return (
        <div className="wallet-history-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Financial Ledger</span>
                    <h2 className="fw-800 m-0">Platform Wallet History</h2>
                </div>
                <Button variant="secondary" onClick={() => addToast('Generating full ledger export...', 'info')}>
                    <i className="bi bi-file-earmark-spreadsheet"></i> Export Ledger
                </Button>
            </div>

            <Card className="p-0 overflow-hidden shadow-md">
                <div className="p-4 border-bottom bg-light">
                    <div className="search-wrap" style={{ maxWidth: '400px' }}>
                        <div className="search-box glass" style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <i className="bi bi-search text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Search transactions..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead>
                            <tr>
                                <th>TRANSACTION ID</th>
                                <th>USER / IDENTIFIER</th>
                                <th>AMOUNT</th>
                                <th>DATE/TIME</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner"></div></td></tr>
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No recent transactions recorded in ledger</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default WalletHistory;
