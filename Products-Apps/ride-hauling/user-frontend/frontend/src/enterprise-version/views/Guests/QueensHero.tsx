import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Flag,
  CalendarDays,
  Clock3,
  Users,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Car,
  Plane,
  Compass,
  Package,
  Truck,
  Code,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Star,
  Coins,
  ChevronUp,
  ChevronDown,
  Crown,
  Sparkles
} from "lucide-react";

import { useAuthStore } from "../../core/store/useAuthStore";
import { useUIStore } from "../../core/store/useUIStore";
import apiClient from "../../core/api/apiClient";
import { MapService } from "../../core/services/MapService";
import LocationSearch from "../../core/components/LocationSearch";
import LocationRequestModal from "../User/Dashboard/LocationRequestModal";

// Subview Wizards
import RoadTripWizard from "../User/Home/SubViews/RoadTripWizard";
import QuickDispatchWizard from "../User/Home/SubViews/QuickDispatchWizard";
import ScheduleCategorySelector from "../User/Home/SubViews/ScheduleCategorySelector";
import CourierWizard from "../User/Home/SubViews/CourierWizard";
import FlightWizard from "../User/Home/SubViews/FlightWizard";

export default function LuxuryHero() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openAuthModal = useUIStore(state => state.openAuthModal);

  const [step, setStep] = React.useState<
    "services" | "quick-ride-inputs" | "quick-ride-types" | "success" | "coming-soon" |
    "schedule-select" | "road-wizard" | "flight-wizard" | "courier-wizard" | "courier-dispatch-wizard"
  >("services");
  const [servicesPage, setServicesPage] = React.useState(0);
  const [pickup, setPickup] = React.useState("");
  const [dropoff, setDropoff] = React.useState("");
  const [selectedService, setSelectedService] = React.useState<any>(null);
  const [selectedRideType, setSelectedRideType] = React.useState<any>(null);
  const [pendingRideType, setPendingRideType] = React.useState<any>(null);


  const [distance, setDistance] = React.useState(0);
  const [estimatedFare, setEstimatedFare] = React.useState(0);
  const [isEstimating, setIsEstimating] = React.useState(false);
  const [isDrawerMinimized, setIsDrawerMinimized] = React.useState(false);
  const [pickupCoords, setPickupCoords] = React.useState<any>(null);
  const [dropoffCoords, setDropoffCoords] = React.useState<any>(null);
  const [isPickupDirty, setIsPickupDirty] = React.useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = React.useState(false);
  const [currencyInfo, setCurrencyInfo] = React.useState({
    code: 'NGN',
    symbol: '₦',
    rate: 1500,
    pricing: { baseFare: 0.50, perKm: 0.12, perMin: 0.02, minFare: 1.00 }
  });

  // ── Ride Types: fetched from API on mount ─────────────────────────────────
  const iconMap: { [key: string]: any } = {
    Car,
    Zap,
    Crown,
    Sparkles
  };

  const FALLBACK_RIDE_TYPES = [
    { id: 'economy', title: 'Fair', description: 'Affordable and reliable daily commute', multiplier: 1.0, icon: Car },
    { id: 'swift', title: 'Swift', description: 'Fastest pickup nearby', multiplier: 1.25, icon: Zap },
    { id: 'luxury', title: 'Luxury', description: 'Premium comfort and luxury sedans', multiplier: 2.0, icon: Crown },
    { id: 'epic', title: 'Epic', description: 'The ultimate premium ride experience', multiplier: 3.5, icon: Sparkles },
  ];
  const [rideTypes, setRideTypes] = React.useState<any[]>(FALLBACK_RIDE_TYPES);
  const [rideTypesLoading, setRideTypesLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRideTypes = async () => {
      try {
        const { data } = await apiClient.get('/rides/types');
        const fetched = data?.data || [];
        if (fetched.length > 0) {
          // Map API response back to component-friendly shape using iconMap helper
          setRideTypes(fetched.map((rt: any) => ({ ...rt, icon: iconMap[rt.icon] || Car })));
        }
      } catch (err) {
        console.warn('[QueensHero] Could not fetch ride types from API, using fallback.', err);
      } finally {
        setRideTypesLoading(false);
      }
    };
    fetchRideTypes();
  }, []);


  const services = [
    {
      id: "quick-ride",
      title: "Quick Ride",
      description: "Get a ride in minutes. Fast, on-demand luxury travel.",
      icon: Zap,
      flow: "quick-ride",
    },
    {
      id: "schedule-ride",
      title: "Schedule Ride",
      description: "Book a ride for a later time or date.",
      icon: CalendarDays,
      flow: "schedule-select",
    },
    {
      id: "flight",
      title: "Flight",
      description: "Private charter and VIP airport transfers.",
      icon: Plane,
      flow: "flight-wizard",
    },
    {
      id: "road-travel",
      title: "Road Travel (Inter City)",
      description: "Premium travel between cities.",
      icon: Compass,
      flow: "road-wizard",
    },
    {
      id: "courier",
      title: "Courier",
      description: "Fast, secure documents & parcel delivery.",
      icon: Package,
      flow: "courier-dispatch-wizard",
    },
    {
      id: "logistics-fleet",
      title: "Logistics Fleet",
      description: "Manage cargo & bulk shipments.",
      icon: Truck,
      flow: "coming-soon",
    },
    {
      id: "api-integration",
      title: "API Integration",
      description: "Connect our services to your app/website.",
      icon: Code,
      flow: "coming-soon",
    },
    {
      id: "business",
      title: "Business",
      description: "Corporate travel accounts and perks.",
      icon: Briefcase,
      flow: "coming-soon",
    },
  ];


  const PAGE_SIZE = 4;
  const pageCount = Math.ceil(services.length / PAGE_SIZE);
  const currentServices = services.slice(
    servicesPage * PAGE_SIZE,
    (servicesPage + 1) * PAGE_SIZE
  );

  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    if (service.flow === "quick-ride") {
      setStep("quick-ride-inputs");
    } else if (service.flow === "schedule-select") {
      setStep("schedule-select");
    } else if (service.flow === "road-wizard") {
      setStep("road-wizard");
    } else if (service.flow === "courier-dispatch-wizard") {
      setStep("courier-dispatch-wizard");
    } else if (service.flow === "flight-wizard") {
      setStep("flight-wizard");
    } else {
      setStep("coming-soon");
    }
  };

  const handleProceedClick = () => {
    if (pickup.trim() && dropoff.trim()) {
      setStep("quick-ride-types");
    }
  };

  const handleRideTypeSelect = (ride: any) => {
    setSelectedRideType(ride);
    if (pickup.trim() && dropoff.trim()) {
      if (!isAuthenticated) {
        // Save the intent so the effect below can resume it after login
        setPendingRideType(ride);
        openAuthModal('login');
        return;
      }
      navigate('/book-ride', {
        state: {
          pickup: { address: pickup, ...pickupCoords },
          destination: { address: dropoff, ...dropoffCoords },
          estimatedFare: estimatedFare * ride.multiplier,
          rideCategory: ride.id
        }
      });
    }
  };

  // Resume booking automatically once user logs in via modal
  React.useEffect(() => {
    if (isAuthenticated && pendingRideType && pickup.trim() && dropoff.trim()) {
      const ride = pendingRideType;
      setPendingRideType(null);
      navigate('/book-ride', {
        state: {
          pickup: { address: pickup, ...pickupCoords },
          destination: { address: dropoff, ...dropoffCoords },
          estimatedFare: estimatedFare * ride.multiplier,
          rideCategory: ride.id
        }
      });
    }
  }, [isAuthenticated]);


  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371, toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getEstimatedPrice = (ride: any) => {
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

    const finalFare = Math.round(fareToDisplay * ride.multiplier);
    return `${currencyInfo.symbol}${finalFare.toLocaleString()}`;
  };

  // Permission Verification
  React.useEffect(() => {
    const checkPermission = async () => {
      const isDismissed = localStorage.getItem('location_prompt_dismissed');
      if (isDismissed) return;

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as any });
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
  const lastCoordsRef = React.useRef({ lat: 0, lng: 0 });

  React.useEffect(() => {
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
  React.useEffect(() => {
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
              pricing: data.data.pricing || { baseFare: 0.50, perKm: 0.12, perMin: 0.02, minFare: 1.00 }
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
  React.useEffect(() => {
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

  const resetWizard = () => {
    setStep("services");
    setPickup("");
    setDropoff("");
    setSelectedService(null);
    setSelectedRideType(null);
    setServicesPage(0);
    setDistance(0);
    setEstimatedFare(0);
    setPickupCoords(null);
    setDropoffCoords(null);
    setIsPickupDirty(false);
  };

  const toggleDrawer = () => setIsDrawerMinimized(!isDrawerMinimized);

  return (
    <>
      <style>{`
      
      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      .gold{

background:
linear-gradient(
90deg,
#f5e2a8,
#d4af37,
#fff2b6,
#d4af37
);

background-size:300%;

-webkit-background-clip:text;
-webkit-text-fill-color:transparent;

animation:goldFlow 8s linear infinite;
}

      :root{
        --gold:#D4AF37;

        
        --gold-light:#E5C76B;
        --black:#040404;
        --card:#0A0A0D;
        --white:#FFFFFF;
        --text:rgba(255,255,255,.75);
        --border:rgba(255,255,255,.08);
      }

      body{
        background:#000;
        font-family: Inter, sans-serif;
      }

      .hero{
        position:relative;
        min-height:100vh;
        overflow:hidden;
        color:white;

        linear-gradient(
    180deg,
    rgba(0,0,0,.4),
    rgba(0,0,0,.92)
),
radial-gradient(
    circle at 20% 10%,
    rgba(212,175,55,.06),
    transparent 45%
),
        url("https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000");

        background-size:cover;
        background-position:center;
      }


.hero::before{
    content:"";
    position:absolute;
    inset:0;

    background:
    linear-gradient(
        90deg,
        rgba(0,0,0,.65),
        rgba(0,0,0,.25)
    );

    z-index:1;
}

      .overlay{
        position:absolute;
        inset:0;
        background:
        radial-gradient(circle at 20% 20%,
        rgba(212,175,55,.08),
        transparent 40%);
      }

      .container{
        width:min(1400px,92%);
        margin:auto;
        position:relative;
        z-index:5;
      }

      .navbar{
        height:100px;
        display:flex;
        align-items:center;
        justify-content:space-between;
      }

      .logo{
        display:flex;
        align-items:center;
        gap:14px;
        color:var(--gold);
        font-size:2rem;
        letter-spacing:4px;
      }

      .nav-links{
        display:flex;
        gap:50px;
      }

      .nav-links a{
        color:white;
        text-decoration:none;
        font-size:16px;
      }

      .nav-links a.active{
        color:var(--gold);
        position:relative;
      }

      .nav-links a.active::after{
        content:"";
        position:absolute;
        left:0;
        bottom:-12px;
        width:100%;
        height:2px;
        background:var(--gold);
      }

      .nav-actions{
        display:flex;
        gap:16px;
        align-items:center;
      }

      .login-btn{
        color:white;
        background:none;
        border:none;
        font-size:16px;
      }

      .signup-btn{
        background:var(--gold);
        color:black;
        border:none;
        padding:14px 28px;
        border-radius:10px;
        font-weight:600;
      }

      .hero-content{
        display:grid;
        grid-template-columns:1.1fr .9fr;
        align-items:center;
        gap:80px;
        min-height:calc(100vh - 180px);
      }

      .badge{
        display:inline-flex;
        align-items:center;
        gap:10px;
        border:1px solid rgba(212,175,55,.5);
        color:var(--gold);
        padding:12px 22px;
        border-radius:999px;
        margin-bottom:30px;
        backdrop-filter:blur(10px);
      }

      .title{
        font-family: Georgia, serif;
        font-size:clamp(4rem,8vw,7rem);
        line-height:.95;
        font-weight:400;
      }

      .gold{
        color:var(--gold);
      }

      .description{
        margin-top:30px;
        max-width:700px;
        color:var(--text);
        font-size:1.4rem;
        line-height:1.8;
      }

      .features{
        display:flex;
        gap:50px;
        margin-top:45px;
      }

      .feature{
        display:flex;
        gap:14px;
        align-items:flex-start;
      }

      .feature svg{
        color:var(--gold);
      }

      .feature-title{
        font-size:1.1rem;
        line-height:1.5;
      }

      .actions{
        margin-top:45px;
        display:flex;
        gap:20px;
      }


      .primary-btn{
    position:relative;
    overflow:hidden;
}
    

      .primary-btn{
        background:var(--gold);
        color:black;
        border:none;
        height:64px;
        padding:0 34px;
        border-radius:12px;
        display:flex;
        align-items:center;
        gap:12px;
        font-size:1rem;
        font-weight:700;
        position:relative;
    overflow:hidden;
      }





     .primary-btn::before{

    content:"";

    position:absolute;

    width:40%;
    height:200%;

    top:-50%;
    left:-100%;

    background:
      rgba(255,255,255,.25);

    transform:rotate(25deg);

    transition:.7s;
}

.primary-btn:hover::before{
    left:150%;
}

      .secondary-btn{
        background:transparent;
        color:white;
        border:1px solid rgba(255,255,255,.15);
        height:64px;
        padding:0 34px;
        border-radius:12px;
      }

      .booking-card{
        position:relative;
        z-index:10;

        background:
        linear-gradient(
          180deg,
          rgba(15,15,18,.9),
          rgba(8,8,10,.85)
        );

        backdrop-filter:blur(18px);

        border:1px solid rgba(255,255,255,.08);

        border-radius:32px;

        padding:35px;
      }

      .card-title{
        text-align:center;
        font-size:2.5rem;
        font-family:Georgia, serif;
      }

      .card-sub{
        text-align:center;
        color:var(--text);
        margin-top:10px;
        margin-bottom:30px;
      }

      .field{
        height:78px;
        border:1px solid var(--border);
        border-radius:18px;
        display:flex;
        align-items:center;
        gap:15px;
        padding:0 22px;
        margin-bottom:16px;
        background:rgba(255,255,255,.02);
      }

      .field svg{
        color:white;
        opacity:.85;
      }

      .field-content{
        flex:1;
      }

      .label{
        font-size:.85rem;
        color:rgba(255,255,255,.5);
      }

      .value{
        margin-top:4px;
        color:white;
      }

      .row{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:16px;
      }

      .quote-btn{
        margin-top:18px;
        width:100%;
        height:72px;
        border:none;
        background:var(--gold);
        color:black;
        border-radius:18px;
        font-size:1.2rem;
        font-weight:700;
        position: relative;


      }

      .quote-btn::after{

content:"";

position:absolute;

inset:-5px;

background:#D4AF37;

filter:blur(20px);

opacity:.3;

z-index:-1;
}

      .bottom-features{
        display:flex;
        justify-content:center;
        gap:30px;
        margin-top:30px;
        color:rgba(255,255,255,.75);
      }

      .bottom-item{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .bottom-item svg{
        color:var(--gold);
      }

      .route-svg{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        pointer-events:none;
      }

      .trusted{
        border-top:1px solid rgba(255,255,255,.05);
        margin-top:40px;
        padding:30px 0;
      }

      .trusted-grid{
        display:flex;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:40px;
        color:rgba(255,255,255,.65);
        font-size:2rem;
        font-weight:700;
      }

      @media(max-width:1100px){

        .hero-content{
          grid-template-columns:1fr;
        }

        .booking-card{
          max-width:700px;
          margin:auto;
        }

        .hero-content > div:nth-child(1) {
          order: 2;
        }

        .hero-content > div:nth-child(2) {
          order: 1;
        }
      }

      @media(max-width:768px){

        .nav-links{
          display:none;
        }

        .title{
          font-size:4rem;
        }

        .features{
          flex-direction:column;
        }

        .actions{
          flex-direction:column;
        }

        .row{
          grid-template-columns:1fr;
        }

        .bottom-features{
          flex-direction:column;
          align-items:center;
        }
      }

      @keyframes goldFlow{

0%{
background-position:0%;
}

100%{
background-position:300%;
}
}

      /* Multi-step Wizard Styles */
      .wizard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 16px;
      }

      .back-btn {
        background: transparent;
        border: none;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: color 0.2s;
        padding: 6px 12px;
        border-radius: 8px;
      }

      .back-btn:hover {
        color: var(--gold);
        background: rgba(255, 255, 255, 0.05);
      }

      .wizard-progress {
        font-size: 0.85rem;
        color: var(--gold);
        font-weight: 600;
        letter-spacing: 1px;
      }

      .service-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 380px; /* Keep layout stable during pagination */
      }

      .service-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        width: 100%;
      }

      .service-item:hover {
        background: rgba(212, 175, 55, 0.05);
        border-color: rgba(212, 175, 55, 0.3);
        transform: translateY(-2px);
      }

      .service-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--gold);
        transition: background 0.2s;
      }

      .service-item:hover .service-icon-wrapper {
        background: rgba(212, 175, 55, 0.1);
      }

      .service-details {
        flex: 1;
      }

      .service-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: white;
        margin-bottom: 2px;
      }

      .service-description {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.5);
        line-height: 1.35;
      }

      .service-arrow {
        color: rgba(255, 255, 255, 0.3);
        transition: transform 0.2s, color 0.2s;
        display: flex;
        align-items: center;
      }

      .service-item:hover .service-arrow {
        color: var(--gold);
        transform: translateX(4px);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 20px;
      }

      .pagination-arrow {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pagination-arrow:hover:not(:disabled) {
        background: rgba(212, 175, 55, 0.1);
        border-color: var(--gold);
        color: var(--gold);
      }

      .pagination-arrow:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .pagination-dots {
        display: flex;
        gap: 8px;
      }

      .pagination-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        transition: all 0.2s;
      }

      .pagination-dot.active {
        background: var(--gold);
        width: 18px;
        border-radius: 4px;
      }

      /* Ride Type Styles */
      .ride-type-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 350px;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: 20px;
      }

      /* Custom scrollbar for ride type list */
      .ride-type-list::-webkit-scrollbar {
        width: 6px;
      }
      .ride-type-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .ride-type-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      .ride-type-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .ride-type-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 18px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        width: 100%;
      }

      .ride-type-item:hover {
        background: rgba(212, 175, 55, 0.05);
        border-color: rgba(212, 175, 55, 0.3);
        transform: translateY(-1px);
      }

      .ride-type-item.selected {
        background: rgba(212, 175, 55, 0.08);
        border-color: var(--gold);
      }

      .ride-type-price {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--gold);
        margin-left: auto;
      }

      /* Success Screen Styles */
      .success-card {
        text-align: center;
        padding: 20px 10px;
      }

      .success-icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(212, 175, 55, 0.1);
        color: var(--gold);
        margin-bottom: 20px;
      }

      .success-title {
        font-size: 1.8rem;
        font-family: Georgia, serif;
        margin-bottom: 12px;
      }

      .success-message {
        color: var(--text);
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 24px;
      }

      .receipt-details {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px;
        text-align: left;
        margin-bottom: 28px;
      }

      .receipt-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 0.9rem;
      }

      .receipt-row:last-child {
        margin-bottom: 0;
        border-top: 1px solid var(--border);
        padding-top: 12px;
        margin-top: 12px;
      }

      .receipt-label {
        color: rgba(255, 255, 255, 0.5);
      }

      .receipt-value {
        color: white;
        font-weight: 600;
        text-align: right;
      }

      .receipt-value.price {
        color: var(--gold);
        font-weight: 700;
      }

      /* Input styling inside the fields */
      .wizard-input {
        background: transparent;
        border: none;
        color: white;
        font-size: 1rem;
        width: 100%;
        height: 100%;
        outline: none;
        padding: 24px 0;
        flex: 1;
      }
      .wizard-input::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }

      /* Coming soon styling */
      .coming-soon-card {
        text-align: center;
        padding: 40px 20px;
      }
      .coming-soon-title {
        font-size: 1.6rem;
        font-family: Georgia, serif;
        margin-bottom: 12px;
        color: var(--gold);
      }
      .coming-soon-msg {
        color: var(--text);
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 24px;
      }

      .field-wrapper {
        position: relative;
        margin-bottom: 0px;
      }

      .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 13, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        margin-top: -12px;
        margin-bottom: 16px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      }

      .suggestions-dropdown::-webkit-scrollbar {
        width: 4px;
      }
      .suggestions-dropdown::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }

      .suggestion-dropdown-item {
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.85rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .suggestion-dropdown-item:last-child {
        border-bottom: none;
      }

      .suggestion-dropdown-item:hover {
        background: rgba(212, 175, 55, 0.08);
        color: var(--gold);
      }

      .spinner-small {
        margin-left: 8px;
        flex-shrink: 0;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Mobile Bottom Drawer Styles */
      @media(min-width: 1101px) {
        .desktop-hidden-drawer {
          display: none !important;
        }
      }

      .bottom-drawer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(10, 10, 13, 0.96);
        backdrop-filter: blur(20px);
        border-top: 1px solid var(--border);
        border-radius: 24px 24px 0 0;
        z-index: 1000;
        padding-bottom: 24px;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
      }

      .drawer-header-strip {
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .drawer-handle {
        width: 40px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }

      .drawer-toggle-btn {
        position: absolute;
        right: 20px;
        background: transparent;
        border: none;
        color: var(--gold);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .drawer-content {
        padding: 20px;
        max-height: 50vh;
        overflow-y: auto;
      }

      /* Sub-wizard container styles */
      .sub-wizard-container {
        position: relative;
        max-height: 480px;
        overflow-y: auto;
        padding: 4px;
      }

      .live-badge {
        flex-shrink: 0;
        background: var(--gold);
        color: black;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 99px;
        letter-spacing: 0.5px;
      }

      /* Quick ride type drawer item cards */
      .ride-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 10px;
      }
      .ride-card.active {
        border-color: var(--gold);
        background: rgba(212, 175, 55, 0.05);
      }
      .ride-info h6 {
        font-size: 1rem;
        font-weight: 600;
        color: white;
        margin: 0 0 2px 0;
      }
      .ride-info p {
        font-size: 0.85rem;
        color: var(--gold);
        font-weight: 700;
        margin: 0;
      }
      `}</style>

      <section className="hero">
        <div className="overlay" />

        {/* Animated Route */}
        <svg className="route-svg" viewBox="0 0 1600 900">
          <motion.path
            d="M150 700 C 400 500, 700 650, 950 350 S 1250 180, 1450 150"
            fill="transparent"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeDasharray="10 10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>

        <div className="container">
          {/* <nav className="navbar">
            <div className="logo">♛ QUEENS</div>

            <div className="nav-links">
              <a className="active" href="#">
                Home
              </a>
              <a href="#">Services</a>
              <a href="#">Fleet</a>
              <a href="#">About</a>
              <a href="#">Corporate</a>
            </div>

            <div className="nav-actions">
              <button className="login-btn">Log in</button>
              <button className="signup-btn">Sign up</button>
            </div>
          </nav> */}

          <div className="hero-content">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="badge">
                ✦ Queens -OS TRANSPORTATION
              </div>

              <h1 className="title">
                Easy Travel,
                <br />
                on <span className="gold">your schedule.</span>
              </h1>

              <p className="description">
                Executive rides, airport transfers, and premium chauffeur
                services. Fixed pricing, professional drivers, 24/7
                availability.
              </p>

              <div className="features">
                <div className="feature">
                  <ShieldCheck />
                  <div className="feature-title">
                    Vetted
                    <br />
                    Drivers
                  </div>
                </div>

                <div className="feature">
                  <BadgeCheck />
                  <div className="feature-title">
                    24/7
                    <br />
                    Availability
                  </div>
                </div>

                <div className="feature">
                  <CreditCard />
                  <div className="feature-title">
                    Fixed
                    <br />
                    Pricing
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="primary-btn" onClick={() => navigate("/ride")}>
                  Book Your Ride
                  <ArrowRight size={18} />
                </button>

                <button className="secondary-btn">
                  View Fleet
                </button>
              </div>
            </motion.div>




            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
            >
              <div className="booking-card">
                {/* Step 1: Services Selection */}
                {step === "services" && (
                  <div>
                    <h2 className="card-title">Our Services</h2>
                    <div className="card-sub" style={{ marginBottom: "20px" }}>
                      Select a service to start your journey
                    </div>

                    <div className="service-list">
                      {currentServices.map((service) => {
                        const ServiceIcon = service.icon;
                        return (
                          <button
                            key={service.id}
                            className="service-item"
                            onClick={() => handleServiceClick(service)}
                          >
                            <div className="service-icon-wrapper">
                              <ServiceIcon size={22} />
                            </div>
                            <div className="service-details">
                              <div className="service-title">{service.title}</div>
                              <div className="service-description">
                                {service.description}
                              </div>
                            </div>
                            <div className="service-arrow">
                              <ChevronRight size={20} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                      <button
                        className="pagination-arrow"
                        disabled={servicesPage === 0}
                        onClick={() => setServicesPage((p) => p - 1)}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="pagination-dots">
                        {Array.from({ length: pageCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`pagination-dot ${servicesPage === idx ? "active" : ""
                              }`}
                            onClick={() => setServicesPage(idx)}
                          />
                        ))}
                      </div>

                      <button
                        className="pagination-arrow"
                        disabled={servicesPage === pageCount - 1}
                        onClick={() => setServicesPage((p) => p + 1)}
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Quick Ride Inputs */}
                {step === "quick-ride-inputs" && (
                  <div>
                    <div className="wizard-header">
                      <button className="back-btn" onClick={resetWizard}>
                        <ArrowLeft size={16} />
                        Services
                      </button>
                      <div className="wizard-progress">Step 1 of 2</div>
                    </div>

                    <h2 className="card-title" style={{ fontSize: "2rem", marginBottom: "24px" }}>
                      Enter Locations
                    </h2>

                    <div className="field" style={{ position: "relative" }}>
                      <LocationSearch
                        placeholder="Where do we pick you up?"
                        value={pickup}
                        onChange={(val) => {
                          setPickup(val);
                          setIsPickupDirty(true);
                        }}
                        onLocationSelect={(loc) => {
                          setPickupCoords(loc);
                          setIsPickupDirty(true);
                        }}
                        className="wizard-input"
                        icon={<MapPin style={{ marginRight: "10px", flexShrink: 0 }} />}
                      />
                      {!isPickupDirty && pickup && (
                        <span className="live-badge" style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)" }}>LIVE</span>
                      )}
                    </div>

                    <div className="field">
                      <LocationSearch
                        placeholder="Where are you going?"
                        value={dropoff}
                        onChange={(val) => setDropoff(val)}
                        onLocationSelect={(loc) => setDropoffCoords(loc)}
                        className="wizard-input"
                        icon={<Flag style={{ marginRight: "10px", flexShrink: 0 }} />}
                      />
                    </div>

                    <button
                      className="quote-btn"
                      onClick={handleProceedClick}
                      disabled={!pickup.trim() || !dropoff.trim()}
                      style={{
                        opacity: (!pickup.trim() || !dropoff.trim()) ? 0.5 : 1,
                        cursor: (!pickup.trim() || !dropoff.trim()) ? "not-allowed" : "pointer"
                      }}
                    >
                      {isEstimating ? "Calculating Route..." : "Proceed to Vehicles"}
                    </button>
                  </div>
                )}

                {/* Step 3: Choose Ride Type */}
                {step === "quick-ride-types" && (
                  <div>
                    <div className="wizard-header">
                      <button className="back-btn" onClick={() => setStep("quick-ride-inputs")}>
                        <ArrowLeft size={16} />
                        Locations
                      </button>
                      <div className="wizard-progress">Step 2 of 2</div>
                    </div>

                    <h2 className="card-title" style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      Select Vehicle
                    </h2>
                    <div className="card-sub" style={{ marginBottom: "20px" }}>
                      Choose your luxury class
                    </div>

                    <div className="ride-type-list">
                      {rideTypesLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                              height: '68px', borderRadius: '12px',
                              background: 'linear-gradient(90deg, rgba(212,175,55,0.06) 25%, rgba(212,175,55,0.12) 50%, rgba(212,175,55,0.06) 75%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.4s infinite',
                            }} />
                          ))}
                        </div>
                      ) : (
                        rideTypes.map((type) => {
                          const VehicleIcon = type.icon;
                          return (
                            <button
                              key={type.id}
                              className={`ride-type-item ${selectedRideType?.id === type.id ? "selected" : ""}`}
                              onClick={() => handleRideTypeSelect(type)}
                            >
                              <div className="service-icon-wrapper" style={{ background: "rgba(212, 175, 55, 0.05)" }}>
                                <VehicleIcon size={22} />
                              </div>
                              <div className="service-details">
                                <div className="service-title">{type.title}</div>
                                <div className="service-description">
                                  {type.description}
                                </div>
                              </div>
                              <div className="ride-type-price">
                                {getEstimatedPrice(type)}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Success Screen */}
                {step === "success" && (
                  <div className="success-card">
                    <div className="success-icon-wrapper">
                      <CheckCircle2 size={36} />
                    </div>
                    <h2 className="success-title">Booking Confirmed</h2>
                    <p className="success-message">
                      Your premium ride has been scheduled successfully. Your chauffeur will arrive shortly.
                    </p>

                    <div className="receipt-details">
                      <div className="receipt-row">
                        <span className="receipt-label">Service</span>
                        <span className="receipt-value">Quick Ride</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Pickup</span>
                        <span className="receipt-value">{pickup}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Destination</span>
                        <span className="receipt-value">{dropoff}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Vehicle Class</span>
                        <span className="receipt-value">{selectedRideType?.title}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Estimated Fare</span>
                        <span className="receipt-value price">{selectedRideType ? getEstimatedPrice(selectedRideType) : "--"}</span>
                      </div>
                    </div>

                    <button className="quote-btn" onClick={resetWizard}>
                      Book Another Ride
                    </button>
                  </div>
                )}

                {/* Step 5: Coming Soon Placeholder */}
                {step === "coming-soon" && (
                  <div className="coming-soon-card">
                    <div className="wizard-header" style={{ borderBottom: "none", marginBottom: 0 }}>
                      <button className="back-btn" onClick={resetWizard}>
                        <ArrowLeft size={16} />
                        Back to Services
                      </button>
                    </div>

                    <div className="success-icon-wrapper" style={{ color: "var(--gold)", background: "rgba(212, 175, 55, 0.05)" }}>
                      {selectedService ? (
                        React.createElement(selectedService.icon, { size: 32 })
                      ) : (
                        <Zap size={32} />
                      )}
                    </div>

                    <h2 className="coming-soon-title">
                      {selectedService?.title || "Coming Soon"}
                    </h2>
                    <p className="coming-soon-msg">
                      The customized booking flow for {selectedService?.title || "this service"} is under development and will be defined later.
                      Please contact our concierge support for VIP bookings.
                    </p>

                    <button className="quote-btn" onClick={resetWizard}>
                      Return to Services
                    </button>
                  </div>
                )}

                {/* Step 6: Schedule Category Selector */}
                {step === "schedule-select" && (
                  <div>
                    <div className="wizard-header" style={{ borderBottom: "none", marginBottom: 0 }}>
                      <button className="back-btn" onClick={resetWizard}>
                        <ArrowLeft size={16} />
                        Back to Services
                      </button>
                    </div>
                    <ScheduleCategorySelector
                      onSelect={(id) => {
                        if (id === 'road') setStep('road-wizard');
                        if (id === 'flight') setStep('flight-wizard');
                        if (id === 'courier_dispatch') setStep('courier-dispatch-wizard');
                        if (id === 'courier_shipping') navigate('/shipping');
                        if (id === 'train') alert('Train booking coming soon!');
                        if (id === 'api') alert('API Integration package coming soon!');
                        if (id === 'custom') alert('Suggest more service listing!');
                      }}
                    />
                  </div>
                )}

                {/* Step 7: Road Trip Wizard */}
                {step === "road-wizard" && (
                  <div className="sub-wizard-container">
                    <RoadTripWizard
                      onBack={() => setStep('schedule-select')}
                      onComplete={(itineraries) => {
                        console.log("Finalized road trip:", itineraries);
                        navigate('/checkout', { state: { bookingType: 'PLANNED', itineraries } });
                      }}
                    />
                  </div>
                )}

                {/* Step 8: Quick Dispatch Wizard */}
                {step === "courier-dispatch-wizard" && (
                  <div className="sub-wizard-container">
                    <QuickDispatchWizard
                      onBack={() => setStep('schedule-select')}
                    />
                  </div>
                )}

                {/* Step 9: Flight Scheduler Wizard */}
                {step === "flight-wizard" && (
                  <div className="sub-wizard-container">
                    <FlightWizard
                      onBack={() => navigate("/flights")}

                    />
                  </div>
                )}

                {/* Step 10: Courier Wizard */}
                {step === "courier-wizard" && (
                  <div className="sub-wizard-container">
                    <CourierWizard
                      onBack={() => setStep('services')}
                    />
                  </div>
                )}

                {/* Original trust elements / benefits inside the card */}
                {step === "services" && (
                  <div className="bottom-features">
                    <div className="bottom-item">
                      <CreditCard size={18} />
                      No Hidden Fees
                    </div>

                    <div className="bottom-item">
                      <ShieldCheck size={18} />
                      Safe & Secure
                    </div>

                    <div className="bottom-item">
                      <Zap size={18} />
                      Instant Booking
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          <motion.circle
            cx={150}
            cy={700}
            animate={{
              cx: [150, 400, 700, 1000, 1450],
              cy: [700, 520, 650, 280, 150]
            }}
          />


          <motion.div
            className="floating-pin"
            animate={{
              y: [0, -12, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <MapPin />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 40
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
          >
            <div className="trusted">
              <div className="trusted-grid">
                <span>Google</span>
                <span>Booking.com</span>
                <span>American Express</span>
                <span>Deloitte</span>
                <span>Microsoft</span>
                <span>Airbnb</span>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showLocationPrompt && (
            <LocationRequestModal
              onEnable={handleEnableLocation}
              onReject={handleRejectLocation}
            />
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
                <button className="drawer-toggle-btn" onClick={toggleDrawer}>
                  {isDrawerMinimized ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              <div className="drawer-content">
                <AnimatePresence mode="wait">
                  {step === 'quick-ride-types' && (
                    <motion.div key="mobile-now" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="ride-selector-section px-3">
                        <div className="ride-types">
                          {rideTypes.map((ride) => (
                            <div
                              key={ride.id}
                              className={`ride-card ${selectedRideType?.id === ride.id ? "active" : ""}`}
                              onClick={() => setSelectedRideType(ride)}
                            >
                              <div className="ride-icon">
                                {React.createElement(ride.icon || Car, { size: 22 })}
                              </div>
                              <div className="ride-info">
                                <h6>{ride.title}</h6>
                                <p>{getEstimatedPrice(ride)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <button
                          className="quote-btn w-100"
                          onClick={() => handleRideTypeSelect(selectedRideType)}
                          disabled={!pickup.trim() || !dropoff.trim() || isEstimating || !selectedRideType}
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
    </>
  );
}