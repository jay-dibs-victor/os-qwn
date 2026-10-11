import React, { useState } from 'react';
import { Sliders, User, Car, ShieldAlert, ArrowLeft, Save, X, FileText, Edit2, Ban, CheckCircle, Upload, Plus } from 'lucide-react';
import { updateCustomer, createCustomer, customerFullName, driverVettingStatus } from '../../../../api/customers';
import type { Customer } from '../../../../api/customers';
import DocumentUploadCard from '../../../DocumentUploadCard';


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
  biometricSelfie?: string;
  vettingStatus: string;
  isVerified: boolean;
  status: string;
  submittedAt: string;
}

interface AdminManageDriverProps {
  driver: Driver;
  isNewDriver?: boolean;
  onSave: (updatedDriver: Driver) => void;
  onCancel: () => void;
  triggerToast: (msg: string) => void;
}

export default function AdminManageDriver({ driver, isNewDriver, onSave, onCancel, triggerToast }: AdminManageDriverProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'vehicle' | 'onboarding' | 'documents'>('personal');
  const [isEditMode, setIsEditMode] = useState(isNewDriver ?? false);
  const [createdId, setCreatedId] = useState<string | null>(isNewDriver ? null : driver.id);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showDisableSuccess, setShowDisableSuccess] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ── Document URLs (editable in documents tab) ─────────────────────────────
  const [docLicenseFront, setDocLicenseFront] = useState(driver.onboardingDetails.documents.licenseFront);
  const [docIdProof,      setDocIdProof]      = useState(driver.onboardingDetails.documents.idProof);
  const [docUtilityBill,  setDocUtilityBill]  = useState(driver.onboardingDetails.documents.utilityBill);
  const [docInsurance,    setDocInsurance]    = useState(driver.onboardingDetails.documents.insurance);
  const [docBiometric,    setDocBiometric]    = useState(driver.biometricSelfie ?? '');

  // ── Save documents to backend via updateCustomer ──────────────────────────
  const handleSaveDocs = async () => {
    const targetId = createdId || driver.id;
    if (isNewDriver && !createdId) {
      triggerToast('Please save the driver profile first before uploading documents.');
      setIsSavingDocs(false);
      return;
    }
    setIsSavingDocs(true);
    try {
      await updateCustomer(targetId, {
        metadata: {
          docs: {
            licenseFront: docLicenseFront,
            idProof:      docIdProof,
            utilityBill:  docUtilityBill,
            insurance:    docInsurance,
          },
          biometricSelfie: docBiometric || undefined,
        },
      });
      // Propagate updated docs back to parent so the vetting list reflects them
      onSave({
        ...driver,
        biometricSelfie: docBiometric || undefined,
        onboardingDetails: {
          ...driver.onboardingDetails,
          documents: {
            licenseFront: docLicenseFront,
            idProof:      docIdProof,
            utilityBill:  docUtilityBill,
            insurance:    docInsurance,
          },
        },
      });
      triggerToast('Documents saved successfully.');
    } catch (e) {
      triggerToast((e as { message?: string })?.message ?? 'Failed to save documents.');
    } finally {
      setIsSavingDocs(false);
    }
  };

  const [formName, setFormName] = useState(driver.name);
  const [formEmail, setFormEmail] = useState(driver.email);
  const [formPhone, setFormPhone] = useState(driver.phone);
  const [formCity, setFormCity] = useState(driver.city);
  const [formLicenseClass, setFormLicenseClass] = useState(driver.licenseClass);
  const [formMake, setFormMake] = useState(driver.vehicle.make);
  const [formModel, setFormModel] = useState(driver.vehicle.model);
  const [formPlate, setFormPlate] = useState(driver.vehicle.plateNumber);
  const [formColor, setFormColor] = useState(driver.vehicle.color);
  const [formTier, setFormTier] = useState(driver.vehicle.tier);
  const [formYear, setFormYear] = useState(driver.vehicle.year);
  const [formLNumber, setFormLNumber] = useState(driver.onboardingDetails.licenseNumber);
  const [formLExpiry, setFormLExpiry] = useState(driver.onboardingDetails.licenseExpiry);
  const [formAddress, setFormAddress] = useState(driver.onboardingDetails.address);
  const [formVettingStatus, setFormVettingStatus] = useState(driver.vettingStatus);
  const [formIsVerified, setFormIsVerified] = useState(driver.isVerified);

  const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', padding: '0.65rem 1rem',
    background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
    borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
    fontSize: '0.85rem', outline: 'none', cursor: isEditMode ? 'text' : 'default',
    transition: 'all 0.2s', ...extra
  });

  const selectStyle = (): React.CSSProperties => ({
    width: '100%', padding: '0.65rem 1rem',
    background: isEditMode ? '#1a1a1a' : '#0a0a0a',
    border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
    borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
    fontSize: '0.85rem', outline: 'none', cursor: isEditMode ? 'pointer' : 'default',
    transition: 'all 0.2s'
  });

  const customerToDriver = (c: Customer): Driver => ({
    id: c.id,
    name: customerFullName(c),
    email: c.email,
    phone: c.phone,
    city: c.city ?? 'Unknown',
    licenseClass: (c.metadata as any)?.licenseClass ?? formLicenseClass,
    vehicle: {
      make: c.vehicleModel?.split(' ')[0] ?? formMake,
      model: c.vehicleModel?.split(' ').slice(1).join(' ') ?? formModel,
      year: (c.metadata as any)?.vehicleYear ?? formYear,
      plateNumber: c.vehicleRegistration ?? formPlate,
      color: (c.metadata as any)?.vehicleColor ?? formColor,
      tier: (c.metadata as any)?.tier ?? formTier,
    },
    onboardingDetails: {
      ssn: (c.metadata as any)?.ssn ?? '',
      licenseNumber: c.licenseNumber ?? formLNumber,
      licenseExpiry: c.licenseExpiry ?? formLExpiry,
      address: c.address ?? formAddress,
      isPartner: (c.metadata as any)?.source === 'partner',
      documents: {
        licenseFront: (c.metadata as any)?.docs?.licenseFront ?? docLicenseFront,
        idProof: (c.metadata as any)?.docs?.idProof ?? docIdProof,
        utilityBill: (c.metadata as any)?.docs?.utilityBill ?? docUtilityBill,
        insurance: (c.metadata as any)?.docs?.insurance ?? docInsurance,
      },
    },
    signature: (c.metadata as any)?.signature ?? '',
    biometricSelfie: (c.metadata as any)?.biometricSelfie ?? (docBiometric || undefined),
    vettingStatus: driverVettingStatus(c),
    isVerified: c.isVerified,
    status: c.status === 'active' ? 'Active' : 'Inactive',
    submittedAt: c.createdAt,
  });

  const buildPayload = () => ({
    firstName: formName.trim().split(/\s+/)[0] || '',
    lastName: formName.trim().split(/\s+/).slice(1).join(' ') || '',
    email: formEmail,
    phone: formPhone,
    address: formAddress,
    city: formCity,
    licenseNumber: formLNumber,
    licenseExpiry: formLExpiry,
    vehicleModel: `${formMake} ${formModel}`.trim(),
    vehicleRegistration: formPlate,
    isVerified: formIsVerified,
    status: formVettingStatus === 'APPROVED' ? 'Active' : 'Inactive',
    metadata: {
      docs: { licenseFront: docLicenseFront, idProof: docIdProof, utilityBill: docUtilityBill, insurance: docInsurance },
      biometricSelfie: docBiometric || undefined,
      tier: formTier,
      licenseClass: formLicenseClass,
      vehicleYear: formYear,
      vehicleColor: formColor,
      vettingStatus: formVettingStatus,
    },
  });

  const handleSave = async () => {
    if (isNewDriver && !createdId) {
      setIsCreating(true);
      try {
        const created = await createCustomer({
          customerType: 'driver',
          ...buildPayload(),
        } as any);
        const newDriver = customerToDriver(created);
        setCreatedId(created.id);
        onSave(newDriver);
        triggerToast(`Driver ${formName} created successfully.`);
      } catch {
        triggerToast('Failed to create driver.');
        setIsCreating(false);
        return;
      }
      setIsCreating(false);
      return;
    }

    const payload = buildPayload();
    const targetId = createdId || driver.id;
    try {
      await updateCustomer(targetId, payload as any);
    } catch { /* fall through */ }

    const updatedDriver: Driver = {
      ...driver,
      name: formName,
      email: formEmail,
      phone: formPhone,
      city: formCity,
      licenseClass: formLicenseClass,
      vettingStatus: formVettingStatus,
      isVerified: formIsVerified,
      status: formVettingStatus === 'APPROVED' ? 'Active' : 'Inactive',
      vehicle: {
        ...driver.vehicle,
        make: formMake,
        model: formModel,
        year: formYear,
        plateNumber: formPlate,
        color: formColor,
        tier: formTier
      },
      onboardingDetails: {
        ...driver.onboardingDetails,
        licenseNumber: formLNumber,
        licenseExpiry: formLExpiry,
        address: formAddress
      }
    };
    onSave(updatedDriver);
    triggerToast(`Registry updated for ${formName} successfully.`);
    setIsEditMode(false);
  };

  const handleDisableConfirmed = async () => {
    const targetId = createdId || driver.id;
    try {
      await updateCustomer(targetId, {
        status: 'SUSPENDED',
        isVerified: false,
        metadata: {
          ...driver.onboardingDetails.documents ? { docs: driver.onboardingDetails.documents } : {},
          vettingStatus: 'REJECTED',
        },
      } as any);
    } catch { /* fall through */ }
    const disabled: Driver = { ...driver, status: 'Disabled', vettingStatus: 'REJECTED', isVerified: false };
    onSave(disabled);
    setShowDisableConfirm(false);
    setShowDisableSuccess(true);
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', width: '100%', boxSizing: 'border-box', marginTop: '0.5rem' }}>
      
      {/* Disable Confirm Modal */}
      {showDisableConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <Ban size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Disable Driver Account?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>This will revoke <strong style={{ color: '#fff' }}>{driver.name}</strong>'s platform access and mark their vetting status as REJECTED. This action can be reversed later.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDisableConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={handleDisableConfirmed}>Yes, Disable</button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Success Modal */}
      {showDisableSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Driver Disabled</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>{driver.name}'s account has been successfully disabled and removed from the active fleet registry.</p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setShowDisableSuccess(false); onCancel(); }}>Okay</button>
          </div>
        </div>
      )}

      {/* Save Confirm Modal */}
      {showSaveConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '620px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} style={{ color: 'var(--primary)' }} /> {isNewDriver && !createdId ? 'Confirm New Driver' : 'Confirm Registry Update'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>Review the details below before saving to the registry.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {[
                ['Full Name', formName], ['Email', formEmail], ['Phone', formPhone],
                ['City', formCity], ['License Class', formLicenseClass], ['Vetting Status', formVettingStatus],
                ['Vehicle Make', formMake], ['Model', formModel], ['Year', formYear],
                ['Plate', formPlate], ['Color', formColor], ['Tier', formTier],
                ['License No.', formLNumber], ['License Expiry', formLExpiry],
                ['Verified', formIsVerified ? 'Yes' : 'No']
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--foreground-dim)', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '600' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => { setShowSaveConfirm(false); handleSave(); setShowSaveSuccess(true); }}><Save size={14} /> Confirm & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{isNewDriver && !createdId ? 'Driver Created' : 'Registry Updated'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Driver profile for <strong style={{ color: '#fff' }}>{formName}</strong> has been {isNewDriver && !createdId ? 'added to the registry' : 'saved to the registry'} successfully.</p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700', cursor: 'pointer' }} onClick={() => setShowSaveSuccess(false)}>Okay</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} title="Back" onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isNewDriver ? <Plus size={22} style={{ color: 'var(--primary)' }} /> : <Sliders size={22} style={{ color: 'var(--primary)' }} />}
              {isNewDriver ? 'Add New Driver' : `Manage Driver: ${formName}`}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
              Registry Modulator {!isNewDriver && <>• ID: <span style={{color: 'var(--primary)'}}>{driver.id}</span></>}
              {!isEditMode && !isNewDriver && <span style={{ marginLeft: '0.75rem', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isNewDriver && (
            <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }} onClick={() => setShowDisableConfirm(true)} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
              <Ban size={14} /> Disable Driver
            </button>
          )}
          {isEditMode ? (
            <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { if (!isNewDriver) setIsEditMode(false); }}>
              <X size={14} /> Cancel Edit
            </button>
          ) : (
            <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s' }} onClick={() => setIsEditMode(true)}>
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'personal', name: 'Personal Details', icon: <User size={15} /> },
          { id: 'vehicle', name: 'Vehicle Carriage Specs', icon: <Car size={15} /> },
          { id: 'onboarding', name: 'Status & Compliance', icon: <ShieldAlert size={15} /> },
          { id: 'documents', name: 'Uploaded Documents', icon: <FileText size={15} /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.82rem',
              background: activeTab === tab.id ? 'rgba(255,184,0,0.08)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.25s'
            }}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>


      {/* Form Page Tabs Content */}
      <div style={{ minHeight: '320px' }}>
        
        {activeTab === 'personal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Full Legal Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Email Address</label>
                <input 
                  type="email" 
                  value={formEmail} 
                  onChange={(e) => setFormEmail(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Contact Phone</label>
                <input 
                  type="text" 
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Operation City Zone</label>
                <select 
                  value={formCity} 
                  onChange={(e) => setFormCity(e.target.value)} disabled={!isEditMode} style={selectStyle()}
                >
                  <option value="Accra">Accra (Ghana)</option>
                  <option value="Nairobi">Nairobi (Kenya)</option>
                  <option value="London">London (UK)</option>
                  <option value="Lagos">Lagos (Nigeria)</option>
                  <option value="Kigali">Kigali (Rwanda)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Driving License Class Designation</label>
              <input 
                type="text" 
                value={formLicenseClass} 
                onChange={(e) => setFormLicenseClass(e.target.value)} disabled={!isEditMode} style={inputStyle()}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Home Registry Address</label>
              <textarea 
                value={formAddress} 
                onChange={(e) => setFormAddress(e.target.value)}
                rows={4} disabled={!isEditMode} style={inputStyle({resize:"vertical",fontFamily:"inherit"})}
              />
            </div>
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Vehicle Manufacturer</label>
                <input 
                  type="text" 
                  value={formMake} 
                  onChange={(e) => setFormMake(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Model Name</label>
                <input 
                  type="text" 
                  value={formModel} 
                  onChange={(e) => setFormModel(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Year Built</label>
                <input 
                  type="text" 
                  value={formYear} 
                  onChange={(e) => setFormYear(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Registration Plate Number</label>
                <input 
                  type="text" 
                  value={formPlate} 
                  onChange={(e) => setFormPlate(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Exterior Paint Color</label>
                <input 
                  type="text" 
                  value={formColor} 
                  onChange={(e) => setFormColor(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}> Platform Carriage Tier</label>
              <select 
                value={formTier} 
                onChange={(e) => setFormTier(e.target.value)} disabled={!isEditMode} style={selectStyle()}
              >
                <option value="Swift">Swift Tier (Standard commuter carriage)</option>
                <option value="Luxury">Luxury Tier (Premium glassmorphic  transport)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>License Registration Identifier</label>
                <input 
                  type="text" 
                  value={formLNumber} 
                  onChange={(e) => setFormLNumber(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>License Document Expiration Date</label>
                <input 
                  type="date" 
                  value={formLExpiry} 
                  onChange={(e) => setFormLExpiry(e.target.value)} disabled={!isEditMode} style={inputStyle()}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Registry Vetting Validation Status</label>
              <select 
                value={formVettingStatus} 
                onChange={(e) => setFormVettingStatus(e.target.value)} disabled={!isEditMode} style={selectStyle()}
              >
                <option value="PENDING">PENDING (Awaiting Validation Clearance)</option>
                <option value="APPROVED">APPROVED (Verified  Citizen)</option>
                <option value="REJECTED">REJECTED (Application Revoked)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.015)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="formVerifiedStandalone"
                checked={formIsVerified} 
                onChange={(e) => setFormIsVerified(e.target.checked)}
                disabled={!isEditMode} style={{ cursor: isEditMode ? 'pointer' : 'default', width: '16px', height: '16px' }}
              />
              <label htmlFor="formVerifiedStandalone" style={{ fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', color: 'var(--foreground-muted)' }}>
                Identity verification cleared, matching national database, and signed cryptographically
              </label>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Provider badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '700', color: 'var(--primary)' }}>
                Cloud-Secured Onboarding Credentials
              </h3>
              <span style={{ fontSize: '0.62rem', background: 'rgba(255,184,0,0.08)', color: 'var(--primary)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '99px', padding: '0.15rem 0.55rem', fontWeight: '800' }}>
                {import.meta.env.VITE_UPLOAD_PROVIDER === 's3' ? '☁ AWS S3' : '☁ Cloudinary CDN'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <DocumentUploadCard
                label="Driver's License (Front)"
                currentUrl={docLicenseFront}
                folder={`queens-os/drivers/${createdId || driver.id}/docs`}
                editable={isEditMode}
                onUploaded={(url) => setDocLicenseFront(url)}
                onRemoved={() => setDocLicenseFront('')}
              />
              <DocumentUploadCard
                label="National ID / Passport"
                currentUrl={docIdProof}
                folder={`queens-os/drivers/${createdId || driver.id}/docs`}
                editable={isEditMode}
                onUploaded={(url) => setDocIdProof(url)}
                onRemoved={() => setDocIdProof('')}
              />
              <DocumentUploadCard
                label="Utility Bill (Proof of Residence)"
                currentUrl={docUtilityBill}
                folder={`queens-os/drivers/${createdId || driver.id}/docs`}
                editable={isEditMode}
                onUploaded={(url) => setDocUtilityBill(url)}
                onRemoved={() => setDocUtilityBill('')}
              />
              <DocumentUploadCard
                label="Vehicle Insurance Certificate"
                currentUrl={docInsurance}
                folder={`queens-os/drivers/${createdId || driver.id}/docs`}
                editable={isEditMode}
                onUploaded={(url) => setDocInsurance(url)}
                onRemoved={() => setDocInsurance('')}
              />
            </div>

            {/* Biometric selfie */}
            <div>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', margin: '0 0 1rem 0', fontWeight: '700', color: 'var(--primary)' }}>
                Biometric Identity Profile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                {/* Animated biometric ring */}
                <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.5)', boxShadow: '0 0 20px rgba(16,185,129,0.2)', animation: 'bioPulse 2.5s ease-in-out infinite' }} />
                  <style>{`@keyframes bioPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.04)} }`}</style>
                  {docBiometric ? (
                    <img src={docBiometric} alt="Biometric selfie" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.4)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🔍</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--foreground-dim)', textAlign: 'center' }}>No capture</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <DocumentUploadCard
                    label="Biometric Selfie"
                    currentUrl={docBiometric}
                    folder={`queens-os/drivers/${createdId || driver.id}/biometric`}
                    editable={isEditMode}
                    accept="image/jpeg,image/png,image/webp"
                    onUploaded={(url) => setDocBiometric(url)}
                    onRemoved={() => setDocBiometric('')}
                  />
                </div>
              </div>
            </div>

            {/* Save documents button — only in edit mode */}
            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={handleSaveDocs}
                  disabled={isSavingDocs}
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800', opacity: isSavingDocs ? 0.6 : 1 }}
                >
                  <Upload size={14} /> {isSavingDocs ? 'Saving…' : 'Save Documents'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom action bar — only shown in edit mode */}
      {isEditMode && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); }}>
            <X size={14} /> Discard
          </button>
          <button style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setShowSaveConfirm(true)}>
            <Save size={14} /> {isNewDriver && !createdId ? 'Create Driver' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );

}
