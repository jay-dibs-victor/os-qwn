export default function TravelHeroShowcase() {
  const { motion } = require('framer-motion');
  const { useEffect, useMemo, useState } = require('react');
  const {
    MapPin,
    Plane,
    Truck,
    Car,
    Globe2,
    Search,
    Shield,
    ArrowRight,
    Package,
    Bus,
    Clock3,
    Star,
    Navigation,
    Sparkles,
    Wallet,
    ShipWheel,
    Mountain,
    Crown,
    Building2,
    Compass,
    Gem,
    Palmtree,
    Route,
    Waves,
    Map,
    Fuel,
    Camera,
  } = require('lucide-react');

  const [pickup, setPickup] = useState('');
  const [currentHero, setCurrentHero] = useState(0);
  const HERO_DURATION = 8000;
  const [dropoff, setDropoff] = useState('');
  const [pickupResults, setPickupResults] = useState([]);
  const [dropoffResults, setDropoffResults] = useState([]);

  async function searchLocation(query, type) {
    if (!query || query.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();

      if (type === 'pickup') setPickupResults(data.slice(0, 5));
      else setDropoffResults(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(pickup, 'pickup');
    }, 500);

    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(dropoff, 'dropoff');
    }, 500);

    return () => clearTimeout(timer);
  }, [dropoff]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % 11);
    }, HERO_DURATION);

    return () => clearInterval(interval);
  }, []);

  const commonContainer =
    'min-h-screen bg-[#030712] text-white overflow-hidden relative';

  const floatingAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
      },
    },
  };

  const HeroZero = () => (
    <section className="min-h-screen bg-[#050402] text-white overflow-hidden relative flex items-center py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.12),transparent_30%)]" />

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 mb-8">
            <Globe2 size={16} />
            Queens OS Global Mobility Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight">
            Connecting
            <span className="block text-yellow-400">Continents Through</span>
            Mobility Infrastructure.
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mt-8 max-w-2xl">
            Queens OS powers a connected transport ecosystem linking airports,
            fleets, logistics operators, governments and mobility providers
            across Africa, Europe, Asia and the Americas.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <a href="/become-partner" className="padd-spacing rounded-2xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors text-center font-bold">
              Partner With Queens
            </a>

            <a href="#programs" className="padd-spacing rounded-2xl border border-yellow-500/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition text-center font-bold">
              Explore Ecosystem
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[450px] sm:h-[650px] flex items-center justify-center"
        >
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full opacity-90"
          >
            <defs>
              <linearGradient id="goldPath" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>

            <path
              d="M180 250 C350 100 550 120 760 180"
              stroke="url(#goldPath)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 10"
            />

            <path
              d="M260 320 C430 200 650 180 860 260"
              stroke="url(#goldPath)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 10"
            />

            <path
              d="M140 180 C300 50 500 70 680 120"
              stroke="url(#goldPath)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 10"
            />

            <path
              d="M400 360 C520 280 650 260 900 320"
              stroke="url(#goldPath)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 10"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center opacity-20 text-yellow-400">
            <Globe2 size={320} strokeWidth={1} />
          </div>

          {[
            { top: '20%', left: '20%' },
            { top: '35%', left: '65%' },
            { top: '55%', left: '78%' },
            { top: '65%', left: '35%' },
            { top: '28%', left: '48%' },
          ].map((pin, i) => (
            <motion.div
              key={i}
              className="absolute "
              style={pin}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full bg-yellow-500/20 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-yellow-400 border-4 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
              </div>
            </motion.div>
          ))}

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[22%] left-[24%] text-yellow-400"
          >
            <Plane size={24} />
          </motion.div>

          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-[38%] left-[52%] text-yellow-400"
          >
            <Plane size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const HeroOne = () => (
    <section className="min-h-screen bg-[#050402] text-white overflow-hidden relative flex items-center py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(120,53,15,0.22),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="section-inner relative z-10 w-full max-w-5xl"
      >
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 mb-6 text-sm text-yellow-300">
            <Sparkles size={16} />
            Queens OS Transport Operating System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight">
            Powering
            <span className="block text-yellow-400">Mobility Partnerships.</span>
            <span className="block text-zinc-400">Across Africa & Beyond.</span>
          </h1>

          <p className=" mx-auto mt-6 text-zinc-400 text-lg leading-relaxed">
            Queens OS enables transport companies, fleet providers, logistics operators, governments and infrastructure partners to operate within one connected mobility ecosystem.
          </p>
        </div>


      </motion.div>
    </section>
  );

  const HeroTwo = () => (
    <section className="min-h-screen bg-[#030712] text-white overflow-hidden relative flex items-center py-16">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(234,179,8,0.12),transparent_40%,rgba(120,53,15,0.18))]" />

      <div className="section-inner relative z-10 grid lg:grid-cols-2 gap-16 items-center w-full">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-5 py-2 text-blue-300 mb-6">
            <Globe2 size={16} />
            Queens OS Mobility Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Connected
            <br />
            Transport
            <br />
            <span className="text-yellow-400">Operating System.</span>
          </h1>

          <p className="mt-8 text-zinc-400 text-lg leading-relaxed max-w-xl">
            A unified infrastructure layer designed for transport operators, logistics providers, mobility startups, payment partners and smart city ecosystems.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            {[
              ['Send Parcel', Package],
              ['Haulage', Truck],
              ['Travel Tours', Plane],
              ['Airport Pickup', Car],
            ].map(([title, Icon], i) => (
              <motion.a
                href="#programs"
                key={title}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl block padd-spacing"
              >
                <Icon className="text-yellow-400 mb-4" size={28} />
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-zinc-500 text-sm mt-2">
                  Smart booking with real-time tracking.
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />

          <div className="relative bg-gradient-to-br from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] p-6 sm:p-8 shadow-[0_0_100px_rgba(234,179,8,0.12)] overflow-hidden">
            <motion.div
              {...floatingAnimation}
              className="absolute top-6 right-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 text-sm hidden sm:block"
            >
              Nigeria ↔ Ghana ↔ UK ↔ USA
            </motion.div>

            <div className="mt-16 space-y-5 padd-spacing">
              {[
                ['Ride Booking', Car],
                ['Cross Border Shipping', Truck],
                ['Bus & Flight Tours', Plane],
                ['Airport Concierge', Shield],
              ].map(([title, Icon], i) => (
                <div
                  key={title}
                  className="flex items-center padd-spacing margin-bottom-fix justify-between p-5 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                      <Icon className="text-yellow-400" size={22} />
                    </div>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-zinc-500 text-sm">
                        Connected partnership APIs
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="text-zinc-500" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const HeroThree = () => (
    <section className="min-h-screen bg-[#030712] text-white overflow-hidden relative flex items-center py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-5 py-2 text-yellow-300 mb-8">
            <ShipWheel size={16} />
            Queens OS Global Partnership Network
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Building The
            <span className="block text-yellow-400">Future Of Mobility</span>
            <span className="block">Infrastructure.</span>
          </h1>

          <p className="text-zinc-400 text-lg mt-8 max-w-xl leading-relaxed">
            Connecting transport ecosystems through digital infrastructure, payment systems, logistics intelligence and scalable mobility operations.
          </p>

          <div className="flex flex-wrap gap-4 mt-10 ">
            <a href="/become-partner" className="padd-spacing rounded-2xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors text-center font-bold">
              Become A Partner
            </a>

            <a href="#infrastructure" className="padd-spacing  rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors text-center font-bold">
              View Infrastructure
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16">
            {[
              ['24/7', 'Support'],
              ['100+', 'Routes'],
              ['50K+', 'Travelers'],
            ].map(([num, label]) => (
              <div key={label} className="padd-spacing">
                <h3 className="text-3xl font-bold">{num}</h3>
                <p className="text-zinc-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[450px] sm:h-[650px] hidden sm:block"
        >
          <motion.div
            {...floatingAnimation}
            className="absolute padd-spacing top-12 left-10 w-72 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <Mountain className="text-yellow-400 mb-5" size={34} />
            <h3 className="text-2xl font-bold">Mountain Escape</h3>
            <p className="text-zinc-400 mt-2">
              Scenic transport & guided tour packages.
            </p>
          </motion.div>

          <motion.div
            {...floatingAnimation}
            className="absolute bottom-12 padd-spacing right-0 w-80 rounded-[32px] border border-white/10 bg-gradient-to-br from-yellow-500/10 to-amber-900/20 backdrop-blur-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-zinc-400">Premium Tour</p>
                <h3 className="text-4xl font-black">Lagos → Accra</h3>
              </div>
              <Plane className="text-yellow-400" size={36} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Hotel Included</span>
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span>Airport Pickup</span>
                <Shield className="text-yellow-400" size={16} />
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span>Instant Booking</span>
                <Clock3 className="text-yellow-400" size={16} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const HeroFour = () => (
    <section className="min-h-screen bg-[#030712] text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="section-inner relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-5 py-2 text-yellow-300 mb-6">
            <Wallet size={16} />
            Queens OS Ecosystem Layer
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight">
            The Future
            <br />
            of Transport Infrastructure.
          </h1>

          <p className="max-w-3xl mx-auto mt-8 text-zinc-400 text-xl leading-relaxed">
            Queens OS empowers mobility operators with scalable ride systems, logistics intelligence, dispatch infrastructure, payment integrations and fleet technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            {
              title: 'Ride System',
              icon: Car,
              desc: 'Book AI optimized rides and airport transfers.',
            },
            {
              title: 'Freight Logistics',
              icon: Truck,
              desc: 'Heavy haulage with intelligent fleet management.',
            },
            {
              title: 'Travel Booking',
              icon: Bus,
              desc: 'Tours, buses, trains and international journeys.',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -8 }}
              className="group padd-spacing rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-yellow-500/10 to-amber-900/20" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                  <card.icon className="text-yellow-400" size={30} />
                </div>

                <h3 className="text-3xl font-bold">{card.title}</h3>
                <p className="text-zinc-400 mt-5 leading-relaxed">
                  {card.desc}
                </p>

                <a href="/become-partner" className="mt-10 inline-flex items-center gap-3 text-yellow-400 font-medium hover:text-yellow-300">
                  Explore Partnership
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroFive = () => (
    <section className="min-h-screen bg-[#030712] text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b1708] via-[#0b0907] to-black" />

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 mb-6">
            <Plane size={16} />
            Cross-Border Transport Ecosystem
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Africa’s
            <span className="block text-yellow-400">Connected Mobility</span>
            Ecosystem.
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mt-8 max-w-xl">
            Queens OS connects transport operators, travel companies, fleet systems, fintech providers and governments through one operating ecosystem.
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-10 font-bold">
            <a href="/become-partner" className="px-8 py-4 rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors text-center">
              Partner With Queens
            </a>

            <a href="#apply" className="px-8 py-4 rounded-2xl border border-yellow-500/20 bg-white/5 hover:bg-white/10 transition text-center">
              Live Demo
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: 'Airport Transfers',
                icon: Car,
                size: 'h-56',
              },
              {
                title: 'Smart Shipping',
                icon: Package,
                size: 'h-64 sm:h-72',
              },
              {
                title: 'International Tours',
                icon: Globe2,
                size: 'h-64 sm:h-72',
              },
              {
                title: 'Luxury Ride Booking',
                icon: Truck,
                size: 'h-56',
              },
            ].map((item, i) => (
              <motion.a
                href="#programs"
                key={item.title}
                whileHover={{ scale: 1.03 }}
                className={`${item.size} padd-spacing rounded-[32px] border border-yellow-500/10 bg-gradient-to-br from-[#1a120b] to-[#0f0a07] backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative block`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_40%)]" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                    <item.icon className="text-yellow-400" size={28} />
                  </div>

                  <h3 className="text-2xl font-bold max-w-[200px] leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="relative z-10 flex items-center justify-between text-zinc-500">
                  <span>Explore</span>
                  <ArrowRight size={18} />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );

  const HeroSix = () => (
    <section className="min-h-screen bg-[#050402] text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.25),transparent_35%)]" />

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 mb-6">
            <Crown size={16} />
            Elite Chauffeur Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
            Transport
            <span className="block text-yellow-400">Partnerships</span>
            Reimagined.
          </h1>

          <p className="text-zinc-400 text-lg mt-8 max-w-xl leading-relaxed">
            A partnership-focused infrastructure designed for transport businesses, logistics providers, smart mobility startups and enterprise movement systems.
          </p>

          <div className="flex flex-wrap gap-5 mt-10 font-bold">
            <a href="/become-partner" className="px-8 py-4 bg-yellow-500 text-black rounded-2xl hover:bg-yellow-400 transition text-center">
              Join Ecosystem
            </a>
            <a href="#infrastructure" className="px-8 py-4 border border-yellow-500/20 rounded-2xl bg-white/5 hover:bg-white/10 transition text-center">
              View Integrations
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[Car, Plane, Building2, Gem].map((Icon, i) => (
            <motion.a
              href="#programs"
              key={i}
              whileHover={{ y: -8 }}
              className="h-64 padd-spacing rounded-[32px] bg-gradient-to-br from-[#1a120b] to-black border border-yellow-500/10 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between block"
            >
              <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Icon className="text-yellow-400" size={30} />
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">Premium Experience</h3>
                <p className="text-zinc-500 leading-relaxed text-sm sm:text-base">
                  Modern travel infrastructure with luxury design.
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroSeven = () => (
    <section className="min-h-screen bg-black text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(234,179,8,0.08),transparent_40%,rgba(120,53,15,0.18))]" />

      <div className="section-inner relative z-10 w-full text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 mb-8">
            <Compass size={16} />
            Queens OS Partner Network
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-none max-w-5xl mx-auto">
            Scale Across
            <span className="block text-yellow-400">Africa Seamlessly</span>
          </h1>

          <p className="text-zinc-400 text-xl max-w-3xl mx-auto mt-10 leading-relaxed">
            Queens OS enables interoperable mobility systems for fleets, logistics providers, transport unions, startups and enterprise infrastructure partners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            ['Travel', Plane],
            ['Ride', Car],
            ['Shipping', Truck],
            ['Tours', Map],
          ].map(([title, Icon]) => (
            <motion.a
              href="#programs"
              whileHover={{ scale: 1.03 }}
              key={title}
              className="padd-spacing rounded-[32px] bg-[#120d07] border border-yellow-500/10 p-6 sm:p-8 backdrop-blur-xl block"
            >
              <Icon className="text-yellow-400 mb-6 mx-auto" size={34} />
              <h3 className="text-2xl font-bold">{title}</h3>
              <p className="text-zinc-500 mt-3 text-sm sm:text-base">
                Intelligent digital infrastructure.
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroEight = () => (
    <section className="min-h-screen bg-[#0a0705] text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
            Queens OS
            <span className="block text-yellow-400">Infrastructure Layer</span>
          </h1>

          <p className="text-zinc-400 text-lg mt-8 max-w-xl leading-relaxed">
            Built to power dispatch systems, mobility APIs, logistics intelligence, payments, ride operations and scalable transportation ecosystems.
          </p>

          <div className="flex items-center gap-6 mt-10 font-bold">
            <a href="/become-partner" className="px-8 py-4 rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400 transition text-center">
              Start Partnership
            </a>
            <a href="#infrastructure" className="px-8 py-4 rounded-2xl border border-yellow-500/20 bg-white/5 hover:bg-white/10 transition text-center">
              View APIs
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[Palmtree, Waves, Camera, Plane].map((Icon, i) => (
            <motion.a
              href="#programs"
              whileHover={{ rotate: 1 }}
              key={i}
              className="h-72  padd-spacing rounded-[40px] bg-gradient-to-br from-[#1c1207] to-[#090909] border border-yellow-500/10 p-6 sm:p-8 flex flex-col justify-between block"
            >
              <Icon className="text-yellow-400" size={38} />

              <div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">Curated Escape</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  Bespoke experiences crafted for premium travelers.
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroNine = () => (
    <section className="min-h-screen bg-[#060403] text-white overflow-hidden relative flex items-center py-24">
      <div className="section-inner relative z-10 w-full text-center">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 mb-8">
            <Fuel size={16} />
            Smart Mobility Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-none max-w-5xl mx-auto">
            Next Generation
            <span className="block text-yellow-400">Mobility Operating System</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            ['Ride Dispatch', Route],
            ['Cargo Fleet', Truck],
            ['Airport Transfer', Plane],
          ].map(([title, Icon]) => (
            <motion.a
              href="#programs"
              whileHover={{ y: -10 }}
              key={title}
              className="rounded-[40px] padd-spacing border border-yellow-500/10 bg-gradient-to-b from-[#1a120b] to-[#090909] p-8 sm:p-10 text-left block"
            >
              <Icon className="text-yellow-400 mb-8" size={40} />
              <h3 className="text-2xl sm:text-3xl font-black mb-4">{title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm sm:text-base">
                Infrastructure-grade systems for fleets, logistics operators, transport agencies and mobility innovators.
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroTen = () => (
    <section className="min-h-screen bg-black text-white overflow-hidden relative flex items-center py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.12),transparent_35%)]" />

      <div className="section-inner relative z-10 w-full grid lg:grid-cols-2 gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 mb-6">
            <Globe2 size={16} />
            Queens OS Infrastructure Vision
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
            Built For
            <span className="block text-yellow-400">Mobility Partnerships</span>
          </h1>

          <p className="text-zinc-400 text-lg mt-8 leading-relaxed max-w-xl">
            Queens OS acts as the digital backbone connecting transport systems, logistics operators, payment providers and mobility infrastructure across regions.
          </p>

          <div className="mt-10 flex gap-5 font-bold">
            <a href="/become-partner" className="px-8 py-4 rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400 transition text-center">
              Partner With Us
            </a>
            <a href="#programs" className="px-8 py-4 rounded-2xl border border-yellow-500/20 bg-white/5 hover:bg-white/10 transition text-center">
              Explore Ecosystem
            </a>
          </div>
        </motion.div>

        <div className="relative h-[450px] sm:h-[650px] overflow-hidden sm:overflow-visible">
          <motion.div
            {...floatingAnimation}
            className="absolute top-0 left-0 w-[45%] max-w-[280px] h-48 sm:w-72 sm:h-72 rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-[#1a120b] to-black border border-yellow-500/10 p-5 sm:p-8"
          >
            <Truck className="text-yellow-400 mb-4 sm:mb-8 w-8 h-8 sm:w-10 sm:h-10" />
            <h3 className="text-xl sm:text-3xl font-black">Cargo AI</h3>
          </motion.div>

          <motion.div
            {...floatingAnimation}
            className="absolute top-24 right-0 w-[50%] max-w-[300px] h-56 sm:w-80 sm:h-80 rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-[#1a120b] to-black border border-yellow-500/10 p-5 sm:p-8"
          >
            <Plane className="text-yellow-400 mb-4 sm:mb-8 w-8 h-8 sm:w-10 sm:h-10" />
            <h3 className="text-2xl sm:text-4xl font-black">Global Routes</h3>
          </motion.div>

          <motion.div
            {...floatingAnimation}
            className="absolute bottom-0 left-10 w-[45%] max-w-[280px] h-48 sm:w-72 sm:h-72 rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-[#1a120b] to-black border border-yellow-500/10 p-5 sm:p-8"
          >
            <Car className="text-yellow-400 mb-4 sm:mb-8 w-8 h-8 sm:w-10 sm:h-10" />
            <h3 className="text-xl sm:text-3xl font-black">Ride Network</h3>
          </motion.div>
        </div>
      </div>
    </section>
  );

  const heroes = [
    <HeroZero key="hero0" />,
    <HeroOne key="hero1" />,
    <HeroTwo key="hero2" />,
    <HeroThree key="hero3" />,
    <HeroFour key="hero4" />,
    <HeroFive key="hero5" />,
    <HeroSix key="hero6" />,
    <HeroSeven key="hero7" />,
    <HeroEight key="hero8" />,
    <HeroNine key="hero9" />,
    <HeroTen key="hero10" />,
  ];

  return (
    <div className="relative overflow-hidden bg-black">
      <motion.div
        key={currentHero}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: HERO_DURATION / 1000, ease: 'linear' }}
        className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-700 z-40"
      />

      <div className="absolute top-3 left-0 right-0 z-40 flex gap-1 px-4">
        {heroes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHero(index)}
            aria-label={`Go to slide ${index + 1}`}
            className="h-1.5 flex-1 bg-white/10 hover:bg-white/25 overflow-hidden rounded-full transition-colors cursor-pointer"
          >
            {index === currentHero ? (
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: HERO_DURATION / 1000,
                  ease: 'linear',
                }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-700"
              />
            ) : index < currentHero ? (
              <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-amber-700" />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div
        key={currentHero}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {heroes[currentHero]}
      </motion.div>
    </div>
  );
}
