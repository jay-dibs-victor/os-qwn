import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import AnimatedHeroBackground from "./AnimatedHeroBackground";
import LocationSearch from "../../../core/components/LocationSearch";
import { MapService } from "../../../core/services/MapService";
import apiClient from "../../../core/api/apiClient";
import LocationRequestModal from "../Dashboard/LocationRequestModal";
import { useAuthStore } from "../../../core/store/useAuthStore";
import { useUIStore } from "../../../core/store/useUIStore";

import { Car, User, ShieldAlert, Sparkles, Layers, Cpu, Compass, Gift, Zap, Navigation, Key, Coins, Truck, Smartphone, CheckCircle, UserPlus, FileText, Check, ShieldCheck, Star, QrCode, Download, AlertTriangle, X } from 'lucide-react';

import ScheduleCategorySelector from "./SubViews/ScheduleCategorySelector";
import RoadTripWizard from "./SubViews/RoadTripWizard";
import FlightWizard from "./SubViews/FlightWizard";
import CourierWizard from "./SubViews/CourierWizard";
import QuickDispatchWizard from "./SubViews/QuickDispatchWizard";

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const IconChevronUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>;
const IconChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;

const rideTypes = [
  { id: "economy", name: "Fair", multiplier: 1.0, icon: "🚗", desc: "Affordable and reliable" },
  { id: "swift", name: "Swift", multiplier: 1.25, icon: "🚙", desc: "Fastest pickup nearby" },
  { id: "luxury", name: "Luxury", multiplier: 2.0, icon: "🚘", desc: "Premium comfort and cars" },
  { id: "epic", name: "Epic", multiplier: 3.5, icon: "🏎️", desc: "The ultimate ride experience" },
];

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openAuthModal = useUIStore(state => state.openAuthModal);

  const [bookingMode, setBookingMode] = useState('NOW'); // 'NOW', 'SCHEDULE_SELECT', 'ROAD_WIZARD', etc.
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [distance, setDistance] = useState(0);
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);
  const [formTouched, setFormTouched] = useState({ pickup: false, dropoff: false });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [isPickupDirty, setIsPickupDirty] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 15);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const slidesData = [
    {
      title: "Driver Signup Form",
      badge: "Step 01",
      icon: <UserPlus size={18} />,
      desc: "Get started as a driver partner. Complete the signup form with your legal details and active service city node.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>DRIVER PARTNER SIGNUP</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>LEGAL FULL NAME</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>Amara Diop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PHONE NUMBER</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>+234 803 123 4567</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>CITY LOCATION NODE</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>Lagos Node (LOS)</div>
              </div>
            </div>
            <button style={{ width: '100%', padding: '0.4rem', background: 'var(--primary)', border: 'none', borderRadius: '0.3rem', color: '#000', fontWeight: 'bold', fontSize: '0.55rem', marginTop: '0.1rem' }}>
              Next: Verify Phone
            </button>
          </div>
        </div>
      )
    },
    {
      title: "OTP Verification Inputs",
      badge: "Step 02",
      icon: <Smartphone size={18} />,
      desc: "Verify your phone node with a secure 4-digit OTP. Standard single-use codes secure your account identity.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>ENTER 4-DIGIT VERIFICATION CODE</span>
            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', margin: '0.2rem 0' }}>
              {['5', '9', '1', '7'].map((num, i) => (
                <div key={i} style={{ width: '1.75rem', height: '2.25rem', border: '1px solid var(--primary)', borderRadius: '0.35rem', background: 'rgba(255,184,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {num}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Resend verification code in 45s</span>
            <button style={{ width: '100%', padding: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.3rem', color: '#fff', fontWeight: 'bold', fontSize: '0.55rem' }}>
              Verify OTP Code
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Onboarding Flow Documents",
      badge: "Step 03",
      icon: <FileText size={18} />,
      desc: "Complete document onboarding. Securely upload driver licenses and certificates directly into the Cloudinary repository.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>ONBOARDING ATTACHMENTS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', padding: '0.35rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: '#fff' }}>1. Driver_License.jpg</span>
                <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED OCR</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', padding: '0.35rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.5rem', color: '#fff' }}>2. Vehicle_Insurance.pdf</span>
                <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED OCR</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.15)', padding: '0.4rem', borderRadius: '0.35rem', marginTop: '0.1rem' }}>
              <CheckCircle size={10} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Files synced to Cloudinary vault</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Operator Vetting Flow",
      badge: "Step 04",
      icon: <ShieldCheck size={18} />,
      desc: "Operator vetting processes complete. Displays a detailed checklist showing fully verified assets and document locks.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>OPERATOR VETTED</span>
              <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { label: "Credentials Audit", val: "Approved" },
                { label: "Cloudinary Address", val: "Verified" },
                { label: "Agreement Signature", val: "Locked" }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '0.5rem', fontWeight: 'bold', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                    <Check size={6} /> {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Secure Driver Login",
      badge: "Step 05",
      icon: <Key size={18} />,
      desc: "Connect your mobile node to the spatial grid. Enter your vetted partner username and security password.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>PARTNER LOGIN</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.6 }}>MESH SECURE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>USERNAME</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>amara_diop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PASSWORD KEYS</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 'bold' }}>••••••••••••</div>
              </div>
            </div>
            <button style={{ width: '100%', padding: '0.4rem', background: 'var(--primary)', border: 'none', borderRadius: '0.3rem', color: '#000', fontWeight: 'bold', fontSize: '0.55rem', marginTop: '0.1rem' }}>
              Access Network Mesh
            </button>
          </div>
        </div>
      )
    },
    {
      title: "First-Timer Bonus Coins",
      badge: "Step 06",
      icon: <Gift size={18} />,
      desc: "Unlock your first-timer sign-up reward balance. Recieve +1,000 QCoins credited instantly to your ledger wallet.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.03) 100%)', border: '1px solid rgba(255,184,0,0.35)', borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem', boxShadow: '0 12px 36px rgba(255,184,0,0.15)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '0.05em' }}>FIRST-TIMER LEDGER BONUS</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontFamily: 'var(--font-outfit)' }}>
              <Coins size={20} /> +1,000 Coins
            </h3>
            <p style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 'bold' }}>Welcome Partner Reward</p>
            <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>Dispatched directly to driver account</span>
          </div>
        </div>
      )
    },
    {
      title: "Profile Management Cockpit",
      badge: "Step 07",
      icon: <User size={18} />,
      desc: "Manage your vetted operator credentials. Review safety scores, Tier rank, linked accounts, and active hardware registrations.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #ff8800 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.65rem', border: '1.5px solid #fff' }}>AD</div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>Amara Diop</h4>
                <span style={{ fontSize: '0.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>★ TIER-3 TRUSTED PARTNER</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginTop: '0.1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>SAFETY RATING</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.05rem' }}>4.95 / 5.0</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>COMPLETED FARES</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.05rem' }}>248 Trips</p>
              </div>
            </div>
            <div style={{ fontSize: '0.42rem', color: 'var(--foreground-dim)', textAlign: 'left', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.35rem', marginTop: '0.1rem' }}>
              🚗 Linked: Toyota Camry Hybrid (LOS-882-EV)
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Dashboard App Access",
      badge: "Step 08",
      icon: <Cpu size={18} />,
      desc: "Gain full dashboard controls. Review real-time vehicle parameters, EV statistics, and stand by for location match dispatching.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem', display: 'block' }}>COCKPIT INSTRUMENTS</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.4rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PROPULSION</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.1rem' }}>94% EV State</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.4rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>GEOSPATIAL</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.1rem' }}>Connected</p>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '0.5rem', padding: '0.45rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.1rem', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>COCKPIT DISPATCH STATUS</span>
            <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>Standby for Matching</p>
          </div>
        </div>
      )
    },
    {
      title: "Ride Request Acceptance",
      badge: "Step 09",
      icon: <Car size={18} />,
      desc: "The real-time AI OS matching engine routes a high-yield ride offer. Click to secure passenger pickup instantly.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid var(--primary)', borderRadius: '0.85rem', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(255,184,0,0.2)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Sparkles size={8} className="animate-pulse" /> NEW TRIP REQUEST
              </span>
              <span style={{ fontSize: '0.45rem', background: 'rgba(255,184,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>15s LEFT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--foreground-dim)' }}>EST. NET EARNINGS:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary)' }}>$45.00 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--foreground-dim)' }}>PICKUP DISTANCE:</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff' }}>1.2 km (4 mins)</span>
              </div>
            </div>
            <button style={{ width: '100%', padding: '0.55rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', fontWeight: 'bold', fontSize: '0.65rem', boxShadow: '0 4px 12px rgba(255,184,0,0.3)', marginTop: '0.2rem' }}>
              Accept Ride Haul
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Take Up Itinerary (Batched Courier)",
      badge: "Step 10",
      icon: <Layers size={18} />,
      desc: "Double your earnings with cart-first courier batching. Accept multi-stop courier itineraries aligned with passenger path.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>LOGISTICS BATCHED</span>
              <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>+50% INCOME</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '0.3rem', borderRadius: '0.35rem', color: 'var(--primary)' }}>
                <Truck size={12} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff' }}>Simultaneous Courier Stop</p>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>Weight Threshold: &lt; 5.0 kg</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.1rem' }}>
              <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)' }}>Additional Commission:</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--success)' }}>+$22.00 USD</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Telemetry Map Movement",
      badge: "Step 11",
      icon: <Navigation size={18} />,
      desc: "Live GPS coordinates route your vehicle. Watch your cockpit indicator smoothly trace coordinate points to destination coordinates.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ flex: 1, minHeight: '175px', background: '#020202', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)', zIndex: 1 }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M 25,35 Q 75,25 105,85 T 175,135" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
              <path d="M 25,35 Q 75,25 105,85 T 175,135" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '35px', left: '25px', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', background: '#fff', borderRadius: '50%', border: '1px solid #000', boxShadow: '0 0 4px #fff' }} />
            <div style={{ position: 'absolute', top: '45px', left: '25px', transform: 'translateX(-50%)', background: 'rgba(5,5,5,0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.35rem', color: 'var(--foreground-muted)', whiteSpace: 'nowrap' }}>
              Pickup Node
            </div>
            <div style={{ position: 'absolute', top: '135px', left: '175px', transform: 'translate(-50%, -50%)', width: '10px', height: '100px', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'var(--error)', border: '1px solid #fff', boxShadow: '0 0 8px var(--error)', animation: 'radarRed 1.5s infinite ease-out' }} />
              <div style={{ position: 'absolute', top: '-15px', left: 0, transform: 'translateX(-50%)', background: 'rgba(239,68,68,0.9)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.1rem 0.25rem', borderRadius: '3px', fontSize: '0.35rem', color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                LOS-Node
              </div>
            </div>
            <div className="telemetry-car-vehicle">
              <div style={{ width: '14px', height: '14px', background: 'var(--primary)', border: '1.5px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 0 8px var(--primary)' }}>
                <Navigation size={8} style={{ transform: 'rotate(90deg)' }} />
              </div>
              <div className="telemetry-tooltip-floating">
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.4rem' }}>Amara Diop (EV)</span>
                <span style={{ opacity: 0.9 }}>94% SOC • Hybrid Camry</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active Route</span>
              </div>
              <div className="telemetry-tooltip-notch" />
            </div>
            <div style={{ position: 'absolute', bottom: '0.4rem', left: '0.4rem', right: '0.4rem', background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.5rem', borderRadius: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Speed: <b style={{ color: '#fff' }}>42 km/h</b></span>
              <span style={{ fontSize: '0.45rem', color: 'var(--primary)', fontWeight: 'bold' }}>ETA: 3 mins</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Commission Debit via Coins",
      badge: "Step 12",
      icon: <Coins size={18} />,
      desc: "Rather than taking cut from cash fares, the platform devalues service commissions directly from QCoins, leaving cash intact.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--error)' }}>COMMISSION DEBIT SYNC</span>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', margin: '0.1rem 0' }}>
              <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>PLATFORM COMMISSION FEE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 'black', color: 'var(--error)' }}>-10 QCoins</h4>
              <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>Subtracted from coin holdings</span>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.4rem', padding: '0.4rem', fontSize: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>
              100% PASSENGER CASH RETAINED
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Driver Wallet Dashboard",
      badge: "Step 13",
      icon: <Coins size={18} />,
      desc: "Manage platform coins and cash ledger balances. Buy additional operational coins or review secure transaction ledgers.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>DRIVER WALLET LEDGER</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.35rem', padding: '0.35rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>CASH ACCOUNT</span>
                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '0.05rem' }}>$320.00</p>
              </div>
              <div style={{ background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '0.35rem', padding: '0.35rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--primary)' }}>QCOIN BALANCE</span>
                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.05rem' }}>1,000 Coins</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.1rem' }}>
              <button style={{ flex: 1, padding: '0.35rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.25rem', fontSize: '0.45rem', fontWeight: 'bold' }}>
                + Buy QCoins
              </button>
              <button style={{ flex: 1, padding: '0.35rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.25rem', fontSize: '0.45rem', fontWeight: 'bold' }}>
                Transaction History
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem', fontSize: '0.4rem', color: 'var(--foreground-dim)', textAlign: 'left', marginTop: '0.1rem' }}>
              🕒 Recent: Commission Debited (-10 Coins)
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Direct Bank Cash-Out",
      badge: "Step 14",
      icon: <Truck size={18} />,
      desc: "Withdraw cash reserves directly to your standard bank account. Platforms process withdrawals in under 2.5 seconds.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>SECURE SETTLEMENT DRAW-DOWN</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>CASH OUT AMOUNT:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--success)' }}>$180.00 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>PAYOUT NODE:</span>
                <span style={{ fontSize: '0.45rem', fontWeight: 'bold', color: '#fff' }}>St. Chartered •••• 4820</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.4rem', borderRadius: '0.35rem', marginTop: '0.2rem', textAlign: 'left' }}>
              <CheckCircle size={12} style={{ color: 'var(--success)' }} />
              <div>
                <p style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>SETTLEMENT DISPATCHED</p>
                <span style={{ fontSize: '0.38rem', color: 'var(--foreground-dim)' }}>Sub-second verification complete</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Detailed Receipt & Rating",
      badge: "Step 15",
      icon: <Star size={18} />,
      desc: "Instant trip invoice split calculation. Passengers provide feedback text and star ratings upon cashless transaction settlement.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem', display: 'block' }}>TRIP COMPLETION INVOICE</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.42rem', color: 'var(--foreground-dim)', textAlign: 'left', margin: '0.1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Fare:</span>
                <span style={{ color: '#fff' }}>$45.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Logistics Courier Batch:</span>
                <span style={{ color: '#fff' }}>+$22.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.15rem' }}>
                <span>Surge Multiplier:</span>
                <span style={{ color: '#fff' }}>1.0x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '0.1rem' }}>
                <span style={{ color: 'var(--primary)' }}>NET EARNINGS PAID:</span>
                <span style={{ color: 'var(--success)' }}>$67.00 USD</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', margin: '0.15rem 0' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={10} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
              ))}
            </div>
            <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', fontStyle: 'italic' }}>"Excellent ride, hybrid EV was silent!"</p>
          </div>
        </div>
      )
    }
  ];

  const isFormValid = pickup.trim() && dropoff.trim();

  const [estimatedFare, setEstimatedFare] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [currencyInfo, setCurrencyInfo] = useState({ code: 'NGN', symbol: '₦', rate: 1500, pricing: { baseFare: 0.50, perKm: 0.12, perMin: 0.02, minFare: 1.00 } });

  const toggleDrawer = () => setIsDrawerMinimized(!isDrawerMinimized);

  // Permission Verification
  useEffect(() => {
    const checkPermission = async () => {
      const isDismissed = localStorage.getItem('location_prompt_dismissed');
      if (isDismissed) return;

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'prompt' || result.state === 'denied') {
            setShowLocationPrompt(true);
          }
        } catch (e) {
          console.error("Permission query failed", e);
        }
      }
    };
    checkPermission();
  }, []);

  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        setIsPickupDirty(true);
        setShowLocationPrompt(false);
        try {
          const addr = await MapService.reverseGeocode(latitude, longitude);
          setPickup(addr || 'My Location');
        } catch (e) {
          setPickup('My Location');
          console.error('Geocode failed', e);
        }
      },
      (err) => {
        handleRejectLocation();
      },
      { enableHighAccuracy: true }
    );
  };

  const handleRejectLocation = () => {
    localStorage.setItem('location_prompt_dismissed', 'true');
    setShowLocationPrompt(false);
  };

  // Background Location Awareness
  const lastCoordsRef = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setShowLocationPrompt(false);

        // Reverse geocode if moved significantly (> 10 meters) or first time
        const dist = MapService.calculateDistance(lastCoordsRef.current.lat, lastCoordsRef.current.lng, latitude, longitude);
        if ((dist > 10 || !pickup) && !isPickupDirty) {
          lastCoordsRef.current = { lat: latitude, lng: longitude };
          setPickupCoords({ lat: latitude, lng: longitude });
          try {
            const addr = await MapService.reverseGeocode(latitude, longitude);
            setPickup(addr || 'My Location');
          } catch (e) { console.error('Geocode failed', e); }
        }
      },
      () => { },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [isPickupDirty, pickup]);

  // Reactive Currency & Rate Awareness
  useEffect(() => {
    const fetchCurrencyInfo = async () => {
      if (pickupCoords?.lat) {
        try {
          const { data } = await apiClient.get('/rides/currency-info', {
            params: { lat: pickupCoords.lat, lng: pickupCoords.lng }
          });
          if (data.status === 200) {
            setCurrencyInfo({
              code: data.data.code,
              symbol: data.data.symbol,
              rate: data.data.rate || 1500,
              pricing: data.data.pricing || { baseFare: 0.50, perKm: 0.12, perMin: 0.03, minFare: 1.00 }
            });
          }
        } catch (e) {
          console.error("Failed to fetch currency info", e);
        }
      }
    };
    fetchCurrencyInfo();
  }, [pickupCoords]);

  // Reactive Fare Estimation
  useEffect(() => {
    const fetchHomeEstimation = async () => {
      if (pickupCoords?.lat && dropoffCoords?.lat) {
        // Calculate distance immediately using haversineKm for UX
        const km = haversineKm(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng);
        setDistance(km);

        setIsEstimating(true);
        try {
          const payload = {
            itineraries: [{
              pickupCoords: { lat: pickupCoords.lat, lng: pickupCoords.lng },
              destinationCoords: { lat: dropoffCoords.lat, lng: dropoffCoords.lng }
            }]
          };
          console.log('[Home] Sending estimation payload:', JSON.stringify(payload));
          const { data } = await apiClient.post('/rides/multi-stop-quote', payload);
          if (data.status === 200) {
            setEstimatedFare(data.data.total_fare);
            setCurrencyInfo(prev => ({
              ...prev,
              code: data.data.currency || prev.code,
              symbol: data.data.currency_symbol || prev.symbol,
              rate: data.data.exchange_rate || prev.rate
            }));
            if (data.data.itineraries?.[0]) {
              const accurateDist = data.data.itineraries[0].estimated_distance / 1000;
              console.log(`[Home] API returned distance: ${accurateDist}km, fare: ${data.data.total_fare}`);
              setDistance(accurateDist);
            }
          }
        } catch (e) {
          console.error("Home estimation error:", e);
        } finally {
          setIsEstimating(false);
        }
      }
    };
    fetchHomeEstimation();
  }, [pickupCoords, dropoffCoords]);

  const getEstimatedPrice = () => {
    if (isEstimating && !estimatedFare) return "...";

    let fareToDisplay = estimatedFare;

    // Local fallback calculation for instant feedback
    if (!fareToDisplay && distance > 0) {
      const baseUSD = currencyInfo.pricing.baseFare;
      const perKmUSD = currencyInfo.pricing.perKm;
      const perMinUSD = currencyInfo.pricing.perMin;
      const minFareUSD = currencyInfo.pricing.minFare;
      const exchangeRate = currencyInfo.rate;

      const approxFareUSD = baseUSD + (distance * perKmUSD) + ((distance / 40) * 60 * perMinUSD);
      const finalUSD = Math.max(approxFareUSD, minFareUSD);
      fareToDisplay = finalUSD * exchangeRate;
    }

    if (!fareToDisplay) return "--";

    const finalFare = Math.round(fareToDisplay * selectedRide.multiplier);
    return `${currencyInfo.symbol}${finalFare.toLocaleString()}`;
  };

  const handleRequestRide = () => {
    if (isFormValid) {
      if (!isAuthenticated) {
        openAuthModal('login');
        return;
      }
      navigate('/book-ride', {
        state: {
          pickup: { address: pickup, ...pickupCoords },
          destination: { address: dropoff, ...dropoffCoords },
          estimatedFare: estimatedFare * selectedRide.multiplier,
          rideCategory: selectedRide.id
        }
      });
    }
  };

  return (
    <div className="landing-page">

      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatedHeroBackground />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="hero-title hide-on-mobile">
                Your Travel & Tour Sure Plug, <span className="highlight">anytime, anywhere</span>
              </h1>

              <p className="hero-subtitle hide-on-mobile">
                centralized intelligence system that powers all decisions—matching, routing, pricing, and scheduling—across every transport mode
              </p>
            </motion.div>



            <motion.div
              className="booking-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, }}
            >
              <div className="booking-header">
                <button
                  className={`booking-type-btn ${bookingMode === 'NOW' ? "active" : ""}`}
                  onClick={() => setBookingMode('NOW')}
                >
                  <span>🚗</span> Quick Ride
                </button>
                <button
                  className={`booking-type-btn ${bookingMode !== 'NOW' ? "active" : ""}`}
                  onClick={() => setBookingMode('SCHEDULE_SELECT')}
                >
                  <span>📅</span> Schedule
                </button>
              </div>

              <AnimatePresence mode="wait">
                {bookingMode === 'NOW' && (
                  <motion.div
                    key="now-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="form-section"
                  >
                    <div className={`input-wrapper ${formTouched.pickup ? "touched" : ""}`}>
                      <label>Pick-up location</label>
                      <div className="input-field">
                        <LocationSearch
                          placeholder="Enter pick-up location"
                          value={pickup}
                          onChange={(val) => {
                            setPickup(val);
                            setFormTouched(prev => ({ ...prev, pickup: true }));
                            setIsPickupDirty(true);
                          }}
                          onLocationSelect={(loc) => {
                            setPickupCoords(loc);
                            setIsPickupDirty(true);
                          }}
                          className="form-input"
                          icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          }
                        />
                        {!isPickupDirty && pickup && (
                          <span className="badge bg-warning text-dark position-absolute end-0 me-3 mt-n1 font-8 fw-800 rounded-pill px-2">LIVE</span>
                        )}
                      </div>
                    </div>

                    <div className={`input-wrapper ${formTouched.dropoff ? "touched" : ""}`}>
                      <label>Drop-off location</label>
                      <div className="input-field">
                        <LocationSearch
                          placeholder="Where to?"
                          value={dropoff}
                          onChange={(val) => {
                            setDropoff(val);
                            setFormTouched(prev => ({ ...prev, dropoff: true }));
                          }}
                          onLocationSelect={(loc) => {
                            setDropoffCoords(loc);
                          }}
                          className="form-input"
                          icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          }
                        />
                      </div>
                    </div>

                    <div className="ride-selector-section">
                      <label className="section-label">Choose your ride</label>
                      <div className="ride-types">
                        {rideTypes.map((ride) => (
                          <motion.div
                            key={ride.id}
                            className={`ride-card ${selectedRide.id === ride.id ? "active" : ""}`}
                            onClick={() => setSelectedRide(ride)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="ride-icon">{ride.icon}</div>
                            <div className="ride-info">
                              <h6>{ride.name}</h6>
                              <p>
                                {estimatedFare || distance > 0
                                  ? (() => {
                                    let fare = estimatedFare;
                                    if (!fare && distance > 0) {
                                      const baseUSD = currencyInfo.pricing.baseFare;
                                      const perKmUSD = currencyInfo.pricing.perKm;
                                      const perMinUSD = currencyInfo.pricing.perMin;
                                      const minFareUSD = currencyInfo.pricing.minFare;
                                      const exchangeRate = currencyInfo.rate;

                                      const approxFareUSD = baseUSD + (distance * perKmUSD) + ((distance / 40) * 60 * perMinUSD);
                                      const finalUSD = Math.max(approxFareUSD, minFareUSD);
                                      fare = finalUSD * exchangeRate;
                                    }
                                    return `${currencyInfo.symbol}${Math.round(fare * ride.multiplier).toLocaleString()}`;
                                  })()
                                  : '—'}
                              </p>
                              <p className="ride-desc-mobile">{ride.desc}</p>
                            </div>
                            {selectedRide.id === ride.id && <div className="checkmark">✓</div>}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="price-section">
                      <div className="price-info">
                        <div>
                          <span className="price-label">Estimated Price</span>
                          <p className="price-amount">{getEstimatedPrice()}</p>
                        </div>
                        <div className="distance-info">
                          <span className="muted-text">{distance > 0 ? `${distance.toFixed(1)} km` : '— km'}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      className={`btn-ride ${isFormValid ? "enabled" : "disabled"}`}
                      onClick={handleRequestRide}
                      disabled={!isFormValid || isEstimating}
                      whileHover={isFormValid ? { scale: 1.02 } : {}}
                      whileTap={isFormValid ? { scale: 0.98 } : {}}
                    >
                      {isEstimating ? "Calculating..." : isFormValid ? "Request a Ride" : "Enter locations to continue"}
                    </motion.button>
                  </motion.div>
                )}

                {bookingMode === 'SCHEDULE_SELECT' && (
                  <motion.div key="schedule-select" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <ScheduleCategorySelector
                      onSelect={(id) => {
                        if (id === 'road') setBookingMode('ROAD_WIZARD');
                        if (id === 'flight') navigate('/flights');
                        if (id === 'courier_dispatch') setBookingMode('COURIER_DISPATCH_WIZARD');
                        if (id === 'courier_shipping') navigate('/shipping');
                        if (id === 'train') alert('Train booking coming soon!');
                        if (id === 'api') alert('API Interaction package coming soon!');
                        if (id === 'custom') alert('Suggest more service listing!');
                      }}
                    />
                  </motion.div>
                )}

                {bookingMode === 'ROAD_WIZARD' && (
                  <motion.div key="road-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <RoadTripWizard
                      onBack={() => setBookingMode('SCHEDULE_SELECT')}
                      onComplete={(itineraries) => {
                        console.log("Finalized road trip:", itineraries);
                        navigate('/checkout', { state: { bookingType: 'PLANNED', itineraries } });
                      }}
                    />
                  </motion.div>
                )}

                {bookingMode === 'FLIGHT_WIZARD' && (
                  <motion.div key="flight-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FlightWizard onBack={() => setBookingMode('SCHEDULE_SELECT')} />
                  </motion.div>
                )}

                {bookingMode === 'COURIER_WIZARD' && (
                  <motion.div key="courier-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CourierWizard onBack={() => setBookingMode('SCHEDULE_SELECT')} />
                  </motion.div>
                )}

                {bookingMode === 'COURIER_DISPATCH_WIZARD' && (
                  <motion.div key="courier-dispatch-wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <QuickDispatchWizard onBack={() => setBookingMode('SCHEDULE_SELECT')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>

        <AnimatePresence>
          {showLocationPrompt && (
            <LocationRequestModal onEnable={handleEnableLocation} onReject={handleRejectLocation} />
          )}
        </AnimatePresence>

        {/* Mobile Bottom Drawer */}
        <AnimatePresence>
          {isAuthenticated && (
            <motion.div
              className="bottom-drawer desktop-hidden-drawer"
              initial={{ y: "100%" }}
              animate={{ y: isDrawerMinimized ? "calc(100% - 65px)" : "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header-strip">
                <div className="drawer-handle"></div>
                <button className="drawer-toggle-btn vivid" onClick={toggleDrawer}>
                  {isDrawerMinimized ? <IconChevronUp /> : <IconChevronDown />}
                </button>
              </div>

              <div className="drawer-content">
                <AnimatePresence mode="wait">
                  {bookingMode === 'NOW' && (
                    <motion.div key="mobile-now" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="ride-selector-section px-3">
                        <div className="ride-types">
                          {rideTypes.map((ride) => (
                            <div
                              key={ride.id}
                              className={`ride-card ${selectedRide.id === ride.id ? "active" : ""}`}
                              onClick={() => setSelectedRide(ride)}
                            >
                              <div className="ride-icon">{ride.icon}</div>
                              <div className="ride-info">
                                <h6>{ride.name}</h6>
                                <p>{getEstimatedPrice()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          className="btn-ride enabled w-100"
                          onClick={handleRequestRide}
                          disabled={!isFormValid || isEstimating}
                        >
                          {isEstimating ? "Calculating..." : "Request Ride"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 1. Driver Benefits Grid */}
      <section className="section" style={{ padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            ✦ Platform Advantages
          </div>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.8rem', fontWeight: '800' }}>
            Empowering Our Driver Partners
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--foreground-muted)', maxWidth: '640px', margin: '0 auto' }}>
            Why leading suppliers select the Queens OS network for ultimate efficiency and earnings scaling.
          </p>
        </div>

        <div className="container">
          <div className="grid-2" style={{ gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Transparent Surge Multipliers</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>AI Telemetry Driven</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                No hidden platform fees or random adjustments. Our real-time AI mobility graph measures live demand clusters, offering transparent multipliers up to 2.5x during high congestion, keeping your vehicle utilized and highly paid.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Logistics Multi-Tasking</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Double Your Earnings</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Never run dry return trips. Seamlessly batch passenger taxi rides with scheduled parcel delivery hauls. Our B2B logistics routing coordinates pickups directly along your path to optimize every mile driven.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Milestone Payouts & QCoins</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Gamified Growth Loops</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Earn extra rewards through our milestone ledger! Receive direct coin bonuses upon completing documents vetting, maintaining high ratings, and referring driver colleagues. Exchange QCoins for immediate cash payouts or discounted fuel vouchers.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Flexible Partner Leases</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vehicle Finance Options</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Unlock vehicle lease-to-own programs. Verified driver partners with excellent safety scores get prioritized access to our low-interest hybrid and EV fleet financing options, allowing you to own your high-yield vehicle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Phone Mockup Slideshow */}
      <section className="section" style={{ padding: '5rem 0', background: 'rgba(255,255,255,0.01)', borderTop: 'var(--border-glass)', borderBottom: 'var(--border-glass)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            <Smartphone size={14} /> Interactive Experience
          </div>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.8rem', fontWeight: '800' }}>
            Cinematic Driver Onboarding & Telemetry
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--foreground-muted)' }}>
            Follow the step-by-step transaction flow, from initial signup to seamless QCoins payouts.
          </p>
        </div>

        <div className="container">
          <div className="mobile-showcase-container">
            {/* Left Column: Glassmorphic Phone Casing */}
            <div className="showcase-phone-column">
              <div className="phone-mockup-frame">
                <div className="phone-mockup-notch" />
                <div className="phone-mockup-screen" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* iOS Style Top Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.52rem', fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '0.35rem', padding: '0.2rem 0.4rem 0 0.4rem', zIndex: 2 }}>
                    <span>9:41</span>
                    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.4rem', opacity: 0.8 }}>5G</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '5px' }}>
                        <div style={{ width: '1px', height: '1.5px', background: 'var(--foreground-muted)' }}></div>
                        <div style={{ width: '1px', height: '2.5px', background: 'var(--foreground-muted)' }}></div>
                        <div style={{ width: '1px', height: '3.5px', background: 'var(--foreground-muted)' }}></div>
                        <div style={{ width: '1px', height: '4.5px', background: 'var(--foreground-muted)' }}></div>
                      </div>
                      <div style={{ width: '11px', height: '5px', border: '1px solid var(--foreground-muted)', borderRadius: '1.5px', display: 'flex', alignItems: 'center', padding: '0.5px' }}>
                        <div style={{ width: '80%', height: '100%', background: 'var(--foreground-muted)', borderRadius: '0.5px' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Queens OS Mobile Header App Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.45rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.5)', backdropFilter: 'blur(8px)', zIndex: 2, marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 'bold', color: '#000' }}>Q</div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-outfit)', color: '#fff', letterSpacing: '-0.01em' }}>Queens OS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                      <span style={{ width: '4px', height: '4px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 4px var(--success)' }}></span>
                      <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>LOS-HUB</span>
                    </div>
                  </div>

                  {/* High Fidelity Offline Vector Map Background */}
                  <svg
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 0,
                      background: '#040404',
                      pointerEvents: 'none'
                    }}
                    viewBox="0 0 200 400"
                    preserveAspectRatio="none"
                  >
                    <path d="M 0,80 Q 80,90 120,40 T 200,30" stroke="rgba(255, 184, 0, 0.16)" strokeWidth="3" fill="none" />
                    <path d="M 40,0 Q 60,150 140,250 T 160,400" stroke="rgba(255, 184, 0, 0.16)" strokeWidth="3.5" fill="none" />
                    <path d="M 0,320 C 60,310 140,350 200,310" stroke="rgba(255, 184, 0, 0.14)" strokeWidth="2.5" fill="none" />
                    <path d="M 0,160 L 200,180" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.2" fill="none" />
                    <path d="M 0,240 Q 90,220 200,260" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
                    <path d="M 100,0 L 100,400" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" fill="none" />
                    <path d="M 10,0 Q 20,200 180,400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" fill="none" />
                    <path d="M 190,0 Q 180,200 20,400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" fill="none" />
                    <circle cx="115" cy="120" r="16" stroke="rgba(255, 184, 0, 0.18)" strokeWidth="2" fill="none" />
                    <circle cx="115" cy="120" r="4" fill="rgba(255, 184, 0, 0.22)" />
                  </svg>

                  {/* Pulsing Golden GPS Locator Indicator Beacon */}
                  <div
                    className="golden-beacon-pointer"
                    style={{
                      top: '30%',
                      left: '57.5%',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Animated Inner Viewport Slide Content */}
                  <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, position: 'relative' }}>
                    {slidesData[activeSlide].content}
                  </div>

                  {/* Mobile Tab Navigation Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0', marginTop: '0.6rem', zIndex: 2, borderRadius: '0.5rem 0.5rem 0 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide <= 7 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                      <Car size={10} />
                      <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Drive</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: (activeSlide >= 8 && activeSlide <= 10) ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                      <Navigation size={10} />
                      <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Match</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide === 9 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                      <Truck size={10} />
                      <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Logistics</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide >= 11 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                      <Coins size={10} />
                      <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Wallet</span>
                    </div>
                  </div>

                  <div className="phone-mockup-indicator" />
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Feature Steppers Selector */}
            <div className="showcase-info-column" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {slidesData.map((slide, idx) => (
                <button
                  key={idx}
                  className={`showcase-stepper-btn ${idx === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                  style={{ width: '100%', marginBottom: '0.5rem', padding: '0.75rem 1rem' }}
                >
                  <div className="showcase-stepper-icon-box" style={{ padding: '0.35rem' }}>
                    {slide.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'var(--font-outfit)', color: '#fff', margin: 0 }}>
                        {slide.title}
                      </h3>
                      <span className="badge" style={{ background: idx === activeSlide ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', color: idx === activeSlide ? 'var(--primary)' : 'var(--foreground-dim)', border: idx === activeSlide ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', fontSize: '0.45rem', padding: '0.1rem 0.3rem' }}>
                        {slide.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.4', margin: '0.2rem 0 0 0', color: 'var(--foreground-muted)' }}>
                      {slide.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Queens Coins Section */}
      <section className="glass-card glass-card-accent container" style={{ padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem auto' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(255, 184, 0, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.05) 100%)', borderRadius: '50%', border: '1px solid rgba(255,184,0,0.3)', boxShadow: '0 0 30px rgba(255,184,0,0.2)' }}>
          <Coins size={48} color="#FFB800" />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-outfit)', marginBottom: '1rem', background: 'linear-gradient(135deg, #FFB800 30%, #FFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Queens Coins
        </h2>
        <p style={{ maxWidth: '800px', margin: '0 auto 2rem auto', fontSize: '1.05rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
          We are pioneering a new paradigm in digital wealth generation through Proof of Useful Work. By participating in the Queens OS ecosystem—whether as a driver partner or a passenger—you seamlessly acquire crypto assets. This embedded utility allows the platform to process network commissions entirely through Queens Coins, ensuring 100% of your cash earnings remain untouched while your digital portfolio scales.
        </p>
        <button className="btn btn-primary btn-interactive-cta" onClick={() => navigate('/rewards')} style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', zIndex: 1, boxShadow: '0 8px 24px rgba(255,184,0,0.3)' }}>
          <Sparkles size={20} /> Explore More: Driver Early Access
        </button>
      </section>

      {/* 4. Early Access Benefits */}
      <section className="section" style={{ padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            ✦ Exclusive Early Access
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem', fontWeight: '800' }}>
            Join Before the Masses
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Limited perks for those who move first. Passengers, drivers, and crypto adopters each unlock a dedicated tier of founding privileges.
          </p>
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {/* Passenger Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: '#3b82f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff', margin: 0 }}>For Passengers</h3>
                <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase' }}>Founding Rider Perks</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🎟️', text: '3 free rides credited on account activation — no promo code needed.' },
                { icon: '💰', text: 'Every fare earns passive QCoin cashback, building your digital wallet automatically.' },
                { icon: '🎮', text: 'In-app minigame booster: play during active rides for a 3× coin generation multiplier.' },
                { icon: '⭐', text: 'Founding Tier badge — permanent priority queue during peak-hour surge periods.' },
                { icon: '🔗', text: 'Earn +50 QCN per friend referred, +100 QCN when they complete driver vetting.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Driver Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,184,0,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="m16 8 5 2v4l-5 2" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff', margin: 0 }}>For Driver Partners</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Genesis Operator Tier</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🪙', text: '+1,000 QCoin Genesis Airdrop credited instantly on approved onboarding.' },
                { icon: '💸', text: '100% of passenger cash fares retained — platform commissions deducted via QCoins only.' },
                { icon: '🚗', text: 'Zero-deposit EV & hybrid lease-to-own scheme for Tier 1 verified founding partners.' },
                { icon: '🏆', text: 'Trip milestone coin rewards: 50 trips, 100 trips, 500 trips — each tier unlocks a coin bonus drop.' },
                { icon: '🗳️', text: 'Founding drivers hold voting rights in the first ever Queens Driver Council elections.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Crypto Early Adopter Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--success)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.5 8H14a2.5 2.5 0 0 1 0 5H9.5V8z" /><path d="M9.5 13H15a2.5 2.5 0 0 1 0 5H9.5V13z" /><line x1="9.5" y1="8" x2="9.5" y2="18" /><line x1="7" y1="11" x2="7" y2="11" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff', margin: 0 }}>Crypto Early Adopters</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: '800', textTransform: 'uppercase' }}>QCoin Genesis Access</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🔐', text: 'Secure non-custodial wallet — you hold your private keys, not us.' },
                { icon: '📈', text: 'Genesis bundle pricing locked at founding rates before open-market listing.' },
                { icon: '⛽', text: 'Use QCoins to pay EV charging, vehicle maintenance, and platform subscriptions at a 15% discount.' },
                { icon: '🌱', text: 'Proof of Useful Work: coins generated by real transport activity, not wasteful mining computation.' },
                { icon: '🎁', text: 'Early stakers qualify for governance token allocation in the upcoming QueensDAO ecosystem vote.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. How It Works — Step-by-Step Visual Journey */}
      <section className="section" style={{ padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            ⚡ Powered by AI
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem', fontWeight: '800' }}>
            How a Queens OS Ride Works
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', maxWidth: '560px', margin: '0 auto' }}>
            From the moment you tap "Book" to the second you arrive — here's what happens behind the scenes, in plain English.
          </p>
        </div>

        {/* Step Journey */}
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          {/* Vertical connector line */}
          <div style={{ position: 'absolute', left: '2rem', top: '3rem', bottom: '3rem', width: '2px', background: 'linear-gradient(180deg, var(--primary) 0%, rgba(255,184,0,0.1) 100%)', zIndex: 0 }} />

          {[
            {
              step: '01',
              emoji: '📱',
              title: 'You Request a Ride',
              plain: 'Open the Queens OS app, type or say where you want to go. The system understands your request instantly — no forms, no complicated steps.',
              detail: 'Your intent is captured by the AI Agent and converted into a structured ride request in under a second.',
              color: '#3b82f6',
            },
            {
              step: '02',
              emoji: '🤖',
              title: 'The AI Finds Your Perfect Driver',
              plain: 'Queens OS scans all available, verified driver partners near you in real-time — matching vehicle type, rating, and estimated arrival time.',
              detail: 'A smart matching algorithm compares proximity, vehicle tier, and driver availability to assign the best option within seconds.',
              color: 'var(--primary)',
            },
            {
              step: '03',
              emoji: '🔐',
              title: 'A Secure Pickup Code is Issued',
              plain: 'You receive a unique 4-digit PIN on your screen. When your driver arrives, you share this code with them — this confirms the right person is picking you up.',
              detail: 'This one-time OTP (one-time password) is the handshake between you and your driver. It protects both parties and starts the trip clock.',
              color: 'var(--success)',
            },
            {
              step: '04',
              emoji: '🚗',
              title: 'Your Journey Begins — Coins Start Earning',
              plain: 'Once the code is confirmed, your trip starts. You can track your driver live on the map. Meanwhile, QCoins begin accumulating in your wallet automatically.',
              detail: 'Trip telemetry is streamed in real-time. Passenger coins are calculated per kilometre. In-transit minigame play multiplies your yield by 3×.',
              color: '#ec4899',
            },
            {
              step: '05',
              emoji: '💳',
              title: 'Seamless Payment — Cash or Crypto',
              plain: 'Pay with cash as normal, or use your QCoin balance to cover your fare. Drivers keep 100% of cash — platform fees are handled quietly via coins.',
              detail: 'Queens OS settles driver commissions using QCoins, so your cash earning is never touched. No surprise deductions from the driver\'s pocket.',
              color: 'var(--success)',
            },
            {
              step: '06',
              emoji: '⭐',
              title: 'Rate, Review, and Grow Your Ecosystem Rank',
              plain: 'After your trip, rate your driver. Your feedback shapes the network — great drivers get promoted, your loyalty earns you rank upgrades and bonus coins.',
              detail: 'Ratings feed the driver scoring system. Consistent passengers unlock Founding Tier perks and referral multipliers in the QCN ecosystem.',
              color: 'var(--primary)',
            },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              {/* Step Bubble */}
              <div style={{ flexShrink: 0, width: '4rem', height: '4rem', borderRadius: '50%', background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}11 100%)`, border: `2px solid ${item.color}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: `0 0 20px ${item.color}22` }}>
                {item.emoji}
              </div>

              {/* Content Card */}
              <div className="glass-card" style={{ flex: 1, padding: '1.5rem', borderLeft: `3px solid ${item.color}66` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step {item.step}</span>
                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-outfit)', color: '#fff', marginTop: '0.15rem', margin: 0 }}>{item.title}</h3>
                  </div>
                </div>

                {/* Plain English */}
                <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', lineHeight: '1.6', marginBottom: '0.85rem' }}>
                  {item.plain}
                </p>

                {/* Under-the-hood detail */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, marginTop: '1px' }}>Under the hood →</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', lineHeight: '1.5' }}>{item.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Callout */}
        <div className="container" style={{ marginTop: '3rem', background: 'linear-gradient(135deg, rgba(255,184,0,0.06) 0%, rgba(16,185,129,0.04) 100%)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: 'var(--foreground-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.7' }}>
            Every step is handled automatically by Queens OS — <strong style={{ color: '#fff' }}>no middlemen, no manual dispatching, no hidden fees</strong>. Just reliable, intelligent transport that works for both riders and drivers equally.
          </p>
        </div>
      </section>

      {/* 6. Join Early Banner */}
      <section className="container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '2rem', background: 'linear-gradient(135deg, #0a0a0a 0%, #111 60%, #0d0d0d 100%)', border: '1px solid rgba(255,184,0,0.15)', padding: 0, minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4rem auto' }}>
        {/* Route Network SVG */}
        <svg
          viewBox="0 0 900 340"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Road grid lines */}
          {[60, 180, 300, 600, 720, 840].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="340" stroke="rgba(255,184,0,0.07)" strokeWidth="1" />
          ))}
          {[60, 130, 200, 270].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="900" y2={y} stroke="rgba(255,184,0,0.07)" strokeWidth="1" />
          ))}

          {/* Route paths (roads) */}
          <path d="M0,200 Q150,170 300,200 Q450,230 600,190 Q750,160 900,200" stroke="rgba(255,184,0,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="6 4" filter="url(#glow)" />
          <path d="M0,130 Q200,100 450,140 Q650,170 900,130" stroke="rgba(255,184,0,0.15)" strokeWidth="1" fill="none" strokeDasharray="5 5" />
          <path d="M0,260 Q300,240 450,170 Q600,100 900,260" stroke="rgba(255,184,0,0.1)" strokeWidth="1" fill="none" />
          <path d="M180,0 Q200,100 300,170 Q380,220 300,340" stroke="rgba(255,184,0,0.12)" strokeWidth="1" fill="none" />
          <path d="M720,0 Q700,120 600,170 Q520,200 600,340" stroke="rgba(255,184,0,0.1)" strokeWidth="1" fill="none" />

          {/* Animated travelling dots on roads */}
          <circle r="3" fill="var(--primary)" filter="url(#glow)" opacity="0.9">
            <animateMotion dur="6s" repeatCount="indefinite" path="M0,200 Q150,170 300,200 Q450,230 600,190 Q750,160 900,200" />
          </circle>
          <circle r="2.5" fill="#3b82f6" filter="url(#glow)" opacity="0.8">
            <animateMotion dur="8s" repeatCount="indefinite" begin="2s" path="M900,130 Q650,170 450,140 Q200,100 0,130" />
          </circle>
          <circle r="2" fill="var(--success)" filter="url(#glow)" opacity="0.7">
            <animateMotion dur="10s" repeatCount="indefinite" begin="1s" path="M0,260 Q300,240 450,170 Q600,100 900,260" />
          </circle>
          <circle r="2" fill="var(--primary)" filter="url(#glow)" opacity="0.6">
            <animateMotion dur="7s" repeatCount="indefinite" begin="4s" path="M180,0 Q200,100 300,170 Q380,220 300,340" />
          </circle>

          {/* POI pulsing dots */}
          {[
            [90, 200], [300, 200], [600, 190], [810, 200],
            [180, 130], [450, 140], [720, 130],
            [300, 170], [450, 170],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(255,184,0,0.6)" style={{ animation: `pulseDot ${1.8 + (i * 0.3)}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} filter="url(#glow)" />
          ))}

          {/* Radial glow from centre */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="30%">
            <stop offset="0%" stopColor="rgba(255,184,0,0.25)" />
            <stop offset="100%" stopColor="rgba(255,184,0,0)" />
          </radialGradient>
          <ellipse cx="450" cy="170" rx="220" ry="120" fill="url(#centerGlow)" style={{ animation: 'bannerGlow 3s ease-in-out infinite' }} />
        </svg>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '3.5rem 2rem', maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.3)', border: '1px solid rgba(255,184,0,0.25)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1.25rem', letterSpacing: '0.12em' }}>
            🚀 Limited Founding Access
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.75rem', lineHeight: '1.15' }}>
            Join the Queens OS Network Early
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Secure your founding status as a verified driver partner or passenger. Early members unlock exclusive QCoin airdrops, priority matching, and lifetime ecosystem benefits.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = 'http://localhost:4000/signup'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'var(--primary)', color: '#000',
                border: 'none', borderRadius: '0.85rem',
                padding: '0.9rem 2rem', fontSize: '0.95rem', fontWeight: '800',
                cursor: 'pointer', fontFamily: 'var(--font-outfit)',
                boxShadow: '0 8px 32px rgba(255,184,0,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,184,0,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,184,0,0.4)'; }}
            >
              🚗 Sign Up as a Driver Partner
            </button>
            <button
              onClick={() => { if (isAuthenticated) { navigate('/dashboard'); } else { openAuthModal('register'); } }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.85rem',
                padding: '0.9rem 2rem', fontSize: '0.95rem', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'var(--font-outfit)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              👤 Join as a Passenger
            </button>
          </div>
        </div>
      </section>

      {/* 7. Cinematic Download Mobile App Section */}
      <section className="glass-card container" style={{ padding: '3.5rem 2rem', background: 'rgba(10,10,10,0.85)', position: 'relative', overflow: 'hidden', margin: '4rem auto' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left Column: Benefits & Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-glow)', border: '1px solid rgba(255,184,0,0.25)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em', width: 'fit-content' }}>
              <Smartphone size={13} /> Mobile Cockpit Deployment
            </div>

            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', lineHeight: '1.2', letterSpacing: '-0.02em', margin: 0 }}>
              Download the Queens OS Mobile App
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', lineHeight: '1.6', margin: 0 }}>
              Deploy your spatial operator cockpit directly to your smartphone. Track live ride dispatch requests, synchronize your sub-second crypto QCoins ledger, and leverage AI routing coordinates even in low-bandwidth regions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '0.5rem 0' }}>
              {[
                { icon: <Zap size={14} style={{ color: 'var(--primary)' }} />, text: 'Real-time AI Match dispatch alerts' },
                { icon: <Coins size={14} style={{ color: 'var(--primary)' }} />, text: 'Instant sub-second commission ledger payouts' },
                { icon: <Navigation size={14} style={{ color: 'var(--primary)' }} />, text: 'Offline vector road coordination grid' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--foreground-muted)' }}>
                  <div style={{ background: 'rgba(255,184,0,0.1)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* App Store / Google Play styled buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                onClick={() => setShowDownloadAlert(true)}
                className="btn-interactive-cta"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.75rem',
                  padding: '0.6rem 1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}>
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Download on the</span>
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '800', fontFamily: 'var(--font-outfit)', marginTop: '-2px' }}>App Store</span>
                </div>
              </button>

              <button
                onClick={() => setShowDownloadAlert(true)}
                className="btn-interactive-cta"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.75rem',
                  padding: '0.6rem 1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}>
                  <path d="M5,3L19,12L5,21V3M5,5V19L15.89,12L5,5Z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Get it on</span>
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '800', fontFamily: 'var(--font-outfit)', marginTop: '-2px' }}>Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: High Fidelity Mock QR Code Container */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              onClick={() => setShowDownloadAlert(true)}
              className="glass-card"
              style={{
                padding: '2rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                maxWidth: '280px',
                width: '100%'
              }}
            >
              {/* Scan Guide Frame */}
              <div style={{ position: 'relative', padding: '1rem', background: '#ffffff', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(255,184,0,0.15)' }}>
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ color: '#000000', display: 'block' }}>
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                  <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                  <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                  <rect x="70" y="70" width="10" height="10" fill="currentColor" />

                  <rect x="40" y="0" width="10" height="10" fill="currentColor" />
                  <rect x="40" y="20" width="15" height="10" fill="currentColor" />
                  <rect x="50" y="40" width="10" height="15" fill="currentColor" />
                  <rect x="10" y="40" width="15" height="10" fill="currentColor" />
                  <rect x="25" y="50" width="10" height="10" fill="currentColor" />

                  <rect x="70" y="40" width="10" height="10" fill="currentColor" />
                  <rect x="85" y="50" width="10" height="15" fill="currentColor" />

                  <rect x="40" y="70" width="15" height="10" fill="currentColor" />
                  <rect x="40" y="85" width="10" height="10" fill="currentColor" />
                  <rect x="55" y="80" width="10" height="10" fill="currentColor" />

                  <rect x="55" y="15" width="10" height="10" fill="currentColor" />
                  <rect x="50" y="60" width="20" height="10" fill="currentColor" />
                </svg>

                {/* Laser Scanning line animation overlay */}
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  right: '1rem',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                  boxShadow: '0 0 10px var(--primary)',
                  animation: 'qrScannerLine 2.5s infinite linear',
                  zIndex: 2,
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Guide Label */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                  <QrCode size={14} style={{ color: 'var(--primary)' }} /> Scan QR to Deploy
                </span>
                <p style={{ fontSize: '0.62rem', color: 'var(--foreground-dim)', marginTop: '0.2rem', margin: 0 }}>
                  Airdrops standard credentials directly to device match grid.
                </p>
              </div>

              {/* Pulsing Guide Lines scan corners */}
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '12px', height: '12px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '12px', height: '12px', borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: '12px', height: '12px', borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRadius: '0 0 0 2px' }} />
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '12px', height: '12px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderRadius: '0 0 2px 0' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 8. High Fidelity Verification Vetting Alert Modal */}
      {showDownloadAlert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div
            className="glass-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid rgba(255,184,0,0.3)',
              boxShadow: '0 25px 60px rgba(255,184,0,0.12)',
              borderRadius: '1.5rem',
              padding: '2.25rem',
              position: 'relative',
              textAlign: 'center',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDownloadAlert(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--foreground-muted)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--foreground-muted)'; }}
            >
              <X size={16} />
            </button>

            {/* Shield Warning Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.05) 100%)',
              border: '1px solid rgba(255,184,0,0.35)',
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--primary)',
              boxShadow: '0 8px 30px rgba(255,184,0,0.15)'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
              Verification Vetting Required
            </h3>

            <p style={{ fontSize: '0.92rem', color: 'var(--foreground-muted)', lineHeight: '1.6', marginBottom: '1.75rem', margin: '0 0 1.75rem 0' }}>
              Before downloading and deploying your mobile cockpit node, platform regulations require your driver partner vetting process to be <strong>100% complete</strong> and all <strong>4 legal onboarding documents</strong> fully certified by our OCR and administrative compliance team.
            </p>

            {/* Custom Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>1</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', margin: 0 }}>Complete Signup Form</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', margin: 0 }}>Legal full name, active cell node, and city base parameters.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>2</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', margin: 0 }}>OCR Document Vetting</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', margin: 0 }}>Upload driver license, bank account, and vehicle insurance parameters.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>3</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', margin: 0 }}>Compliance Certification</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)', margin: 0 }}>Review and sign off on active dispatch guidelines and charter agreement.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowDownloadAlert(false);
                  window.location.href = 'http://localhost:4000/signup';
                }}
                className="btn btn-primary btn-interactive-cta"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(255,184,0,0.2)' }}
              >
                Go to Driver Portal to Complete Onboarding <Sparkles size={15} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowDownloadAlert(false);
                    window.location.href = 'http://localhost:4000/login';
                  }}
                  className="btn btn-secondary btn-interactive-cta"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Sign In to Vetting <Key size={12} />
                </button>
                <button
                  onClick={() => setShowDownloadAlert(false)}
                  className="btn btn-secondary btn-interactive-cta"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 'bold', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground-muted)' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
