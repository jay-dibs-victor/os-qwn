import { useState } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';

const countryCodes = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+234', country: 'NG' },
  { code: '+233', country: 'GH' },
  { code: '+27', country: 'ZA' },
  { code: '+254', country: 'KE' },
  { code: '+256', country: 'UG' },
  { code: '+255', country: 'TZ' },
  { code: '+260', country: 'ZM' },
  { code: '+263', country: 'ZW' },
  { code: '+91', country: 'IN' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+61', country: 'AU' },
  { code: '+55', country: 'BR' },
  { code: '+52', country: 'MX' },
];

export default function AccountPersonalInfo() {
  const [fields, setFields] = useState([
    { label: 'Name', value: 'Brian Oshinbolu', editable: true },
    { label: 'Phone number', value: '+2348100271832', editable: true },
    { label: 'Email', value: 'oshinbolubrian@gmail.com', editable: false },
    { label: 'Language', value: 'English', editable: true },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [dialCode, setDialCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);

  const openModal = (index) => {
    setEditingIndex(index);
    const currentValue = fields[index].value;

    if (fields[index].label === 'Phone number') {
      const matched = countryCodes.find((c) => currentValue.startsWith(c.code));
      if (matched) {
        setDialCode(matched.code);
        setPhoneNumber(currentValue.slice(matched.code.length));
      } else {
        setDialCode('+234');
        setPhoneNumber(currentValue);
      }
      setEditValue('');
    } else {
      setEditValue(currentValue);
    }
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const next = [...fields];
    if (fields[editingIndex].label === 'Phone number') {
      next[editingIndex] = { ...next[editingIndex], value: dialCode + phoneNumber };
    } else {
      next[editingIndex] = { ...next[editingIndex], value: editValue };
    }
    setFields(next);
    closeModal();
  };

  const closeModal = () => {
    setEditingIndex(null);
    setEditValue('');
    setDialCode('+234');
    setPhoneNumber('');
    setCodeDropdownOpen(false);
  };

  const field = editingIndex !== null ? fields[editingIndex] : null;
  const isPhone = field?.label === 'Phone number';

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Personal info</h2>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-surface-card)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '1px solid var(--color-border-gold)' }}>👤</div>
      {fields.map((f, i) => (
        <div key={f.label} style={{ padding: '20px 0', borderBottom: '1px solid var(--color-border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{f.label}</div>
            <div style={{ fontSize: '16px' }}>{f.value}</div>
          </div>
          {f.editable ? (
            <button
              onClick={() => openModal(i)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }}
            >
              ✎
            </button>
          ) : null}
        </div>
      ))}

      {/* Modal */}
      {field && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-gold)',
              borderRadius: '12px',
              padding: '32px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Edit {field.label}</h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px' }}>
                <FaTimes />
              </button>
            </div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{field.label}</label>

            {isPhone ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {/* Dial code dropdown */}
                <div style={{ position: 'relative', width: '120px' }}>
                  <button
                    onClick={() => setCodeDropdownOpen((prev) => !prev)}
                    style={{
                      width: '100%', padding: '14px 12px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-border-gold)',
                      borderRadius: '8px',
                      color: 'var(--color-white)',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    {dialCode}
                    <FaChevronDown style={{ fontSize: '12px', color: 'var(--color-text-muted)' }} />
                  </button>
                  {codeDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border-gold)',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                    >
                      {countryCodes.map((cc) => (
                        <button
                          key={cc.code}
                          onClick={() => { setDialCode(cc.code); setCodeDropdownOpen(false); }}
                          style={{
                            width: '100%', padding: '10px 12px',
                            backgroundColor: dialCode === cc.code ? 'rgba(255,184,0,0.1)' : 'transparent',
                            border: 'none',
                            color: dialCode === cc.code ? 'var(--color-gold)' : 'var(--color-white)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{cc.code}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>{cc.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone number input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                  style={{
                    flex: 1, padding: '14px 16px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--color-border-gold)',
                    borderRadius: '8px',
                    color: 'var(--color-white)',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                />
              </div>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--color-border-gold)',
                  borderRadius: '8px',
                  color: 'var(--color-white)',
                  fontSize: '16px',
                  outline: 'none',
                  marginBottom: '24px',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={saveEdit} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
