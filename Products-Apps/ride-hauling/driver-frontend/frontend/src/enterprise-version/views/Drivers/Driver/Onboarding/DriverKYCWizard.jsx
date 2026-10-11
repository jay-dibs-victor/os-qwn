import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';

const DriverKYCWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ssn: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    isPartner: false,
    partnerDetails: {
      companyName: '',
      registrationNumber: '',
      fleetSize: 1
    }
  });
  const [files, setFiles] = useState({
    licenseFront: null,
    idProof: null,
    utilityBill: null,
    insurance: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const driver = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('partner.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            partnerDetails: { ...prev.partnerDetails, [field]: value }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('driverId', driver?._id || driver?.id);
    submitData.append('ssn', formData.ssn);
    submitData.append('licenseNumber', formData.licenseNumber);
    submitData.append('licenseExpiry', formData.licenseExpiry);
    submitData.append('address', formData.address);
    submitData.append('isPartner', formData.isPartner);
    if (formData.isPartner) {
        submitData.append('partnerDetails', JSON.stringify(formData.partnerDetails));
    }

    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      await axios.post(`${baseUrl}/driver/onboarding`, submitData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      addToast('Onboarding submitted! Our team will review your details.', 'success');
      navigate('/pending-vetting');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      addToast('Submission failed. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg">
        <AnimatedHeroBackground />
      </div>

      <div className="auth-content container flex-row items-center justify-center p-y-80 min-vh-100">
        <div className="glass-auth-card animated fadeInUp shadow-lg" style={{ maxWidth: '800px' }}>
          
          <div className="text-center m-b-40">
            <div className="auth-logo-icon bg-primary m-b-20 mx-auto flex-row items-center justify-center shadow-lg" style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FFB800' }}>
               <i className="md md-verified-user font-28 text-dark"></i>
            </div>
            <h2 className="auth-title">Driver Vetting</h2>
            <p className="auth-subtitle">Step {step} of 3: {step === 1 ? 'Personal Identity' : step === 2 ? 'Document Upload' : 'Final Details'}</p>
            
            <div className="kyc-progress-container m-t-20" style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="kyc-progress-bar" style={{ height: '100%', background: '#FFB800', width: `${(step/3)*100}%`, transition: 'width 0.4s ease' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="form-group m-b-20">
                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Social Security Number / Tax ID</label>
                    <input type="text" name="ssn" className="form-control premium-input" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 m-b-20">
                      <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Driver's License #</label>
                      <input type="text" name="licenseNumber" className="form-control premium-input" placeholder="DL-XXXXXXX" value={formData.licenseNumber} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6 m-b-20">
                      <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">License Expiry</label>
                      <input type="date" name="licenseExpiry" className="form-control premium-input" value={formData.licenseExpiry} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="form-group m-b-30">
                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Valid Home Address</label>
                    <textarea name="address" className="form-control premium-input" placeholder="Full residential address..." value={formData.address} onChange={handleInputChange} required rows="3"></textarea>
                  </div>

                  <button type="button" onClick={nextStep} className="btn-premium w-full p-y-15">Save & Continue</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="row g-4">
                    {['licenseFront', 'idProof', 'utilityBill', 'insurance'].map((name, idx) => (
                      <div className="col-md-6 m-b-20" key={idx}>
                        <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">
                            {name === 'licenseFront' ? 'License Front View' : name === 'idProof' ? 'Identity (Passport/ID)' : name === 'utilityBill' ? 'Utility Bill' : 'Vehicle Insurance'}
                        </label>
                        <div className="glass p-20 text-center" style={{ border: '2px dashed #ddd', borderRadius: '16px', position: 'relative', background: 'rgba(0,0,0,0.02)' }}>
                          <i className={`md ${name === 'licenseFront' ? 'md-camera-alt' : name === 'idProof' ? 'md-person' : name === 'utilityBill' ? 'md-receipt' : 'md-security'} font-24 text-muted m-b-10`}></i>
                          <p className="text-muted font-11 m-0">{files[name] ? files[name].name : 'Upload Photo'}</p>
                          <input type="file" name={name} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} required />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-row gap-15 m-t-30">
                    <button type="button" onClick={prevStep} className="btn-premium btn-secondary flex-1" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)', border: 'none' }}>Back</button>
                    <button type="button" onClick={nextStep} className="btn-premium flex-2">Proceed to Final Step</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="glass p-25 m-b-30 flex-row items-center" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
                    <div className="m-r-20">
                        <input className="custom-checkbox" type="checkbox" name="isPartner" checked={formData.isPartner} onChange={handleInputChange} id="partnerSwitch" style={{ width: '20px', height: '20px' }} />
                    </div>
                    <label htmlFor="partnerSwitch" className="text-dark font-bold font-14 pointer m-0">I am registering as a Partner/Fleet Company</label>
                  </div>

                  {formData.isPartner && (
                    <motion.div className="m-b-30" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <div className="form-group m-b-20">
                        <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Company Legal Name</label>
                        <input type="text" name="partner.companyName" className="form-control premium-input" value={formData.partnerDetails.companyName} onChange={handleInputChange} required />
                      </div>
                      <div className="row">
                        <div className="col-md-8 m-b-20">
                          <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Reg. Number (CAC)</label>
                          <input type="text" name="partner.registrationNumber" className="form-control premium-input" value={formData.partnerDetails.registrationNumber} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-4 m-b-20">
                          <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Fleet Size</label>
                          <input type="number" name="partner.fleetSize" className="form-control premium-input" value={formData.partnerDetails.fleetSize} onChange={handleInputChange} required />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex-row gap-15">
                    <button type="button" onClick={prevStep} className="btn-premium btn-secondary flex-1" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)', border: 'none' }}>Back</button>
                    <button type="submit" className="btn-premium flex-2" disabled={isSubmitting} style={{ background: '#FFB800', color: 'var(--color-text)' }}>
                      {isSubmitting ? 'Submitting Application...' : 'Finish & Submit for Review'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverKYCWizard;
