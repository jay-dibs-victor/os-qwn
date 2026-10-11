import React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

export default function LuxuryHero() {
    return (
        <>
            <style>{`
      
      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
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

        background:
        linear-gradient(
          to bottom,
          rgba(0,0,0,.65),
          rgba(0,0,0,.85)
        ),
        url("https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000");

        background-size:cover;
        background-position:center;
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
                    <nav className="navbar">
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
                    </nav>

                    <div className="hero-content">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="badge">
                                ✦ PREMIUM CHAUFFEURED TRANSPORTATION
                            </div>

                            <h1 className="title">
                                Luxury travel,
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
                                <button className="primary-btn">
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
                                <h2 className="card-title">Book Your Journey</h2>

                                <div className="card-sub">
                                    Get instant quotes and book in seconds.
                                </div>

                                <div className="field">
                                    <MapPin />
                                    <div className="field-content">
                                        <div className="label">Pickup location</div>
                                        <div className="value">Enter pickup location</div>
                                    </div>
                                </div>

                                <div className="field">
                                    <Flag />
                                    <div className="field-content">
                                        <div className="label">Destination</div>
                                        <div className="value">Enter destination</div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="field">
                                        <CalendarDays />
                                        <div className="field-content">
                                            <div className="label">Date</div>
                                            <div className="value">Select date</div>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <Clock3 />
                                        <div className="field-content">
                                            <div className="label">Time</div>
                                            <div className="value">Select time</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <Users />
                                    <div className="field-content">
                                        <div className="label">Passengers</div>
                                        <div className="value">1 Passenger</div>
                                    </div>
                                </div>

                                <button className="quote-btn">
                                    Get Instant Quote
                                </button>

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
                                        Instant Confirmation
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

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
                </div>
            </section>
        </>
    );
}