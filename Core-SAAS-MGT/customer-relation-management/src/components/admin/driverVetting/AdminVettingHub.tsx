import React, { useState } from 'react';
import { 
  Eye, Sliders, Search, AlertTriangle, ShieldCheck, X, 
  User, Car, ShieldAlert, FileText, CheckCircle2, DollarSign
} from 'lucide-react';
import { updateCustomer } from '../../../api/customers';
import Pagination from '../../Pagination';

interface Vehicle {
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  color: string;
  tier: string;
}

interface OnboardingDetails {
  ssn: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  isPartner: boolean;
  documents: {
    licenseFront: string;
    idProof: string;
    utilityBill: string;
    insurance: string;
  };
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  licenseClass: string;
  vehicle: Vehicle;
  onboardingDetails: OnboardingDetails;
  signature: string;
  vettingStatus: string;
  isVerified: boolean;
  status: string;
  submittedAt: string;
}

interface AdminVettingHubProps {
  drivers: Driver[];
  onUpdateDrivers: (updatedDrivers: Driver[]) => void;
  onManageDriver: (driver: Driver) => void;
  onViewTransactions?: (driver: Driver) => void;
  triggerToast: (msg: string) => void;
  // Optional external pagination / search control (for API-backed search)
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}


export default function AdminVettingHub({ drivers, onUpdateDrivers, onManageDriver, onViewTransactions, triggerToast, searchQuery: externalSearch, onSearchChange, page: externalPage, pageSize: externalPageSize, totalItems: externalTotal, onPageChange, onPageSizeChange }: AdminVettingHubProps) {
  // Search and Filter Options State (local fallback when external props not provided)
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [vettingFilterTier, setVettingFilterTier] = useState('all');
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);

  const vettingSearchQuery = externalSearch ?? localSearchQuery;
  const currentPage = externalPage ?? localPage;
  const pageSize = externalPageSize ?? localPageSize;

  const updateSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearchQuery(val);
    }
  };
  
  const vettingFilterOptions = [
    { id: 'all', name: 'All Tiers' },
    { id: 'Luxury', name: 'Luxury Tier' },
    { id: 'Swift', name: 'Swift Tier' }
  ];

  // Inspect Modal State
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleInspectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowInspectModal(true);
  };

  const handleManageDriver = (driver: Driver) => {
    onManageDriver(driver);
  };


  const handleUpdateStatus = async (driverId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(driverId);
    try {
      await updateCustomer(driverId, {
        isVerified: status === 'APPROVED',
        // Use 'active' for approved, 'suspended' for rejected (not 'inactive' which is ambiguous)
        status: status === 'APPROVED' ? 'active' : 'suspended',
        metadata: { vettingStatus: status },
      });

      // Update state locally
      const updatedList = drivers.map(drv => {
        if (drv.id === driverId) {
          return {
            ...drv,
            vettingStatus: status,
            isVerified: status === 'APPROVED',
            status: status === 'APPROVED' ? 'ACTIVE' : 'INACTIVE'
          };
        }
        return drv;
      });

      onUpdateDrivers(updatedList);

      if (status === 'APPROVED') {
        // Trigger referral rewards locally in high-fidelity
        const nameLabel = drivers.find(d => d.id === driverId)?.name || 'New Driver';
        const initialReferrals = JSON.parse(localStorage.getItem('passengerReferrals') || '[]');
        const newReferral = {
          name: nameLabel,
          status: 'COMPLETED',
          date: new Date().toISOString().split('T')[0],
          reward: 100
        };
        localStorage.setItem('passengerReferrals', JSON.stringify([newReferral, ...initialReferrals]));
        triggerToast(`Driver approved! 100 QCoins referral credit awarded!`);
      } else {
        triggerToast(`Driver application rejected.`);
      }

      setProcessingId(null);
      setShowInspectModal(false);
      setSelectedDriver(null);
    } catch (err) {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-card">
      {/* Vetting Card Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye style={{ color: 'var(--primary)' }} size={20} />
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Platform Document Vetting Hub</h3>
        </div>

        {/* Unified Search Filter Component */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          height: '38px',
          boxSizing: 'border-box'
        }}>
          {/* Yellow Filter Dropdown Select */}
          <select
            value={vettingFilterTier}
            onChange={(e) => {
              setVettingFilterTier(e.target.value);
              if (onPageChange) onPageChange(1); else setLocalPage(1);
              triggerToast(`Vetting list filtered by tier: ${e.target.value}`);
            }}
            style={{
              height: '100%',
              padding: '0 1rem',
              background: 'var(--primary)',
              color: '#000',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer',
              borderRadius: '0',
              margin: 0
            }}
          >
            {vettingFilterOptions.map((opt) => (
              <option key={opt.id} value={opt.id} style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>
                {opt.name}
              </option>
            ))}
          </select>

          {/* Search Text Input Field */}
          <input
            type="text"
            placeholder="Search drivers by name or city..."
            value={vettingSearchQuery}
            onChange={(e) => { updateSearch(e.target.value); if (onPageChange) onPageChange(1); else setLocalPage(1); }}
            style={{
              height: '100%',
              padding: '0 1rem',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              width: '220px'
            }}
          />

          {/* Black Search Button with embedded Search Icon */}
          <button
            onClick={() => triggerToast(`Searching for "${vettingSearchQuery}"...`)}
            style={{
              height: '100%',
              padding: '0 1.25rem',
              background: 'rgba(15,15,15,0.95)',
              border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15,15,15,0.95)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <Search size={15} />
          </button>
        </div>
      </div>
      
      <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Review, verify OCR scan extracts, and sign off on submitted driver applications. Approving drivers awards referral coins dynamically.
      </p>

      {/* Driver List Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Driver Info</th>
              <th>Operational City</th>
              <th>Vehicle Type</th>
              <th>Vetting Status</th>
              <th>Submitted Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = drivers.filter(drv => {
                const matchesSearch = drv.name.toLowerCase().includes(vettingSearchQuery.toLowerCase()) ||
                                      drv.city.toLowerCase().includes(vettingSearchQuery.toLowerCase());
                const matchesTier = vettingFilterTier === 'all' || drv.vehicle.tier === vettingFilterTier;
                return matchesSearch && matchesTier;
              });
              const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
              return (
                <>
                  {paginated.map(drv => (
                    <tr key={drv.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', background: 'rgba(255, 184, 0, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {drv.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{drv.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)' }}>{drv.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{drv.city}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--foreground-dim)' }}>{drv.licenseClass}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{drv.vehicle.make} {drv.vehicle.model}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>{drv.vehicle.tier} • {drv.vehicle.plateNumber}</div>
                      </td>
                      <td>
                        <span className={`badge ${drv.vettingStatus === 'PENDING' ? 'badge-pending' : drv.vettingStatus === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}`}>
                          {drv.vettingStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                        {new Date(drv.submittedAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => handleInspectDriver(drv)}>
                            <Eye size={12} /> Inspect Files
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)',
                              color: '#000',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontWeight: '700'
                            }}
                            onClick={() => handleManageDriver(drv)}
                          >
                            <Sliders size={12} /> Manage Form
                          </button>
                          {onViewTransactions && (
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#10b981',
                                fontWeight: '700',
                                borderRadius: '0.5rem',
                                cursor: 'pointer'
                              }}
                              onClick={() => onViewTransactions(drv)}
                            >
                              <DollarSign size={12} /> Transactions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-dim)' }}>
                        <AlertTriangle style={{ margin: '0 auto 0.5rem auto' }} size={24} />
                        No driver applications found.
                      </td>
                    </tr>
                  )}
                </>
              );
            })()}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={externalTotal ?? drivers.filter(drv => {
          const matchesSearch = drv.name.toLowerCase().includes(vettingSearchQuery.toLowerCase()) ||
                                drv.city.toLowerCase().includes(vettingSearchQuery.toLowerCase());
          const matchesTier = vettingFilterTier === 'all' || drv.vehicle.tier === vettingFilterTier;
          return matchesSearch && matchesTier;
        }).length}
        onPageChange={onPageChange ?? setLocalPage}
        onPageSizeChange={(size) => { if (onPageSizeChange) onPageSizeChange(size); else setLocalPageSize(size); if (onPageChange) onPageChange(1); else setLocalPage(1); }}
      />

      {/* Inspect Files / OCR Modal */}
      {showInspectModal && selectedDriver && (
        <div className="modal-overlay" onClick={() => setShowInspectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)' }}>
                  Inspecting: {selectedDriver.name}
                </h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)' }}>ID: {selectedDriver.id}</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowInspectModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: 'var(--border-glass)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '0.6rem' }}>License Number (OCR)</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {selectedDriver.onboardingDetails.licenseNumber}
                  </p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.6rem' }}>Vehicle Specs</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {selectedDriver.vehicle.color} {selectedDriver.vehicle.make} ({selectedDriver.vehicle.year})
                  </p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.6rem' }}>Phone</span>
                  <p style={{ fontSize: '0.85rem' }}>{selectedDriver.phone}</p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.6rem' }}>Operation City</span>
                  <p style={{ fontSize: '0.85rem' }}>{selectedDriver.city}</p>
                </div>
              </div>

              <h4 className="mb-4" style={{ fontSize: '0.9rem', fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                Uploaded Documents (Cloudinary Secured)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { name: "Driver's License", url: selectedDriver.onboardingDetails.documents.licenseFront },
                  { name: "National ID / Passport", url: selectedDriver.onboardingDetails.documents.idProof },
                  { name: "Utility Bill (Address)", url: selectedDriver.onboardingDetails.documents.utilityBill },
                  { name: "Vehicle Insurance Certificate", url: selectedDriver.onboardingDetails.documents.insurance }
                ].map((doc, idx) => (
                  <div key={idx} style={{ background: '#000', border: 'var(--border-glass)', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)' }}>{doc.name}</span>
                    <img 
                      src={doc.url} 
                      alt={doc.name} 
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.05)' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300';
                      }}
                    />
                  </div>
                ))}
              </div>

              <h4 className="mb-4" style={{ fontSize: '0.9rem', fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                Signature Agreement Certificate
              </h4>
              <div style={{ background: '#020202', border: 'var(--border-glass)', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', marginBottom: '1rem' }}>
                {selectedDriver.signature.startsWith('data:') ? (
                  <img src={selectedDriver.signature} alt="Drawn Signature" style={{ maxHeight: '60px', filter: 'brightness(1.5)' }} />
                ) : (
                  <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--foreground-dim)' }}>Signed Digitally</span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setShowInspectModal(false)}>
                Close
              </button>
              
              {selectedDriver.vettingStatus === 'PENDING' && (
                <>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} 
                    disabled={processingId !== null}
                    onClick={() => handleUpdateStatus(selectedDriver.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'var(--success)', boxShadow: '0 4px 12px var(--success-glow)' }} 
                    disabled={processingId !== null}
                    onClick={() => handleUpdateStatus(selectedDriver.id, 'APPROVED')}
                  >
                    {processingId === selectedDriver.id ? 'Approving...' : (
                      <>
                        <ShieldCheck size={14} /> Approve & Award Coins
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
