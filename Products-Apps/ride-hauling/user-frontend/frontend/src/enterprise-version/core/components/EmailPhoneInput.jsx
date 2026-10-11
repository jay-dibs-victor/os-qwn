import { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const COUNTRIES = [
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Ghana', code: 'GH', dial: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬' },
  { name: 'Morocco', code: 'MA', dial: '+212', flag: '🇲🇦' },
  { name: 'Ethiopia', code: 'ET', dial: '+251', flag: '🇪🇹' },
  { name: 'Tanzania', code: 'TZ', dial: '+255', flag: '🇹🇿' },
  { name: 'Uganda', code: 'UG', dial: '+256', flag: '🇺🇬' },
  { name: 'Rwanda', code: 'RW', dial: '+250', flag: '🇷🇼' },
  { name: 'Cameroon', code: 'CM', dial: '+237', flag: '🇨🇲' },
  { name: "Côte d'Ivoire", code: 'CI', dial: '+225', flag: '🇨🇮' },
  { name: 'Senegal', code: 'SN', dial: '+221', flag: '🇸🇳' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'UAE', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
];

function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map = {
      'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Nairobi': 'KE',
      'Africa/Johannesburg': 'ZA', 'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
      'Africa/Addis_Ababa': 'ET', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG',
      'Africa/Kigali': 'RW', 'Africa/Douala': 'CM', 'Africa/Abidjan': 'CI',
      'Africa/Dakar': 'SN', 'Europe/London': 'GB', 'America/New_York': 'US',
      'America/Toronto': 'CA', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR',
      'Asia/Kolkata': 'IN', 'Asia/Shanghai': 'CN', 'Asia/Dubai': 'AE',
      'Asia/Riyadh': 'SA', 'Australia/Sydney': 'AU', 'America/Sao_Paulo': 'BR',
    };
    const code = map[tz];
    if (code) return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
  } catch { }
  return COUNTRIES[0];
}

function detectMode(text) {
  if (text.length === 0) return 'email';
  if (text.includes('@')) return 'email';
  if (/^[+\d]/.test(text)) return 'phone';
  return null;
}

export default function EmailPhoneInput({ label, value, onChange, onSubmit }) {
  const [mode, setMode] = useState('email');
  const [raw, setRaw] = useState('');
  const [country, setCountry] = useState(() => detectCountry());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) setSearch('');
  }, [dropdownOpen]);

  const handleChange = (text) => {
    setRaw(text);
    const detected = detectMode(text);

    let nextMode = mode;
    if (detected !== null && detected !== mode) {
      nextMode = detected;
      setMode(detected);
    }

    if (nextMode === 'phone') {
      onChange({ type: 'phone', country, number: text, full: country.dial + text });
    } else {
      onChange({ type: 'email', value: text });
    }
  };

  const selectCountry = (c) => {
    setCountry(c);
    setDropdownOpen(false);
    if (mode === 'phone') {
      onChange({ type: 'phone', country: c, number: raw, full: c.dial + raw });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const switchMode = () => {
    const newMode = mode === 'email' ? 'phone' : 'email';
    setMode(newMode);
    setRaw('');
    onChange({ type: newMode, value: '' });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{label}</label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'stretch',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,184,0,0.18)',
        borderRadius: '8px', overflow: 'visible',
      }}>
        {mode === 'phone' ? (
          <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 10px',
                background: 'transparent', border: 'none', borderRight: '1px solid rgba(255,184,0,0.12)',
                cursor: 'pointer', color: 'var(--color-white)', fontSize: '15px', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{country.flag}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{country.dial}</span>
              <FaChevronDown size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                width: '300px', maxHeight: '320px', overflow: 'hidden',
                backgroundColor: '#1a1a1a', border: '1px solid var(--color-border-gold)',
                borderRadius: '10px', zIndex: 1000, boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                  }}>
                    <FaSearch size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      autoFocus
                      placeholder="Search country"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', color: 'var(--color-white)',
                        fontSize: '13px', outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div style={{ overflow: 'auto', maxHeight: '250px' }}>
                  {filtered.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCountry(c)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '10px 14px', background: c.code === country.code ? 'rgba(255,184,0,0.08)' : 'transparent',
                        border: 'none', cursor: 'pointer', color: 'var(--color-white)', fontSize: '14px', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{c.flag}</span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{c.dial}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', userSelect: 'none' }}>✉</span>
          </div>
        )}

        <input
          ref={inputRef}
          type={mode === 'email' ? 'email' : 'tel'}
          placeholder={mode === 'email' ? 'name@example.com' : '800 123 4567'}
          value={raw}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1, padding: '12px 14px', background: 'transparent', border: 'none',
            color: '#ffffff', fontSize: '15px', outline: 'none', minWidth: 0,
          }}
        />
      </div>
      <div style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
        {mode === 'phone' ? `Enter phone number · ${country.name}` : 'Enter email address'}
        <button
          type="button"
          onClick={switchMode}
          style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '12px', marginLeft: '8px', textDecoration: 'underline' }}
        >
          Use {mode === 'email' ? 'phone' : 'email'} instead
        </button>
      </div>
    </div>
  );
}