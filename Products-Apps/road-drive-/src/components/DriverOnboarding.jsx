import { useState, useRef, useMemo } from 'react';
import { FaCar, FaUser, FaIdCard, FaFileUpload, FaCheck, FaCheckCircle, FaArrowRight, FaArrowLeft, FaCamera, FaTruck, FaBusinessTime, FaMotorcycle, FaCube, FaStar, FaMapMarkerAlt, FaMoneyBillWave, FaCloudUploadAlt, FaTrash, FaExchangeAlt, FaShieldAlt, FaPhone, FaGlobeAfrica, FaCalendarAlt, FaVenusMars, FaUserPlus, FaImage, FaCheckDouble } from 'react-icons/fa';

const VEHICLE_MAKES = ['Toyota', 'Honda', 'Hyundai', 'Nissan', 'Mercedes-Benz', 'Lexus', 'BMW', 'Mazda', 'Kia', 'Volkswagen', 'Suzuki', 'Mitsubishi', 'Ford', 'Peugeot'];

const VEHICLE_YEARS = Array.from({ length: 26 }, (_, i) => 2026 - i);

const LAGOS_LOCATIONS = ['Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Oshodi', 'Ajah', 'Maryland', 'GRA', 'Ikoyi', 'Apapa', 'Alimosho', 'Ketu', 'Egbeda', 'Ikorodu'];

const STORAGE_KEY = 'qos_driver_onboarding';

const CATEGORIES = [
  { id: 'individual-driver', title: 'Individual driver', description: 'I have my own car and drive independently.', icon: FaCar },
  { id: 'corporate-driver', title: 'Corporate driver', description: 'I work for a car company, fleet, or transport partner.', icon: FaBusinessTime },
  { id: 'dispatch-rider-personal', title: 'Dispatch rider', description: 'I ride personally for pickup, courier, and delivery work.', icon: FaMotorcycle },
  { id: 'corporate-dispatch-rider', title: 'Corporate dispatch rider', description: 'I ride for a logistics company, fleet, or dispatch partner.', icon: FaCube },
  { id: 'novice-starter', title: 'Novice / Starter', description: 'I do not have a car yet and I am just getting started.', icon: FaStar },
];

