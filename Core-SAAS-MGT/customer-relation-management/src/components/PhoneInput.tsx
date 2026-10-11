import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Phone as PhoneIcon } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Comprehensive list of countries with dial codes
// Source: International country phone codes
const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, placeholder = '+2348012345678', disabled = false }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Nigeria
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect user's country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try multiple free geolocation services for better reliability
        let countryCode: string | null = null;

        try {
          // Method 1: ip-api.com (free, no key required)
          const geoResponse = await fetch('https://ipapi.co/json/', { 
            signal: AbortSignal.timeout(3000)
          });
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            countryCode = geoData.country_code;
          }
        } catch (e) {
          // Fallback to second service
          try {
            // Method 2: geojs.io (alternative free service)
            const fallbackResponse = await fetch('https://get.geojs.io/v1/ip/country.json', {
              signal: AbortSignal.timeout(3000)
            });
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              countryCode = fallbackData.country;
            }
          } catch (e2) {
            // Both services failed, stick with default
          }
        }

        if (countryCode) {
          const detectedCountry = COUNTRIES.find(c => c.code === countryCode);
          if (detectedCountry) {
            setSelectedCountry(detectedCountry);
          }
        }
      } catch (error) {
        // Silently fail - keep default country
      } finally {
        setIsLoadingGeo(false);
      }
    };

    detectCountry();
  }, []);

  // Extract phone number without country code
  const phoneWithoutCode = value.replace(selectedCountry.dialCode, '').replace(/^\+/, '');

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle country selection
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    // Update phone value with new country code if it has a value
    if (phoneWithoutCode) {
      onChange(`${country.dialCode}${phoneWithoutCode}`);
    } else {
      onChange(country.dialCode);
    }
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/\D/g, ''); // Only allow digits
    onChange(`${selectedCountry.dialCode}${newPhone}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <PhoneIcon size={13} style={{ color: 'var(--foreground-muted)' }} /> Phone Number
      </label>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
        {/* Country Dropdown */}
        <div
          ref={dropdownRef}
          style={{
            position: 'relative',
            minWidth: '120px',
            flex: '0 0 auto',
          }}
        >
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled || isLoadingGeo}
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.85rem',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              cursor: disabled || isLoadingGeo ? 'not-allowed' : 'pointer',
              opacity: disabled || isLoadingGeo ? 0.5 : 1,
              transition: 'all 0.2s ease',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
            onMouseEnter={(e) => !disabled && !isLoadingGeo && (e.currentTarget.style.borderColor = 'rgba(255,184,0,0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            <span style={{ fontSize: '1.25rem' }}>{selectedCountry.flag}</span>
            <span>{isLoadingGeo ? '...' : selectedCountry.dialCode}</span>
            <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid rgba(255,184,0,0.2)',
                borderRadius: '0.85rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                maxHeight: '300px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '280px',
              }}
            >
              {/* Search Input */}
              <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.6rem', padding: '0.5rem 0.75rem' }}>
                  <Search size={14} style={{ color: 'var(--foreground-muted)' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Countries List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={`${country.code}-${country.dialCode}`}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        background: selectedCountry.code === country.code ? 'rgba(255,184,0,0.1)' : 'transparent',
                        border: 'none',
                        borderLeft: selectedCountry.code === country.code ? '3px solid rgba(255,184,0,0.5)' : '3px solid transparent',
                        color: selectedCountry.code === country.code ? 'var(--primary)' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCountry.code !== country.code) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCountry.code !== country.code) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{country.flag}</span>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{country.name}</span>
                        <span style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>{country.dialCode}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input Field */}
        <input
          type="tel"
          value={phoneWithoutCode}
          onChange={handlePhoneChange}
          placeholder={placeholder.replace(selectedCountry.dialCode, '').replace(/^\+/, '')}
          disabled={disabled}
          className="form-input"
          style={{
            flex: 1,
            padding: '0.75rem 0.85rem',
            fontSize: '0.95rem',
            opacity: disabled ? 0.5 : 1,
          }}
          maxLength={20}
          required
        />
      </div>

      {/* Display full phone number */}
      <p style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', marginTop: '0.5rem', wordBreak: 'break-all' }}>
        Full: {value || '(Phone number will appear here)'}
      </p>
    </div>
  );
}
