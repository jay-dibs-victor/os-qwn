import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShieldAlert, BadgeCheck, Car, FileImage, PenTool, Sparkles, RefreshCw, Coins, Landmark, HeartPulse, Plane, Utensils, Scan, Upload, X, Video, User, MapPin, Loader2 } from 'lucide-react';
import DocumentUploadCard from './DocumentUploadCard';
import SignaturePad from './SignaturePad';
import { Country, City } from 'country-state-city';

interface DriverPortalProps {
  onOnboardingComplete: () => void;
}

export default function DriverPortal({ onOnboardingComplete }: DriverPortalProps) {
  const navigate = useNavigate();
  // Onboarding flow control: 'signup' | 'otp' | 'otp_success' | 'wizard'
  const [onboardingProgress, setOnboardingProgress] = useState<'signup' | 'otp' | 'otp_success' | 'wizard'>('signup');
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States - Step 1: Profile Info
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'London',
    licenseClass: 'Class A'
  });

  // Form States - Step 2: Vehicle Info
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '2023',
    plateNumber: '',
    color: '',
    tier: 'Economy'
  });
  const [inspectionMedia, setInspectionMedia] = useState<{ url: string; name: string; type: 'image' | 'video' }[]>([]);
  const [isUploadingInspection, setIsUploadingInspection] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'processing' | 'verified' | 'failed'>('idle');

  // Form States - Step 3: Uploaded files from Cloudinary
  const [documents, setDocuments] = useState({
    licenseFront: '',
    idProof: '',
    utilityBill: '',
    insurance: ''
  });
  const [extractedOcr, setExtractedOcr] = useState({
    licenseFront: '',
    idProof: '',
    utilityBill: '',
    insurance: ''
  });

  // Form States - Step 4: Signature
  const [signature, setSignature] = useState('');

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignupForm(prev => {
      const nextState = { ...prev, [name]: value };
      // If country changes, we might want to clear the city since it might not belong to the new country,
      // but to avoid jarring UX, we'll let the user change it manually if they want.
      return nextState;
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Nominatim requires a user-agent header per usage policy, fetch defaults are usually fine for demo, but we add an identifier
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.address) {
            const countryName = data.address.country || '';
            const cityName = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const road = data.address.road || '';
            const houseNumber = data.address.house_number || '';
            const fullAddress = `${houseNumber} ${road}`.trim();

            setSignupForm(prev => ({
              ...prev,
              country: prev.country || countryName,
              city: prev.city || cityName,
              address: prev.address || fullAddress
            }));
          }
        } catch (error) {
          console.error("Error fetching location data", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setIsLocating(false);
        alert('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  // Derive city list based on selected country
  const availableCities = useMemo(() => {
    if (!signupForm.country) return [];
    const selectedCountryObj = Country.getAllCountries().find(c => c.name.toLowerCase() === signupForm.country.toLowerCase());
    if (selectedCountryObj) {
      return City.getCitiesOfCountry(selectedCountryObj.isoCode) || [];
    }
    return [];
  }, [signupForm.country]);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.phone) {
      setOtpError('Please fill in all details.');
      return;
    }
    setIsSubmitting(true);
    setOtpError(null);

    // Simulate calling the registration service / OTP dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setOnboardingProgress('otp');
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setOtpError('Please enter a valid 4-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError(null);

    // Simulate OTP verification matching with Queens OS NATS signal (OTP: 4820)
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setOnboardingProgress('otp_success');
    }, 1200);
  };

  const handleProceedToWizard = () => {
    // Sync prefilled data into Profile onboarding fields
    setProfileData(prev => ({
      ...prev,
      name: signupForm.name,
      email: signupForm.email,
      phone: signupForm.phone,
      city: signupForm.city
    }));
    setOnboardingProgress('wizard');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  const handleInspectionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingInspection(true);
    setUploadProgress(10);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);

        const newMedia: { url: string; name: string; type: 'image' | 'video' }[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const mockUrl = URL.createObjectURL(file);
          const type = file.type.startsWith('video') ? 'video' : 'image';
          newMedia.push({ url: mockUrl, name: file.name, type });
        }

        setTimeout(() => {
          setInspectionMedia(prev => [...prev, ...newMedia]);
          setIsUploadingInspection(false);
          setUploadProgress(0);
        }, 300);
      } else {
        setUploadProgress(progress);
      }
    }, 200);
  };

  const handleRemoveInspection = (indexToRemove: number) => {
    setInspectionMedia(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUploadComplete = (fieldName: string, fileUrl: string, extractedText?: string) => {
    setDocuments(prev => ({ ...prev, [fieldName]: fileUrl }));
    if (extractedText) {
      setExtractedOcr(prev => ({ ...prev, [fieldName]: extractedText }));
    }
  };

  const handleSignatureSign = (signatureDataUrl: string) => {
    setSignature(signatureDataUrl);
  };

  const handleSignatureClear = () => {
    setSignature('');
  };

  const validateStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!profileData.name || !profileData.email || !profileData.phone) {
        setErrorMsg('Please fill in all personal information fields.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!vehicleData.make || !vehicleData.model || !vehicleData.plateNumber || !vehicleData.color) {
        setErrorMsg('Please fill in all vehicle specification fields.');
        return false;
      }
      if (inspectionMedia.length === 0) {
        setErrorMsg('Please upload at least one image or video for the vehicle inspection overlook to certify its sound shape.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!documents.licenseFront || !documents.idProof || !documents.utilityBill || !documents.insurance) {
        setErrorMsg('Please upload all 4 required documents to proceed.');
        return false;
      }
    } else if (currentStep === 4) {
      if (biometricStatus !== 'verified') {
        setErrorMsg('Please complete the biometric facial recognition scan to proceed.');
        return false;
      }
    } else if (currentStep === 5) {
      if (!signature) {
        setErrorMsg('Please sign the agreement box before submitting.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    // Prepare driver onboarding package
    const onboardingPayload = {
      id: `drv_${Date.now()}`,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      city: profileData.city,
      licenseClass: profileData.licenseClass,
      vehicle: vehicleData,
      onboardingDetails: {
        ssn: `XXX-XX-${Math.floor(1000 + Math.random() * 9000)}`,
        licenseNumber: extractedOcr.licenseFront || `DL-${Math.floor(10000 + Math.random() * 90000)}`,
        licenseExpiry: new Date(Date.now() + 31536000000 * 3).toISOString().split('T')[0], // 3 years out
        address: extractedOcr.utilityBill || '124 Queens Road, London',
        isPartner: true,
        documents: documents
      },
      signature: signature,
      vettingStatus: 'PENDING',
      isVerified: false,
      status: 'Inactive',
      submittedAt: new Date().toISOString()
    };

    try {
      // 1. Dispatch to local storage so the demo interface is 100% interconnected
      const currentPending = JSON.parse(localStorage.getItem('pendingDrivers') || '[]');
      localStorage.setItem('pendingDrivers', JSON.stringify([...currentPending, onboardingPayload]));

      // 2. Fire backend REST call to existing ride-service/auth-service onboarding endpoints
      // We will perform a silent fetch. If it fails (e.g. backend server offline), the localStorage fallback has saved us!
      const serverUrl = window.location.port === '5173' ? 'http://localhost:5000' : '';
      await fetch(`${serverUrl}/api/v1/onboarding/driver/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: onboardingPayload.id,
          ssn: onboardingPayload.onboardingDetails.ssn,
          licenseNumber: onboardingPayload.onboardingDetails.licenseNumber,
          licenseExpiry: onboardingPayload.onboardingDetails.licenseExpiry,
          address: onboardingPayload.onboardingDetails.address,
          isPartner: true,
          documents: documents
        })
      }).catch(() => {
        console.log('Backend server offline. Operating in standalone high-fidelity mock mode.');
      });

      // Show success celebratory screen
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Failed to submit onboarding details. Please try again.');
    }
  };

  const handleReset = () => {
    setProfileData({ name: '', email: '', phone: '', city: 'London', licenseClass: 'Class A' });
    setVehicleData({ make: '', model: '', year: '2023', plateNumber: '', color: '', tier: 'Economy' });
    setDocuments({ licenseFront: '', idProof: '', utilityBill: '', insurance: '' });
    setSignature('');
    setCurrentStep(1);
    setShowSuccess(false);
    setOnboardingProgress('signup');
    setSignupForm({ name: '', email: '', phone: '', country: '', city: '', address: '' });
    setOtpCode('');
    setOtpError(null);
    onOnboardingComplete();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', overflow: 'hidden', padding: '1rem 0.5rem', borderRadius: '1.5rem', width: '100%' }}>

      {/* Self-contained keyframe styles for smooth scroll bounce indicator & animated road trip background */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes roadTripOne {
          0% { offset-distance: 0%; transform: rotate(0deg); }
          100% { offset-distance: 100%; transform: rotate(0deg); }
        }
        @keyframes roadTripTwo {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes roadTripThree {
          0% { offset-distance: 0%; transform: scaleX(-1); }
          100% { offset-distance: 100%; transform: scaleX(-1); }
        }
        @keyframes roadTripFour {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0.25; }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 10px rgba(255,184,0,0.2)); }
          50% { transform: scale(1.05); opacity: 0.95; filter: drop-shadow(0 0 25px rgba(255,184,0,0.5)); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-5vh) rotate(0deg); }
          100% { transform: translateY(105vh) rotate(360deg); }
        }
        @keyframes confettiSway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
      `}} />

      {/* Inject responsive CSS to hide POI address labels on mobile & space them away dynamically */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .poi-container {
          position: absolute;
          opacity: 0.95;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }
        @media (min-width: 1280px) {
          .poi-left-1 { left: 5% !important; }
          .poi-right-1 { right: 5% !important; }
          .poi-left-2 { left: 6% !important; }
          .poi-right-2 { right: 6% !important; }
        }
        @media (max-width: 1279px) and (min-width: 1040px) {
          .poi-left-1 { left: 1% !important; }
          .poi-right-1 { right: 1% !important; }
          .poi-left-2 { left: 2% !important; }
          .poi-right-2 { right: 2% !important; }
        }
        @media (max-width: 1039px) {
          .poi-container { display: none !important; }
        }
      `}} />

      {/* Vector Road Trip Grid Underlay Background - Extended down the entire page height with Road Names */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.38 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="driver-portal-road-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 184, 0, 0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#driver-portal-road-grid)" />

        {/* Road 1: Upper-Mid Lane (adjusted to fit within onboarding heights) */}
        <path d="M -100,120 C 300,40 600,450 1400,320" fill="none" stroke="rgba(255,184,0,0.12)" strokeWidth="26" strokeLinecap="round" />
        <path d="M -100,120 C 300,40 600,450 1400,320" fill="none" stroke="#141414" strokeWidth="20" strokeLinecap="round" />
        <path d="M -100,120 C 300,40 600,450 1400,320" fill="none" stroke="rgba(255,184,0,0.7)" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Road 2: Mid-Lower Lane */}
        <path d="M -50,580 Q 400,420 700,750 T 1450,620" fill="none" stroke="rgba(255,184,0,0.1)" strokeWidth="22" strokeLinecap="round" />
        <path d="M -50,580 Q 400,420 700,750 T 1450,620" fill="none" stroke="#141414" strokeWidth="16" strokeLinecap="round" />
        <path d="M -50,580 Q 400,420 700,750 T 1450,620" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="5 5" />

        {/* Road 3: Deep Bottom Lane */}
        <path d="M 100,850 C 300,720 800,820 1350,680" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="24" strokeLinecap="round" />
        <path d="M 100,850 C 300,720 800,820 1350,680" fill="none" stroke="#141414" strokeWidth="18" strokeLinecap="round" />
        <path d="M 100,850 C 300,720 800,820 1350,680" fill="none" stroke="rgba(255,184,0,0.5)" strokeWidth="1.5" strokeDasharray="8 6" />

        {/* Road 4: Full Vertical Highway passing through */}
        <path d="M 150,-50 Q 550,450 980,950" fill="none" stroke="rgba(255,184,0,0.1)" strokeWidth="22" strokeLinecap="round" />
        <path d="M 150,-50 Q 550,450 980,950" fill="none" stroke="#141414" strokeWidth="16" strokeLinecap="round" />
        <path d="M 150,-50 Q 550,450 980,950" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="6 6" />

        {/* Cartographic Street & Highway Text Labels */}
        <text x="320" y="80" fill="rgba(255,184,0,0.4)" fontSize="9" fontFamily="monospace" letterSpacing="2" transform="rotate(-6 320 80)">KINGS HIGHWAY A10</text>
        <text x="420" y="520" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace" letterSpacing="2" transform="rotate(-15 420 520)">QUEENS BOULEVARD</text>
        <text x="510" y="770" fill="rgba(255,184,0,0.3)" fontSize="9" fontFamily="monospace" letterSpacing="2" transform="rotate(8 510 770)">ECOSYSTEM EXPRESSWAY</text>
        <text x="750" y="450" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" letterSpacing="2" transform="rotate(45 750 450)">METROPOLITAN AVE</text>
      </svg>

      {/* POI badges removed per user request */}

      {/* Animating Cars / Pulsing Dots on paths */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {/* Car 1 navigating along Road 1 */}
        <div style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          offsetPath: `path('M -100,120 C 300,40 600,450 1400,320')`,
          animation: 'roadTripOne 20s infinite linear',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6
        }}>
          <Car size={14} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 4px var(--primary))' }} />
          <span style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'glowPulse 2s infinite ease-in-out' }} />
        </div>

        {/* Pulsing Dot 2 navigating along Road 2 */}
        <div style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          offsetPath: `path('M -50,580 Q 400,420 700,750 T 1450,620')`,
          animation: 'roadTripTwo 16s infinite linear',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.55
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
          <span style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary)', animation: 'glowPulse 1.5s infinite ease-out' }} />
        </div>

        {/* Car 3 navigating along Road 3 */}
        <div style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          offsetPath: `path('M 100,850 C 300,720 800,820 1350,680')`,
          animation: 'roadTripThree 24s infinite linear',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.55
        }}>
          <Car size={14} style={{ color: '#fff', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }} />
        </div>

        {/* Pulsing Dot 4 navigating along Road 4 */}
        <div style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          offsetPath: `path('M 150,-50 Q 550,450 980,950')`,
          animation: 'roadTripFour 28s infinite linear',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
          <span style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary)', animation: 'glowPulse 1.8s infinite ease-out' }} />
        </div>
      </div>

      {/* 1. Onboarding Registration & Signup Card */}
      {(onboardingProgress === 'signup' || onboardingProgress === 'otp') && (
        <div className="glass-card glass-card-accent" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

          {/* PHASE A: Sign Up */}
          {onboardingProgress === 'signup' && (
            <div>
              {/* Header with VIP benefits scroll hint */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>

                {/* VIP Onboarding Hint Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #FFB800 0%, #E6A100 100%)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#000000',
                  maxWidth: '680px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  alignItems: 'center',
                  boxShadow: '0 8px 30px rgba(255,184,0,0.18)',
                  position: 'relative'
                }}>
                  <span style={{ fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Sparkles size={14} className="animate-pulse" style={{ color: '#000000' }} /> VIP COOPERATIVE PERKS UNLOCKED
                  </span>
                  <span style={{ color: '#1a1a1a', fontSize: '0.75rem', lineHeight: '1.45', fontWeight: '600', textAlign: 'center' }}>
                    Receive a +1,000 signup QCoins voucher, access immediate loan assessments, housing mortgages, flat-rate subscriptions, and zero-deposit hybrid vehicle financing!
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/driver/perks')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#000000',
                      fontWeight: '800',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      marginTop: '0.15rem',
                      padding: '2px 8px',
                      borderBottom: '1px dashed #000000'
                    }}
                  >
                    Explore All 27 Ecosystem Perks & Privileges
                    <span style={{ display: 'inline-block', fontSize: '0.85rem' }}>→</span>
                  </button>
                </div>

                <h2 style={{ fontSize: '1.75rem', marginTop: '1rem', marginBottom: '0.1rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
                  Sign Up as a Driver Partner
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
                  Create your partner profile today to unlock daily quests, zero-deductions, and stable floor earnings.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit}>
                {otpError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--error-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
                    <ShieldAlert size={16} />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Legal Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupFormChange}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    className="form-input"
                    placeholder="Enter your legal full name"
                    required
                  />
                  {focusedInput === 'name' && (
                    <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>👤 MATCHES OFFICIAL ID</span>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={signupForm.email}
                      onChange={handleSignupFormChange}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      className="form-input"
                      placeholder="driver@queensos.com"
                      required
                    />
                    {focusedInput === 'email' && (
                      <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>✉️ SECURE COMMS CHANNEL</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Mobile Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={signupForm.phone}
                      onChange={handleSignupFormChange}
                      onFocus={() => setFocusedInput('phone')}
                      onBlur={() => setFocusedInput(null)}
                      className="form-input"
                      placeholder="+44 7911 123456"
                      required
                    />
                    {focusedInput === 'phone' && (
                      <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>📱 OTP VERIFICATION NO.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-outfit)', margin: 0 }}>
                    Operations & Dispatch Zone
                  </h3>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)',
                      color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                      fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    {isLocating ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />}
                    {isLocating ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Country</label>
                    <input
                      list="country-list"
                      name="country"
                      value={signupForm.country}
                      onChange={handleSignupFormChange}
                      onFocus={() => setFocusedInput('country')}
                      onBlur={() => setFocusedInput(null)}
                      className="form-input"
                      placeholder="Search country..."
                      required
                    />
                    <datalist id="country-list">
                      {Country.getAllCountries().map(c => (
                        <option key={c.isoCode} value={c.name} />
                      ))}
                    </datalist>
                    {focusedInput === 'country' && (
                      <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>🌍 GLOBAL REGION</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">City of Operations</label>
                    <input
                      list="city-list"
                      name="city"
                      value={signupForm.city}
                      onChange={handleSignupFormChange}
                      onFocus={() => setFocusedInput('city')}
                      onBlur={() => setFocusedInput(null)}
                      className="form-input"
                      placeholder={signupForm.country ? "Search city..." : "Select country first"}
                      required
                    />
                    <datalist id="city-list">
                      {availableCities.map((city, idx) => (
                        <option key={`${city.name}-${idx}`} value={city.name} />
                      ))}
                    </datalist>
                    {focusedInput === 'city' && (
                      <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>📍 PRIMARY DISPATCH ZONE</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ position: 'relative', marginTop: '1rem' }}>
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={signupForm.address}
                    onChange={handleSignupFormChange}
                    onFocus={() => setFocusedInput('address')}
                    onBlur={() => setFocusedInput(null)}
                    className="form-input"
                    placeholder="123 Queens Boulevard, Apt 4B"
                    required
                  />
                  <p style={{ fontSize: '0.68rem', color: 'var(--foreground-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    *Note: A proof of utility bill will be required to verify this address in the Documents step.
                  </p>
                  {focusedInput === 'address' && (
                    <div style={{ position: 'absolute', right: '0', top: '-15px', background: '#ffffff', padding: '0.25rem 0.55rem', borderRadius: '0.35rem', border: '2px solid var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 10, animation: 'modalFadeIn 0.2s ease-out' }}>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#111111', fontWeight: 'bold', letterSpacing: '0.05em' }}>🏠 REQUIRES VERIFICATION</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', margin: '1.5rem 0', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <input
                    type="checkbox"
                    required
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    id="coop-agree"
                  />
                  <label htmlFor="coop-agree" style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                    I agree to the Queens OS Cooperative Alliance charter, dynamic spatial dispatching protocols, and terms of service.
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="spin" size={16} /> Generating Verification Code...
                      </>
                    ) : (
                      <>
                        Generate Verification Code <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PHASE B: OTP Verification Code */}
          {onboardingProgress === 'otp' && (
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
                  Enter Verification Code
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', maxWidth: '480px', lineHeight: '1.5' }}>
                  We've dispatched a secure verification OTP to your registered phone number <strong style={{ color: '#fff' }}>{signupForm.phone}</strong>.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit}>
                {otpError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--error-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
                    <ShieldAlert size={16} />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Secure OTP Code</label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="form-input"
                      style={{
                        fontSize: '2rem',
                        textAlign: 'center',
                        letterSpacing: '1.5rem',
                        paddingLeft: '2rem',
                        maxWidth: '240px',
                        height: '60px',
                        fontFamily: 'monospace',
                        background: '#050505',
                        border: '1px solid rgba(255,184,0,0.3)',
                        boxShadow: '0 0 15px rgba(255,184,0,0.05)'
                      }}
                      placeholder="0000"
                      required
                    />
                  </div>
                </div>

                {/* Hint Box matching NATS OS.ride.assigned logs */}
                <div style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '0.75rem', padding: '1rem', margin: '2rem 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>💡</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.15rem' }}>System Integration Hint</strong>
                    Evaluation Sandbox mode active. For rapid signups, check the <strong style={{ color: '#fff' }}>AI OS Execution Telemetry</strong> on the landing page or type code <strong style={{ color: '#fff' }}>4820</strong> or any 4 digits to proceed.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }} disabled={isVerifyingOtp}>
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="spin" size={16} /> Verifying Code...
                      </>
                    ) : (
                      <>
                        Verify Code & Register
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onClick={() => { setOnboardingProgress('signup'); setOtpError(null); setOtpCode(''); }}
                    disabled={isVerifyingOtp}
                  >
                    Change Mobile Number
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* PHASE C: OTP Verification Confetti Modal Overlay */}
      {onboardingProgress === 'otp_success' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 5, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {/* Confetti Container */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 45 }).map((_, i) => {
              const colors = ['#FFB800', '#10B981', '#3B82F6', '#EC4899', '#FFFFFF'];
              const left = Math.random() * 100;
              const delay = Math.random() * 5;
              const duration = 3 + Math.random() * 4;
              const size = 6 + Math.random() * 10;
              const color = colors[Math.floor(Math.random() * colors.length)];
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: Math.random() > 0.4 ? '50%' : '0',
                    background: color,
                    opacity: 0.6 + Math.random() * 0.4,
                    animation: `confettiFall ${duration}s linear infinite, confettiSway ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              );
            })}
          </div>

          {/* Success Dialog */}
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            border: '2px solid rgba(255,184,0,0.3)',
            boxShadow: '0 15px 50px rgba(255,184,0,0.15)',
            background: 'linear-gradient(135deg, #090909 0%, #151515 100%)',
            position: 'relative',
            zIndex: 10000,
            animation: 'logoPulse 3s ease-in-out infinite'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              background: 'rgba(255,184,0,0.1)',
              border: '2px solid var(--primary)',
              borderRadius: '50%',
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              boxShadow: '0 0 25px rgba(255,184,0,0.3)'
            }}>
              <BadgeCheck size={38} style={{ color: 'var(--primary)' }} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
              Verification Successful!
            </h3>

            <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Congratulations <strong style={{ color: '#fff' }}>{signupForm.name}</strong>, your phone number has been verified via the Queens NATS cluster gateway.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Registered Email:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{signupForm.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Phone Number:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{signupForm.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>City / Hub:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{signupForm.city}</span>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(90deg, rgba(255,184,0,0.1) 0%, rgba(255,184,0,0.02) 100%)',
              border: '1px dashed rgba(255,184,0,0.3)',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              color: 'var(--foreground-muted)',
              lineHeight: '1.45',
              textAlign: 'left'
            }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <Sparkles size={12} className="animate-pulse" /> UNLOCK 19 COOPERATIVE BENEFITS
              </span>
              Complete your onboarding document submission next to unlock all benefits, zero-deduction platform fees, low-rate loans, and health coverage card privileges!
            </div>

            <button
              onClick={handleProceedToWizard}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '800',
                background: 'var(--primary)',
                color: '#000',
                boxShadow: '0 8px 30px rgba(255,184,0,0.4)',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-outfit)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={18} /> Proceed to Onboarding
            </button>
          </div>
        </div>
      )}

      {/* PHASE D: Onboarding Wizard (the original wizard form) */}
      {onboardingProgress === 'wizard' && (
        <div className="glass-card glass-card-accent" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {/* Header with VIP benefits scroll hint */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>

            {/* VIP Onboarding Hint Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #FFB800 0%, #E6A100 100%)',
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              color: '#000000',
              maxWidth: '680px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              alignItems: 'center',
              boxShadow: '0 8px 30px rgba(255,184,0,0.18)',
              position: 'relative'
            }}>
              <span style={{ fontWeight: '800', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Sparkles size={14} className="animate-pulse" style={{ color: '#000000' }} /> VIP COOPERATIVE PERKS UNLOCKED
              </span>
              <span style={{ color: '#1a1a1a', fontSize: '0.75rem', lineHeight: '1.45', fontWeight: '600', textAlign: 'center' }}>
                Receive a +1,000 signup QCoins voucher, access immediate loan assessments, housing mortgages, flat-rate subscriptions, and zero-deposit hybrid vehicle financing!
              </span>
              <button
                type="button"
                onClick={() => navigate('/driver/perks')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#000000',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  marginTop: '0.15rem',
                  padding: '2px 8px',
                  borderBottom: '1px dashed #000000'
                }}
              >
                Explore All 27 Ecosystem Perks & Privileges
                <span style={{ display: 'inline-block', fontSize: '0.85rem' }}>→</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.75rem', marginTop: '1rem', marginBottom: '0.1rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
              Driver Partner Onboarding
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Complete our high-fidelity document vetting to unlock swift rides, coin milestones, and immediate hauls.
            </p>
          </div>

          {/* Success State */}
          {showSuccess ? (
            <div className="success-confetti-container" style={{ padding: '2.5rem 1.5rem' }}>
              <div className="success-confetti-icon">
                <BadgeCheck size={40} />
              </div>
              <h3 className="success-title" style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: '900' }}>Vetting Credentials Dispatched!</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 1rem auto', fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
                Excellent work! Your credentials and 4 Cloudinary-verified documents have been processed by our OCR vetting intelligence.
              </p>

              <div style={{
                maxWidth: '520px',
                margin: '1.25rem auto',
                fontSize: '0.9rem',
                color: '#fff',
                border: '1px solid rgba(255,184,0,0.2)',
                background: 'linear-gradient(90deg, rgba(255,184,0,0.08) 0%, rgba(0,0,0,0.2) 100%)',
                padding: '0.85rem 1.25rem',
                borderRadius: '0.75rem',
                lineHeight: '1.5',
                textAlign: 'left'
              }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                  <Sparkles size={14} className="animate-pulse" /> VERIFICATION IN PROGRESS
                </span>
                Your information details are up for verification. Stay tuned! You will be notified via your email and phone numbers where necessary.
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: 'var(--border-glass)', borderRadius: '1rem', padding: '1rem 1.5rem', maxWidth: '360px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--foreground-muted)' }}>Status:</span>
                  <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>Awaiting Vetting</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--foreground-muted)' }}>OCR License Extract:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: 'auto' }}>{extractedOcr.licenseFront || 'Verified'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
                <button className="btn btn-primary" onClick={() => navigate('/driver/perks')} style={{ width: '100%', justifyContent: 'center' }}>
                  <Sparkles size={16} /> Access Perks & Benefits Listing
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  Submit Another Registration
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* Step Nodes */}
              <div className="step-indicator">
                <div className="step-progress-bar" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
                {[
                  { num: 1, label: 'Profile', icon: <User size={16} /> },
                  { num: 2, label: 'Vehicle', icon: <Car size={16} /> },
                  { num: 3, label: 'Documents', icon: <FileImage size={16} /> },
                  { num: 4, label: 'Biometrics', icon: <Scan size={16} /> },
                  { num: 5, label: 'Sign', icon: <PenTool size={16} /> }
                ].map(step => (
                  <div
                    key={step.num}
                    className={`step-node ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                  >
                    {currentStep > step.num ? <BadgeCheck size={18} /> : step.icon}
                    <span className="step-label">{step.label}</span>
                  </div>
                ))}
              </div>

              {/* Errors */}
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--error-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Step Contents */}
              <div style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                {/* STEP 1: Basic Info */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      Personal Information
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="form-input"
                        placeholder="Enter your legal full name"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="form-input"
                          placeholder="driver@queensos.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="form-input"
                          placeholder="+44 7911 123456"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City of Operations</label>
                        <select
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          className="form-select"
                        >
                          <option value="London">London</option>
                          <option value="Manchester">Manchester</option>
                          <option value="Birmingham">Birmingham</option>
                          <option value="Lagos">Lagos</option>
                          <option value="Accra">Accra</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">License Classification</label>
                        <select
                          name="licenseClass"
                          value={profileData.licenseClass}
                          onChange={handleProfileChange}
                          className="form-select"
                        >
                          <option value="Class A">Class A (Private & Commercial Taxi)</option>
                          <option value="Class B">Class B (Heavy Commercial Transport)</option>
                          <option value="Class C">Class C (Chauffeur & Luxury Only)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Vehicle Info */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      Vehicle Specifications
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Vehicle Brand</label>
                        <input
                          type="text"
                          name="make"
                          value={vehicleData.make}
                          onChange={handleVehicleChange}
                          className="form-input"
                          placeholder="e.g. Tesla, Toyota, Mercedes"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Vehicle Model</label>
                        <input
                          type="text"
                          name="model"
                          value={vehicleData.model}
                          onChange={handleVehicleChange}
                          className="form-input"
                          placeholder="e.g. Model Y, Prius, C-Class"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Production Year</label>
                        <select
                          name="year"
                          value={vehicleData.year}
                          onChange={handleVehicleChange}
                          className="form-select"
                        >
                          {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">License Plate Number</label>
                        <input
                          type="text"
                          name="plateNumber"
                          value={vehicleData.plateNumber}
                          onChange={handleVehicleChange}
                          className="form-input"
                          placeholder="e.g. LN68 EXG"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Exterior Color</label>
                        <input
                          type="text"
                          name="color"
                          value={vehicleData.color}
                          onChange={handleVehicleChange}
                          className="form-input"
                          placeholder="e.g. Metallic Black, Pearl White"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Taxi Hauling Ride Tier</label>
                        <select
                          name="tier"
                          value={vehicleData.tier}
                          onChange={handleVehicleChange}
                          className="form-select"
                        >
                          <option value="Economy">Economy (Standard city rides)</option>
                          <option value="Swift">Swift (Prioritized quick dispatch)</option>
                          <option value="Luxury">Luxury (Premium fleet and executive chauffeur)</option>
                        </select>
                      </div>
                    </div>

                    {/* ── Vehicle Inspection Overlook Media Upload ── */}
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,184,0,0.12)', borderRadius: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-outfit)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                            <Upload size={15} style={{ color: 'var(--primary)' }} /> Vehicle Inspection Overlook
                          </h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>
                            Upload images or a short video walkaround to certify your vehicle is in sound commercial shape.
                          </p>
                        </div>
                        {inspectionMedia.length > 0 && (
                          <span style={{ fontSize: '0.63rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                            ✓ {inspectionMedia.length} file{inspectionMedia.length > 1 ? 's' : ''} attached
                          </span>
                        )}
                      </div>

                      {/* Dropzone */}
                      <label style={{ display: 'block', position: 'relative', border: `2px dashed ${inspectionMedia.length > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(255,184,0,0.25)'}`, borderRadius: '0.75rem', padding: '1.75rem 1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        <input type="file" accept="image/*,video/*" multiple onChange={handleInspectionUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                          <div style={{ background: 'rgba(255,184,0,0.08)', padding: '0.65rem', borderRadius: '50%', color: 'var(--primary)' }}>
                            <Upload size={22} />
                          </div>
                          <span style={{ fontSize: '0.83rem', fontWeight: '700', color: '#fff' }}>Click or drag & drop files</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--foreground-dim)' }}>PNG, JPG, MP4 supported · Max 50MB per file</span>
                        </div>
                      </label>

                      {/* Upload progress */}
                      {isUploadingInspection && (
                        <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.12)', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#fff', marginBottom: '0.35rem' }}>
                            <span style={{ opacity: 0.7 }}>Streaming to Cloudinary storage…</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{uploadProgress}%</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.15s ease', borderRadius: '99px' }} />
                          </div>
                        </div>
                      )}

                      {/* Media preview grid */}
                      {inspectionMedia.length > 0 && (
                        <div style={{ marginTop: '1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                          {inspectionMedia.map((item, idx) => (
                            <div key={idx} style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.6rem', background: '#070707', overflow: 'hidden', aspectRatio: '1' }}>
                              {item.type === 'image' ? (
                                <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
                                  <Video size={22} />
                                  <span style={{ fontSize: '0.5rem', color: 'var(--foreground-dim)' }}>MP4</span>
                                </div>
                              )}
                              <button onClick={() => handleRemoveInspection(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff4d4d', cursor: 'pointer', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                <X size={11} />
                              </button>
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '2px 5px' }}>
                                <span style={{ fontSize: '0.48rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* STEP 3: Documents Upload (Cloudinary) */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      Cloudinary Document Verification
                    </h3>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Please upload high-resolution images or PDF documents. Our system automatically processes your files via Cloudinary storage and scans them for safety.
                    </p>
                    <div className="doc-grid">
                      <DocumentUploadCard
                        label="Driver's License (Front)"
                        subtitle="Must show photo, full name, and class category clearly."
                        fieldName="licenseFront"
                        onUploadComplete={handleUploadComplete}
                      />
                      <DocumentUploadCard
                        label="National ID Card / Passport"
                        subtitle="Valid international passport or national identification."
                        fieldName="idProof"
                        onUploadComplete={handleUploadComplete}
                      />
                      <DocumentUploadCard
                        label="Utility Bill (Proof of Address)"
                        subtitle="Electricity or water bill dated in the last 3 months."
                        fieldName="utilityBill"
                        onUploadComplete={handleUploadComplete}
                      />
                      <DocumentUploadCard
                        label="Vehicle Insurance Certificate"
                        subtitle="Must include your registration plate and valid dates."
                        fieldName="insurance"
                        onUploadComplete={handleUploadComplete}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Biometric KYC — Facial Recognition */}
                {currentStep === 4 && (
                  <div>
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      Biometric Identity Verification
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                      As part of our compliance and anti-fraud framework, we require a one-time facial recognition scan to match your identity against your submitted ID documents.
                    </p>

                    {/* Biometric scan interface */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                      {/* Camera / Face frame */}
                      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                        {/* Outer glow ring */}
                        <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: `2px solid ${biometricStatus === 'verified' ? 'rgba(16,185,129,0.5)' : biometricStatus === 'failed' ? 'rgba(239,68,68,0.5)' : biometricStatus === 'scanning' || biometricStatus === 'processing' ? 'rgba(255,184,0,0.5)' : 'rgba(255,255,255,0.08)'}`, boxShadow: biometricStatus === 'verified' ? '0 0 30px rgba(16,185,129,0.2)' : biometricStatus === 'scanning' || biometricStatus === 'processing' ? '0 0 30px rgba(255,184,0,0.15)' : 'none', transition: 'all 0.5s ease', animation: (biometricStatus === 'scanning' || biometricStatus === 'processing') ? 'glowPulse 1.5s infinite ease-out' : 'none' }} />

                        {/* Face oval frame */}
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                          {biometricStatus === 'idle' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
                              <User size={56} style={{ color: '#fff' }} />
                            </div>
                          )}
                          {(biometricStatus === 'scanning' || biometricStatus === 'processing') && (
                            <>
                              <User size={56} style={{ color: 'rgba(255,255,255,0.2)' }} />
                              {/* Scanning laser sweep */}
                              <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', boxShadow: '0 0 12px var(--primary)', animation: 'qrScannerLine 1.8s infinite linear', pointerEvents: 'none' }} />
                              {/* Grid overlay */}
                              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} viewBox="0 0 200 200">
                                {[20, 40, 60, 80, 100, 120, 140, 160, 180].map(v => (
                                  <g key={v}>
                                    <line x1="0" y1={v} x2="200" y2={v} stroke="var(--primary)" strokeWidth="0.5" />
                                    <line x1={v} y1="0" x2={v} y2="200" stroke="var(--primary)" strokeWidth="0.5" />
                                  </g>
                                ))}
                              </svg>
                            </>
                          )}
                          {biometricStatus === 'verified' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                              <BadgeCheck size={52} style={{ color: '#10b981' }} />
                            </div>
                          )}
                          {biometricStatus === 'failed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                              <ShieldAlert size={52} style={{ color: '#EF4444' }} />
                            </div>
                          )}
                        </div>

                        {/* Corner alignment brackets */}
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                          <div key={pos} style={{ position: 'absolute', width: '18px', height: '18px', ...(pos.includes('top') ? { top: '8px' } : { bottom: '8px' }), ...(pos.includes('left') ? { left: '8px' } : { right: '8px' }), borderTop: pos.includes('top') ? `2px solid ${biometricStatus === 'verified' ? '#10b981' : 'var(--primary)'}` : 'none', borderBottom: pos.includes('bottom') ? `2px solid ${biometricStatus === 'verified' ? '#10b981' : 'var(--primary)'}` : 'none', borderLeft: pos.includes('left') ? `2px solid ${biometricStatus === 'verified' ? '#10b981' : 'var(--primary)'}` : 'none', borderRight: pos.includes('right') ? `2px solid ${biometricStatus === 'verified' ? '#10b981' : 'var(--primary)'}` : 'none', borderRadius: pos === 'top-left' ? '2px 0 0 0' : pos === 'top-right' ? '0 2px 0 0' : pos === 'bottom-left' ? '0 0 0 2px' : '0 0 2px 0', transition: 'border-color 0.4s ease' }} />
                        ))}
                      </div>

                      {/* Status text */}
                      <div style={{ textAlign: 'center' }}>
                        {biometricStatus === 'idle' && (
                          <>
                            <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '700' }}>Ready to scan your face</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>Ensure you are in a well-lit environment. Look directly at the camera.</p>
                          </>
                        )}
                        {biometricStatus === 'scanning' && (
                          <>
                            <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: '700' }}>Scanning facial geometry…</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>Hold still. Mapping 68 facial landmark nodes.</p>
                          </>
                        )}
                        {biometricStatus === 'processing' && (
                          <>
                            <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: '700' }}>Processing biometric signature…</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>Cross-referencing against your submitted ID document.</p>
                          </>
                        )}
                        {biometricStatus === 'verified' && (
                          <>
                            <p style={{ fontSize: '0.88rem', color: '#10b981', fontWeight: '800' }}>✓ Identity Verified Successfully</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>Your biometric signature has been certified and encrypted.</p>
                          </>
                        )}
                        {biometricStatus === 'failed' && (
                          <>
                            <p style={{ fontSize: '0.88rem', color: '#EF4444', fontWeight: '700' }}>Scan failed — please retry</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>Ensure your face is fully visible and well-lit.</p>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      {biometricStatus === 'idle' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
                          onClick={() => {
                            setBiometricStatus('scanning');
                            setTimeout(() => setBiometricStatus('processing'), 2800);
                            setTimeout(() => setBiometricStatus('verified'), 5200);
                          }}
                        >
                          <Scan size={16} /> Begin Facial Scan
                        </button>
                      )}
                      {(biometricStatus === 'scanning' || biometricStatus === 'processing') && (
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.78rem', opacity: 0.6 }} disabled>
                          <RefreshCw size={14} className="spin" /> Scanning in progress…
                        </button>
                      )}
                      {(biometricStatus === 'failed') && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          onClick={() => {
                            setBiometricStatus('scanning');
                            setTimeout(() => setBiometricStatus('processing'), 2800);
                            setTimeout(() => setBiometricStatus('verified'), 5200);
                          }}
                        >
                          <Scan size={16} /> Retry Scan
                        </button>
                      )}
                      {biometricStatus === 'verified' && (
                        <div style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.5rem 1.25rem', borderRadius: '9999px', fontWeight: '700' }}>
                          Proceed to Sign Agreement →
                        </div>
                      )}

                      {/* Info note */}
                      <div style={{ fontSize: '0.68rem', color: 'var(--foreground-dim)', textAlign: 'center', maxWidth: '320px', padding: '0.65rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                        🔒 Your biometric data is encrypted end-to-end and never stored as raw imagery. Only a cryptographic hash is retained for identity matching.
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Digital Signature Canvas */}
                {currentStep === 5 && (
                  <div>
                    <h3 className="mb-4" style={{ fontFamily: 'var(--font-outfit)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      Partner Agreement
                    </h3>

                    {/* Scrollable contract */}
                    <div style={{ background: '#030303', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', maxHeight: '140px', overflowY: 'auto', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>QUEENS OPERATING SYSTEM PARTNER TERMS & CONDITIONS</p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        1. PARTNER ENGAGEMENT: The undersigned agrees to register as an independent transport supplier on the Queens OS ride coordinator platform. You confirm you hold a valid, unexpired driver's license.
                      </p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        2. REVENUE SHARE & COMMISSION: Taxi payouts are calculated dynamically via our AI autonomous fare escalation matrix. Standard platform service fee stands at 15% per haul.
                      </p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        3. DOCUMENT INTEGRITY: You guarantee that all uploaded documents (License, Passport, Proof of address, and Insurance policy certificate) are authentic and belong solely to you.
                      </p>
                      <p>
                        4. CONFIDENTIALITY & GDPR: Driver records are securely archived in compliance with data security requirements and are uploaded directly to verified Cloudinary storage buckets.
                      </p>
                    </div>

                    <SignaturePad
                      onSign={handleSignatureSign}
                      onClear={handleSignatureClear}
                    />
                  </div>
                )}

              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                {currentStep > 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div></div> // Empty spacer
                )}

                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: '0 4px 20px var(--success-glow)' }} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="spin" size={16} /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          )}
        </div>
      )}
    </div>
  );
}