const COUNTRIES = [
  { name: 'Nigeria', code: 'NG', flag: '\u{1F1F3}\u{1F1EC}', callingCode: '+234' },
  { name: 'Ghana', code: 'GH', flag: '\u{1F1EC}\u{1F1ED}', callingCode: '+233' },
  { name: 'Kenya', code: 'KE', flag: '\u{1F1F0}\u{1F1EA}', callingCode: '+254' },
  { name: 'South Africa', code: 'ZA', flag: '\u{1F1FF}\u{1F1E6}', callingCode: '+27' },
  { name: 'United States', code: 'US', flag: '\u{1F1FA}\u{1F1F8}', callingCode: '+1' },
  { name: 'United Kingdom', code: 'GB', flag: '\u{1F1EC}\u{1F1E7}', callingCode: '+44' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch { return null; }
}

function saveDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function completeOnboarding() {
  const data = loadDraft();
  localStorage.setItem('qos_driver_onboarded', 'true');
  localStorage.removeItem(STORAGE_KEY);
  return data;
}

export function isDriverOnboarded() {
  try {
    return localStorage.getItem('qos_driver_onboarded') === 'true';
  } catch {
    return false;
  }
}

export function getDriverProfile() {
  try {
    return JSON.parse(localStorage.getItem('qos_driver_profile'));
  } catch { return null; }
}

export default function DriverOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(() => loadDraft()?.category || '');
  const [firstName, setFirstName] = useState(() => loadDraft()?.firstName || '');
  const [lastName, setLastName] = useState(() => loadDraft()?.lastName || '');
  const [dob, setDob] = useState(() => loadDraft()?.dob || '');
  const [gender, setGender] = useState(() => loadDraft()?.gender || '');
  const [country, setCountry] = useState(() => loadDraft()?.country || COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState(() => loadDraft()?.phoneNumber || '');
  const [avatar, setAvatar] = useState(() => loadDraft()?.avatar || null);
  const [username, setUsername] = useState(() => loadDraft()?.username || '');
  const [vehicle, setVehicle] = useState(() => loadDraft()?.vehicle || { make: '', model: '', year: '', color: '', plate: '' });
  const [docs, setDocs] = useState(() => loadDraft()?.docs || { license: false, registration: false, insurance: false, nin: false });
  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingDocKey, setPendingDocKey] = useState(null);
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  const save = () => saveDraft({ category, firstName, lastName, dob, gender, country, phoneNumber, avatar, username, vehicle, docs });

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => `${c.name} ${c.code} ${c.callingCode}`.toLowerCase().includes(q));
  }, [countryQuery]);

  const canProceedCategory = !!category;
  const canProceedPersonal = firstName.trim() && lastName.trim();
  const canProceedContact = phoneNumber.trim().length >= 7 && !!country;
  const canProceedVehicle = vehicle.make && vehicle.model.trim() && vehicle.year && vehicle.color.trim() && vehicle.plate.trim().length >= 4;
  const canProceedDocs = docs.license && docs.registration && docs.insurance;

  const validateStep = () => {
    if (step === 0) return true;
    if (step === 1 && !canProceedCategory) { setErrors({ general: 'Please select a category' }); return false; }
    if (step === 2 && !canProceedPersonal) { setErrors({ general: 'First name and last name are required' }); return false; }
    if (step === 3 && !canProceedContact) { setErrors({ general: 'Please enter a valid phone number' }); return false; }
    if (step === 4 && !canProceedVehicle) { setErrors({ general: 'Please fill in all vehicle details' }); return false; }
    if (step === 5 && !canProceedDocs) { setErrors({ general: 'Please upload all required documents' }); return false; }
    return true;
  };

  const handleNext = () => {
    setErrors({});
    if (!validateStep()) return;
    save();
    if (step < totalSteps - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    if (step > 0) setStep(s => s - 1);
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerDocUpload = (docKey, label) => {
    setPendingDocKey(docKey);
    setUploading(label);
    setErrors({});
    docFileInputRef.current?.click();
  };

  const onDocFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && pendingDocKey) {
      setDocs(prev => ({ ...prev, [pendingDocKey]: true }));
    }
    setUploading(null);
    setPendingDocKey(null);
    if (e.target) e.target.value = '';
  };

  const handleSubmit = () => {
    if (!agreed) { setErrors({ agree: 'You must accept the terms' }); return; }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      const profile = completeOnboarding();
      localStorage.setItem('qos_driver_profile', JSON.stringify({
        category, firstName, lastName, dob, gender,
        country: country.name, phone: `${country.callingCode}${phoneNumber}`, avatar, username,
        ...vehicle, joinedAt: new Date().toISOString(),
      }));
      setSubmitting(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="dobo-screen">
        <div className="dobo-content">
          <div className="dobo-success">
            <div className="dobo-success-icon-wrap">
              <FaCheck size={48} />
            </div>
            <h2 className="dobo-success-title">Application submitted!</h2>
            <p className="dobo-success-text">Your driver account is under review. You will be notified once verified.</p>
            <div className="dobo-success-steps">
              <div className="dobo-success-step"><span className="dobo-success-dot active" /> Profile setup</div>
              <div className="dobo-success-step"><span className="dobo-success-dot active" /> Onboarding details</div>
              <div className="dobo-success-step"><span className="dobo-success-dot" /> Verification review</div>
            </div>
            <button onClick={onComplete} className="dobo-btn-primary" style={{ marginTop: '24px', width: '100%' }}>
              <FaArrowRight /> Go to driver portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderCategory();
      case 2: return renderPersonalInfo();
      case 3: return renderContactPhoto();
      case 4: return renderVehicle();
      case 5: return renderDocuments();
      case 6: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="dobo-screen">
      <div className="dobo-progress-bar">
        <div className="dobo-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="dobo-content">
        {renderStep()}
      </div>
    </div>
  );

  function renderWelcome() {
    return (
      <div className="dobo-welcome">
        <div className="dobo-welcome-art">
          <div className="dobo-welcome-overlay" />
        </div>
        <div className="dobo-welcome-body">
          <div className="dobo-welcome-logo">
            <FaCar size={28} />
            <span>QUEENS OS</span>
          </div>
          <h1 className="dobo-welcome-title">Stay ready for every ride, delivery, and driver update.</h1>
          <div className="dobo-welcome-pills">
            <span className="dobo-pill">Rides</span>
            <span className="dobo-pill">Courier</span>
            <span className="dobo-pill">Earnings</span>
          </div>
          <div className="dobo-welcome-benefits">
            <div className="dobo-benefit"><FaMoneyBillWave /> ~85% per fare</div>
            <div className="dobo-benefit"><FaMapMarkerAlt /> Lagos metro</div>
            <div className="dobo-benefit"><FaStar /> Fast payouts</div>
          </div>
          <button onClick={handleNext} className="dobo-btn-primary">
            Create driver account <FaArrowRight />
          </button>
          <p className="dobo-welcome-terms">
            By signing up you agree to our <span className="dobo-link">terms and conditions</span> and <span className="dobo-link">privacy policy</span>.
          </p>
        </div>
      </div>
    );
  }

  function renderCategory() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 1 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Set up account</h2>
          <p className="dobo-step-subtitle">By signing up you agree to our terms and privacy policy.</p>
        </div>
        <p className="dobo-question">What category describes you?</p>
        <div className="dobo-category-list">
          {CATEGORIES.map(cat => {
            const selected = category === cat.id;
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setErrors({}); }}
                className={`dobo-category-option ${selected ? 'selected' : ''}`}>
                <div className={`dobo-category-icon ${selected ? 'selected' : ''}`}><Icon /></div>
                <div className="dobo-category-text">
                  <div className="dobo-category-title">{cat.title}</div>
                  <div className="dobo-category-desc">{cat.description}</div>
                </div>
                <div className={`dobo-category-radio ${selected ? 'selected' : ''}`}>
                  {selected && <div className="dobo-category-dot" />}
                </div>
              </button>
            );
          })}
        </div>
        {errors.general && <div className="dobo-error">{errors.general}</div>}
        <div className="dobo-actions">
          <button onClick={handleBack} className="dobo-btn-secondary">Back</button>
          <button onClick={handleNext} className="dobo-btn-primary" disabled={!canProceedCategory}>Continue</button>
        </div>
      </div>
    );
  }

  function renderPersonalInfo() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 2 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Set up your profile</h2>
          <p className="dobo-step-subtitle">Add the basics riders and partners will see on your profile.</p>
        </div>
        <div className="dobo-progress-card">
          <span className="dobo-step-badge">Step 1 of 2</span>
          <h3 className="dobo-progress-title">Personal details</h3>
          <p className="dobo-progress-desc">Use the same name that appears on your driver documents.</p>
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">First Name <span className="dobo-required">*</span></label>
          <input type="text" className="dobo-input" placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Last Name <span className="dobo-required">*</span></label>
          <input type="text" className="dobo-input" placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Date of Birth <span className="dobo-optional">(Optional)</span></label>
          <div className="dobo-input-with-icon">
            <input 
              type="date" 
              className="dobo-input" 
              value={dob} 
              onChange={e => setDob(e.target.value)} 
              max={new Date().toISOString().split('T')[0]}
            />
            <FaCalendarAlt className="dobo-input-icon" />
          </div>
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Gender <span className="dobo-optional">(Optional)</span></label>
          <button className={`dobo-select ${gender ? 'filled' : ''}`} onClick={() => setShowGenderSelect(v => !v)}>
            <span>{gender || 'Select gender'}</span>
            <FaVenusMars />
          </button>
          {showGenderSelect && (
            <div className="dobo-dropdown">
              {GENDER_OPTIONS.map(g => (
                <button key={g} className={`dobo-dropdown-item ${gender === g ? 'selected' : ''}`} onClick={() => { setGender(g); setShowGenderSelect(false); }}>{g}</button>
              ))}
            </div>
          )}
        </div>
        {errors.general && <div className="dobo-error">{errors.general}</div>}
        <div className="dobo-actions">
          <button onClick={handleBack} className="dobo-btn-secondary">Back</button>
          <button onClick={handleNext} className="dobo-btn-primary" disabled={!canProceedPersonal}>Continue</button>
        </div>
      </div>
    );
  }

  function renderContactPhoto() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 3 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Location & identity</h2>
          <p className="dobo-step-subtitle">Add your country, phone, and profile photo.</p>
        </div>
        <div className="dobo-progress-card">
          <span className="dobo-step-badge">Step 2 of 2</span>
          <h3 className="dobo-progress-title">Public profile</h3>
          <p className="dobo-progress-desc">A clear photo and simple username help people recognize you quickly.</p>
        </div>

        <div className="dobo-avatar-section">
          <div className="dobo-avatar-wrap" onClick={handleAvatarUpload}>
            <div className="dobo-avatar">
              {avatar ? <img src={avatar} alt="avatar" className="dobo-avatar-img" /> : <FaCamera size={40} />}
            </div>
            <div className="dobo-avatar-badge"><FaCamera size={18} /></div>
          </div>
          <p className="dobo-avatar-label">Profile picture</p>
          <p className="dobo-avatar-hint">Take a fresh selfie or upload an existing photo.</p>
          <div className="dobo-avatar-actions">
            <button className="dobo-photo-btn" onClick={handleAvatarUpload}><FaCamera /> Selfie</button>
            <button className="dobo-photo-btn" onClick={handleAvatarUpload}><FaImage /> Upload</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileSelect} />
        </div>

        <div className="dobo-field-group">
          <label className="dobo-label">Country <span className="dobo-required">*</span></label>
          <button className="dobo-select" onClick={() => setShowCountrySelect(v => !v)}>
            <span className="dobo-country-flag">{country.flag}</span>
            <span>{country.name}</span>
            <span className="dobo-country-code">{country.code}</span>
          </button>
          {showCountrySelect && (
            <div className="dobo-dropdown dobo-dropdown-country">
              <div className="dobo-search-input-wrap">
                <input type="text" className="dobo-search-input" placeholder="Search country" value={countryQuery} onChange={e => setCountryQuery(e.target.value)} autoFocus />
              </div>
              {filteredCountries.map(c => (
                <button key={c.code} className={`dobo-dropdown-item ${country.code === c.code ? 'selected' : ''}`} onClick={() => { setCountry(c); setShowCountrySelect(false); setCountryQuery(''); }}>
                  <span className="dobo-country-flag">{c.flag}</span>
                  <span className="dobo-country-name">{c.name}</span>
                  <span className="dobo-country-code">{c.code} &middot; {c.callingCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dobo-field-group">
          <label className="dobo-label">Phone number <span className="dobo-required">*</span></label>
          <div className="dobo-phone-row">
            <button className="dobo-phone-code" onClick={() => setShowCountrySelect(v => !v)}>
              <span className="dobo-country-flag">{country.flag}</span>
              <span>{country.callingCode}</span>
            </button>
            <input type="tel" className="dobo-input dobo-phone-input" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        <div className="dobo-field-group">
          <label className="dobo-label">Username <span className="dobo-optional">(Optional)</span></label>
          <div className="dobo-username-row">
            <span className="dobo-username-prefix">@</span>
            <input type="text" className="dobo-input" placeholder="yourusername" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
        </div>

        <div className="dobo-hint-box">
          <FaShieldAlt />
          <span>Your country and phone code help us format your profile and contact details correctly.</span>
        </div>

        {errors.general && <div className="dobo-error">{errors.general}</div>}
        <div className="dobo-actions">
          <button onClick={handleBack} className="dobo-btn-secondary">Back</button>
          <button onClick={handleNext} className="dobo-btn-primary" disabled={!canProceedContact}>Continue</button>
        </div>
      </div>
    );
  }

  function renderVehicle() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 4 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Vehicle details</h2>
          <p className="dobo-step-subtitle">The car you will be driving with.</p>
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Make <span className="dobo-required">*</span></label>
          <input 
            type="text" 
            className="dobo-input" 
            placeholder="e.g. Toyota, Honda" 
            value={vehicle.make} 
            onChange={e => setVehicle({ ...vehicle, make: e.target.value })} 
          />
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Model <span className="dobo-required">*</span></label>
          <input type="text" className="dobo-input" placeholder="e.g. Camry" value={vehicle.model} onChange={e => setVehicle({ ...vehicle, model: e.target.value })} />
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Year <span className="dobo-required">*</span></label>
          <select className="dobo-input" value={vehicle.year} onChange={e => setVehicle({ ...vehicle, year: e.target.value })}>
            <option value="">Select year</option>
            {VEHICLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">Colour <span className="dobo-required">*</span></label>
          <input type="text" className="dobo-input" placeholder="e.g. White, Black, Silver" value={vehicle.color} onChange={e => setVehicle({ ...vehicle, color: e.target.value })} />
        </div>
        <div className="dobo-field-group">
          <label className="dobo-label">License plate <span className="dobo-required">*</span></label>
          <input type="text" className="dobo-input" placeholder="e.g. ABC 123 XY" value={vehicle.plate} onChange={e => setVehicle({ ...vehicle, plate: e.target.value })} />
        </div>
        {errors.general && <div className="dobo-error">{errors.general}</div>}
        <div className="dobo-actions">
          <button onClick={handleBack} className="dobo-btn-secondary">Back</button>
          <button onClick={handleNext} className="dobo-btn-primary" disabled={!canProceedVehicle}>Continue</button>
        </div>
      </div>
    );
  }

  function renderDocuments() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 5 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Upload credentials</h2>
          <p className="dobo-step-subtitle">Upload your documents for verification.</p>
        </div>
        <div className="dobo-doc-list">
          <DocUploadRow label="Driver's license" uploaded={docs.license} uploading={uploading} onUpload={() => triggerDocUpload('license', "Driver's license")} />
          <DocUploadRow label="Vehicle registration" uploaded={docs.registration} uploading={uploading} onUpload={() => triggerDocUpload('registration', 'Vehicle registration')} />
          <DocUploadRow label="Insurance certificate" uploaded={docs.insurance} uploading={uploading} onUpload={() => triggerDocUpload('insurance', 'Insurance certificate')} />
          <DocUploadRow label="NIN / Social Sec (Optional)" uploaded={docs.nin} uploading={uploading} onUpload={() => triggerDocUpload('nin', 'NIN')} optional />
        </div>
        <input ref={docFileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={onDocFileSelect} />
        {errors.general && <div className="dobo-error">{errors.general}</div>}
        <div className="dobo-actions">
          <button onClick={handleBack} className="dobo-btn-secondary">Back</button>
          <button onClick={handleNext} className="dobo-btn-primary" disabled={!canProceedDocs}>Continue</button>
        </div>
      </div>
    );
  }

  function renderReview() {
    return (
      <div className="dobo-step">
        <div className="dobo-step-header">
          <span className="dobo-step-badge">Step 6 of {totalSteps - 1}</span>
          <h2 className="dobo-step-title">Review & submit</h2>
          <p className="dobo-step-subtitle">Check your details before submitting.</p>
        </div>
        <div className="dobo-review-sections">
          <div className="dobo-review-section">
            <div className="dobo-review-section-title">Account</div>
            <div className="dobo-review-row"><span>Category</span><span>{CATEGORIES.find(c => c.id === category)?.title}</span></div>
          </div>
          <div className="dobo-review-section">
            <div className="dobo-review-section-title">Personal</div>
            <div className="dobo-review-row"><span>Name</span><span>{firstName} {lastName}</span></div>
            {dob && <div className="dobo-review-row"><span>DOB</span><span>{dob}</span></div>}
            {gender && <div className="dobo-review-row"><span>Gender</span><span>{gender}</span></div>}
          </div>
          <div className="dobo-review-section">
            <div className="dobo-review-section-title">Contact</div>
            <div className="dobo-review-row"><span>Country</span><span>{country.flag} {country.name}</span></div>
            <div className="dobo-review-row"><span>Phone</span><span>{country.callingCode} {phoneNumber}</span></div>
            {username && <div className="dobo-review-row"><span>Username</span><span>@{username}</span></div>}
          </div>
          <div className="dobo-review-section">
            <div className="dobo-review-section-title">Vehicle</div>
            <div className="dobo-review-row"><span>Make</span><span>{vehicle.make}</span></div>
            <div className="dobo-review-row"><span>Model</span><span>{vehicle.model}</span></div>
            <div className="dobo-review-row"><span>Year</span><span>{vehicle.year}</span></div>
            <div className="dobo-review-row"><span>Colour</span><span>{vehicle.color}</span></div>
            <div className="dobo-review-row"><span>Plate</span><span>{vehicle.plate}</span></div>
          </div>
          <div className="dobo-review-section">
            <div className="dobo-review-section-title">Documents</div>
            <div className="dobo-review-row"><span>License</span><span className={docs.license ? 'text-green' : 'text-red'}>{docs.license ? 'Uploaded' : 'Missing'}</span></div>
            <div className="dobo-review-row"><span>Registration</span><span className={docs.registration ? 'text-green' : 'text-red'}>{docs.registration ? 'Uploaded' : 'Missing'}</span></div>
            <div className="dobo-review-row"><span>Insurance</span><span className={docs.insurance ? 'text-green' : 'text-red'}>{docs.insurance ? 'Uploaded' : 'Missing'}</span></div>
          </div>
        </div>

        <label className="dobo-agree">
          <input type="checkbox" checked={agreed} onChange={() => { setAgreed(!agreed); setErrors({}); }} />
          <span>I confirm that all the information provided is accurate and I agree to the Queens OS Driver Terms of Service and Privacy Policy.</span>
        </label>
        {errors.agree && <div className="dobo-error">{errors.agree}</div>}

        <div className="dobo-actions" style={{ flexDirection: 'column' }}>
          <button onClick={handleSubmit} disabled={submitting} className="dobo-btn-primary dobo-btn-lg" style={{ width: '100%', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting application...' : 'Submit application'}
          </button>
          <button onClick={handleBack} className="dobo-btn-secondary" style={{ width: '100%' }}>Edit details</button>
        </div>
      </div>
    );
  }
}

function DocUploadRow({ label, uploaded, uploading, onUpload, optional }) {
  const isUploading = uploading === label;
  return (
    <div className={`dobo-doc-row ${uploaded ? 'uploaded' : ''}`}>
      <div className="dobo-doc-info">
        <div className={`dobo-doc-icon ${uploaded ? 'done' : ''}`}>
          {uploaded ? <FaCheck /> : <FaCloudUploadAlt />}
        </div>
        <div>
          <div className="dobo-doc-label">{label}</div>
          {optional && <div className="dobo-doc-optional">Optional</div>}
        </div>
      </div>
      <div className="dobo-doc-action">
        {uploaded ? (
          <span className="dobo-doc-uploaded">Uploaded</span>
        ) : (
          <button onClick={onUpload} disabled={!!isUploading} className={`dobo-upload-btn ${isUploading ? 'loading' : ''}`}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
    </div>
  );
}
