import React from "react";
import { motion } from "framer-motion";
import {
    Crown,
    MapPin,
    Flag,
    CalendarDays,
    Clock3,
    Users,
    ShieldCheck,
    CreditCard,
    Zap,
    ArrowRight,
    ChevronDown,
} from "lucide-react";

const navItems = ["Home", "Services", "Fleet", "About", "Corporate"];

export default function Hero() {
    return (
        <>
            <style>{`
        :root{
          --gold:#D8B25A;
          --gold-light:#E7C97B;
          --bg:#020202;
          --card:#0A0A0A;
          --border:rgba(255,255,255,.08);
          --text:rgba(255,255,255,.72);
        }

        *{box-sizing:border-box;margin:0;padding:0}

        .hero{
          position:relative;
          min-height:100vh;
          overflow:hidden;
          color:#fff;
          font-family:Inter,sans-serif;

          background:
            linear-gradient(
              rgba(0,0,0,.75),
              rgba(0,0,0,.92)
            ),
            url("/images/queens-hero-bg.webp");

          background-size:cover;
          background-position:center;
        }

        .hero::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 15% 20%,
            rgba(216,178,90,.08),
            transparent 40%);
        }

        .container{
          position:relative;
          z-index:10;
          width:min(1440px,92%);
          margin:auto;
        }

        .navbar{
          height:100px;
          display:flex;
          align-items:center;
          justify-content:space-between;
        }

        .logo{
          display:flex;
          gap:12px;
          align-items:center;
          color:var(--gold);
          font-family:'Cormorant Garamond',serif;
          font-size:42px;
          letter-spacing:3px;
        }

        .nav{
          display:flex;
          gap:50px;
        }

        .nav-item{
          position:relative;
          color:#fff;
          text-decoration:none;
          font-size:17px;
        }

        .nav-item.active{
          color:var(--gold);
        }

        .nav-item.active::after{
          content:"";
          position:absolute;
          width:100%;
          height:2px;
          background:var(--gold);
          left:0;
          bottom:-12px;
        }

        .auth{
          display:flex;
          gap:18px;
          align-items:center;
        }

        .login{
          background:none;
          border:none;
          color:white;
          font-size:16px;
        }

        .signup{
          background:var(--gold);
          color:#000;
          border:none;
          padding:14px 28px;
          border-radius:10px;
          font-weight:600;
        }

        .hero-grid{
          display:grid;
          grid-template-columns:58% 42%;
          min-height:780px;
          align-items:center;
          gap:40px;
        }

        .badge{
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:12px 22px;
          border-radius:999px;
          color:var(--gold);
          border:1px solid rgba(216,178,90,.5);
          margin-bottom:30px;
        }

        .title{
          font-family:'Cormorant Garamond',serif;
          font-size:110px;
          line-height:.88;
          letter-spacing:-3px;
          max-width:700px;
        }

        .gold{
          color:var(--gold);
        }

        .desc{
          margin-top:30px;
          max-width:650px;
          color:var(--text);
          font-size:1.5rem;
          line-height:1.7;
        }

        .features{
          margin-top:40px;
          display:flex;
          gap:60px;
        }

        .feature{
          display:flex;
          gap:14px;
          align-items:flex-start;
        }

        .feature svg{
          color:var(--gold);
        }

        .cta-row{
          margin-top:45px;
          display:flex;
          gap:20px;
        }

        .primary{
          position:relative;
          overflow:hidden;
          border:none;
          background:linear-gradient(
            180deg,
            #E4C16D,
            #D8B25A
          );
          color:#000;
          padding:20px 34px;
          border-radius:12px;
          display:flex;
          gap:12px;
          align-items:center;
          font-weight:700;
        }

        .primary::before{
          content:"";
          position:absolute;
          width:60%;
          height:200%;
          left:-100%;
          top:-50%;
          background:rgba(255,255,255,.35);
          transform:rotate(25deg);
          transition:.8s;
        }

        .primary:hover::before{
          left:150%;
        }

        .secondary{
          background:transparent;
          color:#fff;
          border:1px solid rgba(255,255,255,.15);
          padding:20px 34px;
          border-radius:12px;
        }

        .booking{
          width:520px;
          margin-left:auto;
          position:relative;

          background:
            linear-gradient(
              180deg,
              rgba(15,15,15,.88),
              rgba(5,5,5,.82)
            );

          backdrop-filter:blur(30px);

          border:1px solid rgba(255,255,255,.08);

          border-radius:32px;

          padding:32px;

          box-shadow:
            0 30px 100px rgba(0,0,0,.65);
        }

        .booking::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.03),
              transparent 35%
            );
          pointer-events:none;
        }

        .booking-title{
          text-align:center;
          font-family:'Cormorant Garamond',serif;
          font-size:3rem;
        }

        .booking-sub{
          text-align:center;
          color:var(--text);
          margin:10px 0 30px;
        }

        .field{
          height:76px;
          display:flex;
          align-items:center;
          gap:15px;
          border-radius:18px;
          border:1px solid var(--border);
          padding:0 20px;
          margin-bottom:16px;
          background:rgba(255,255,255,.02);
        }

        .field-row{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
        }

        .label{
          color:rgba(255,255,255,.5);
          font-size:.85rem;
        }

        .value{
          margin-top:4px;
        }

        .quote{
          width:100%;
          height:72px;
          border:none;
          border-radius:18px;
          margin-top:12px;
          font-size:1.25rem;
          font-weight:700;
          background:linear-gradient(
            180deg,
            #E4C16D,
            #D8B25A
          );
        }

        .security{
          margin-top:28px;
          display:flex;
          justify-content:space-between;
          color:rgba(255,255,255,.75);
        }

        .security-item{
          display:flex;
          align-items:center;
          gap:10px;
        }

        .security svg{
          color:var(--gold);
        }

        .route{
          position:absolute;
          inset:0;
          pointer-events:none;
        }

        .trust-bar{
          position:absolute;
          left:0;
          right:0;
          bottom:0;
          height:120px;
          display:flex;
          align-items:center;

          border-top:
            1px solid rgba(255,255,255,.05);

          backdrop-filter:blur(15px);
        }

        .trust-inner{
          width:min(1440px,92%);
          margin:auto;
          display:flex;
          justify-content:space-between;
          color:rgba(255,255,255,.7);
          font-weight:600;
        }

        @media(max-width:1200px){
          .hero-grid{
            grid-template-columns:1fr;
          }

          .booking{
            width:100%;
            max-width:650px;
            margin:auto;
          }

          .title{
            font-size:80px;
          }
        }

        @media(max-width:768px){
          .nav{
            display:none;
          }

          .title{
            font-size:60px;
          }

          .field-row{
            grid-template-columns:1fr;
          }

          .features{
            flex-direction:column;
          }

          .security{
            flex-direction:column;
            gap:16px;
          }
        }
      `}</style>

            <section className="hero">
                {/* Route Path */}
                <svg
                    className="route"
                    viewBox="0 0 1600 900"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M120 780 C300 740 450 690 620 600 C720 560 790 530 820 470 C840 410 860 330 890 250"
                        fill="none"
                        stroke="#D8B25A"
                        strokeWidth="2"
                        strokeDasharray="3 10"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatDelay: 1,
                        }}
                    />

                    <circle cx="120" cy="780" r="8" fill="#D8B25A" />
                    <circle cx="620" cy="600" r="8" fill="#D8B25A" />
                    <circle cx="820" cy="470" r="8" fill="#D8B25A" />
                </svg>

                <div className="container">
                    <nav className="navbar">
                        <div className="logo">
                            <Crown />
                            QUEENS
                        </div>

                        <div className="nav">
                            {navItems.map((item, i) => (
                                <a
                                    key={item}
                                    href="#"
                                    className={`nav-item ${i === 0 ? "active" : ""}`}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>

                        <div className="auth">
                            <button className="login">Log in</button>
                            <button className="signup">Sign up</button>
                        </div>
                    </nav>

                    <div className="hero-grid">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="badge">
                                ✦ PREMIUM CHAUFFEURED TRANSPORTATION
                            </div>

                            <h1 className="title">
                                Luxury travel,
                                <br />
                                on <span className="gold">your schedule.</span>
                            </h1>

                            <p className="desc">
                                Executive rides, airport transfers, and premium chauffeur
                                services. Fixed pricing, professional drivers, 24/7
                                availability.
                            </p>

                            <div className="features">
                                <div className="feature">
                                    <ShieldCheck />
                                    <div>Vetted Drivers</div>
                                </div>

                                <div className="feature">
                                    <Clock3 />
                                    <div>24/7 Availability</div>
                                </div>

                                <div className="feature">
                                    <CreditCard />
                                    <div>Fixed Pricing</div>
                                </div>
                            </div>

                            <div className="cta-row">
                                <button className="primary">
                                    Book Your Ride
                                    <ArrowRight size={18} />
                                </button>

                                <button className="secondary">
                                    View Fleet
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="booking">
                                <h2 className="booking-title">
                                    Book Your Journey
                                </h2>

                                <p className="booking-sub">
                                    Get instant quotes and book in seconds.
                                </p>

                                {/* form fields here exactly as in screenshot */}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* <div className="trust-bar">
                    <div className="trust-inner">
                        <span>Google</span>
                        <span>Booking.com</span>
                        <span>American Express</span>
                        <span>Deloitte</span>
                        <span>Microsoft</span>
                        <span>Airbnb</span>
                    </div>
                </div> */}
            </section>
        </>
    );
}