import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Coins, TrendingUp, Landmark, Home, Target, HeartPulse, Trophy, Shield, Award, Leaf, Calculator, Wrench, Eye, Users, Clock, Calendar, BadgeCheck, ChevronRight, ArrowLeft, ArrowRight, ShieldCheck, Check, Fuel, Zap, ShoppingBag, Tv, Coffee } from 'lucide-react';

interface DriverPerksProps {
  onNavigate?: (tab: string) => void;
}

interface PerkItem {
  id: string;
  title: string;
  badge: string;
  badgeType: 'success' | 'warning' | 'info';
  icon: React.ReactNode;
  category: 'financial' | 'protection' | 'earnings';
  desc: string;
  moreInfo: string;
  details: {
    tier: string;
    dispatch: string;
    coopBacking: string;
    yieldRate?: string;
    walkthrough: string[];
    impact: string;
    rules: string;
  };
}

export default function DriverPerks({ onNavigate }: DriverPerksProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'financial' | 'protection' | 'earnings'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerk, setSelectedPerk] = useState<PerkItem | null>(null);

  const perks: PerkItem[] = [
    {
      id: 'qcoins-commission',
      title: '🪙 QCoins Ledger Commission',
      badge: 'Zero-Deduction',
      badgeType: 'success',
      icon: <Coins size={22} />,
      category: 'financial',
      desc: "Earn 🪙 QCoins bonuses from signup achievements, safety ratings, and platform quests. Use QCoins directly to cover the platform service commissions or make remittances to Queens without affecting the rider's cash payment! Note: In the future, QCoins loyalty coins will be fully tokenized as digital assets tradeable on public web3 exchanges.",
      moreInfo: "Our proprietary tokenized ledger model lets you convert platform loyalty points directly into fare remittances, saving up to $150/week. In the near future, these utility tokens will be eligible for digital asset exchange listings.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Instant dynamic conversion",
        coopBacking: "Queens OS  Treasury Vetted",
        yieldRate: "No fee deduction",
        walkthrough: [
          "Complete platform rides, quests, or keep safety ratings above 4.8 to earn active 🪙 QCoins.",
          "Check your dedicated 🪙 QCoins Ledger balance directly inside your driver portal dashboard.",
          "Remit platform commissions using 🪙 QCoins instead of cash, keeping 100% of the customer's cash payment!"
        ],
        impact: "By shifting platform commission costs to QCoins, driver partners take home up to 18% more net monthly revenue, stabilizing household cash flow. Future tokenization unlocks  digital asset wealth.",
        rules: "All drivers are automatically registered on the ledger upon OTP signup. Earn active multipliers based on consecutive safe trips."
      }
    },
    {
      id: 'loan-assessments',
      title: 'Instant Loan Assessments',
      badge: 'No-Paperwork Credit',
      badgeType: 'warning',
      icon: <TrendingUp size={22} />,
      category: 'financial',
      desc: 'Access immediate micro-credit lines and operating capital. Please note: instant loan access can only be unlocked if the driver has maintained one to two years of steady usage of the app with a steady income and platform revenue give-back.',
      moreInfo: "Through deep API integrations with cooperative credit unions, we perform real-time cash flow vetting, allowing you to access immediate fuel, battery, and repair advances.",
      details: {
        tier: "Tier 2 (Gold & above)",
        dispatch: "Dispatched in under 60 seconds",
        coopBacking: "Central Cooperative Bank Insured",
        yieldRate: "3.5% Flat Annual Interest",
        walkthrough: [
          "Maintain one to two years of steady usage of the app with consistent active status and steady income.",
          "Tap 'Request Cash Advance' inside the driver app to run the instant smart scoring engine.",
          "Receive low-interest operational credit lines dispatched to your mobile wallet in under 60 seconds."
        ],
        impact: "Eliminates reliance on predatory high-interest short-term lenders during sudden vehicle malfunctions or low-demand seasonal weeks.",
        rules: "Unlocked only if the driver has maintained 1 to 2 years of steady usage of the app with steady income and revenue give-back."
      }
    },
    {
      id: 'coop-fund',
      title: 'Cooperative Fund Management',
      badge: 'State-Vetted Trust',
      badgeType: 'info',
      icon: <Landmark size={22} />,
      category: 'financial',
      desc: 'Join the official Queens Driver Cooperative Body! We help driver partners attain savings if opted for: a customized amount is automatically retained daily, weekly, or monthly based on a flexible savings incentive plan, helping you build reserves and secure stable capital growth.',
      moreInfo: "A democratic savings initiative governed by the national taxi union charter. Safeguard your savings with competitive annual interest yields paid monthly.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Monthly yield payout cycles",
        coopBacking: "National Cooperative Trust Charter",
        yieldRate: "6.8% Annual Percentage Yield",
        walkthrough: [
          "Choose your preferred daily, weekly, or monthly savings incentive plan options.",
          "Automatically retain a chosen percentage or fixed amount of earnings directly inside your cooperative balance.",
          "Monitor your high-yield cooperative savings ledger grow with compound monthly interest."
        ],
        impact: "Enables long-term wealth aggregation, community support reserves, and stable cooperative dividends for driver families.",
        rules: "Requires active cooperative membership. Withdrawals are accessible after a 30-day initial maturity window."
      }
    },
    {
      id: 'mortgage-program',
      title: 'Partner Mortgage Program',
      badge: 'Home Ownership',
      badgeType: 'warning',
      icon: <Home size={22} />,
      category: 'financial',
      desc: 'Build long-term equity with real estate. Through developer-backed property mortgage alliances, verified driver partners can qualify for low-rate house purchases and lease-to-own apartments. Eligibility requires a longer-term commitment of 2 to 6 years of continuous active service with an excellent safety score sheet.',
      moreInfo: "Unlocks exclusive developer-backed home loans near metropolitan transit grids. Accumulate mortgage credits based on your tenure ranging from 2 to 6 years and continuous stellar driver rating.",
      details: {
        tier: "Tier 3 (Platinum only)",
        dispatch: "Custom housing pre-approvals",
        coopBacking: " Housing Authority Backed",
        yieldRate: "Fixed 4.2% Fixed Rate",
        walkthrough: [
          "Complete 2 to 6 years of continuous active service on the platform maintaining a stellar safety score sheet above 4.85.",
          "Accumulate Mortgage Credits through long-term trip frequency and safe driving achievements.",
          "Submit your pre-qualification document through the partner panel to select and lease-to-own community properties."
        ],
        impact: "Empowers low-income transport operators to escape high rent cycles and establish multigenerational household wealth.",
        rules: "Subject to active continuous service verification (2 to 6 years) and an excellent safety score sheet. Property must remain owner-occupied."
      }
    },
    {
      id: 'trip-quests',
      title: 'Trip Tasks & Spatial Quests',
      badge: 'Daily Gamification',
      badgeType: 'success',
      icon: <Target size={22} />,
      category: 'earnings',
      desc: 'Embark on highly rewarding spatial tasks and daily challenges! Earn hefty coin drops by completing challenges like: "Deliver 3 batched B2B packages during morning rush hours" or "Maintain a 4.9+ rating for 15 consecutive trips."',
      moreInfo: "Gamified routing engine dynamically pairs passenger orders with geo-location quests. Unlock multiplier boosts and rare coin drops on morning runs.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Instant task-complete drops",
        coopBacking: "AI Spatial Dispatch Engine calibrated",
        yieldRate: "Up to +2.5x Multiplier",
        walkthrough: [
          "Browse live 'Spatial Quests' displayed on your map before logging in for your shift.",
          "Accept localized tasks, such as delivering batched courier runs during peak hours.",
          "Accumulate hefty coin drops and temporary premium multipliers on successful completion."
        ],
        impact: "Enhances hourly earning efficiency, gamifies the driving experience, and optimizes passenger pickup coverage.",
        rules: "Quests refresh daily based on regional ride demand. Multipliers apply directly to completed fare credits."
      }
    },
    {
      id: 'flat-rate-sub',
      title: 'Flat Rate Subscription Usage',
      badge: 'Flexible Platform Fees',
      badgeType: 'warning',
      icon: <Calculator size={22} />,
      category: 'financial',
      desc: 'Choose our premium flat-rate subscription model! Instead of paying platform commissions on individual trips, subscribe for a low weekly access fee of $19.99/week or choose a part-time daily flat rate to access ride requests for the day. Log off with absolutely 0% commission and no penalties when done. Note: Inactivity penalties apply only to full-time default drivers, but can be waived for vehicle breakdowns by contacting your Driver Head Association.',
      moreInfo: "Switch off commission splits permanently! Ideal for both high-volume full-time drivers and part-time driver partners who want to subscribe to work for single days with no inactivity penalties for the rest of the week.",
      details: {
        tier: "Tier 2 (Gold & above)",
        dispatch: "Weekly or Daily subscription billing",
        coopBacking: "Verified Zero-Deduction Guarantee",
        yieldRate: "0% Commission Split during Subscription",
        walkthrough: [
          "Navigate to Subscription options inside your driver portal profile configuration.",
          "Activate either the $19.99 weekly flat-rate model or a flexible daily flat-rate token directly from your wallet.",
          "Keep 100% of every completed trip fare with no variable platform deductions and log off whenever you are done!",
          "In case of unexpected vehicle breakdown, instantly notify your local Driver Head Association to waive any potential full-time inactivity penalties."
        ],
        impact: "Allows high-volume partners to bypass commission overheads, while giving part-time operators ultimate flexibility to work single days penalty-free.",
        rules: "Part-time subscribers face no inactivity penalties. Full-time drivers are required to maintain active hours by default, but vehicle malfunctions can be submitted through the Driver Head Association to the app service for waiver clearance."
      }
    },
    {
      id: 'health-pension',
      title: 'Health & Pension Ledger',
      badge: 'Family Protection',
      badgeType: 'info',
      icon: <HeartPulse size={22} />,
      category: 'protection',
      desc: 'Keep your health protected. Verified partners accrue healthcare coverage, medical assistance, and micro-pension credits. Note: This can be activated only after 2 years of active service and reaching trip milestones, but the timeline can be shortened for excellent drivers who double-score their quota or over-reach their goals.',
      moreInfo: "Covers up to 85% of clinical consultations and dental checkups. Accumulate private pension savings ledger values after your activation requirements are met.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Automatic ledger accrual",
        coopBacking: "Cooperative Health Union Partnered",
        yieldRate: "Full health card coverage",
        walkthrough: [
          "Complete 2 years of active service and trip milestones (or fast-track early by doubling your quota).",
          "Log active drive hours and safety miles seamlessly on our coordinate server.",
          "Accrue Healthcare Credits directly to your Health Ledger Card monthly once active."
        ],
        impact: "Provides vital health security for driver families, protecting against unexpected illness expenses that derail savings.",
        rules: "Activation requires 2 years of active service and milestone completion. Timeline is shortened for top-performing drivers who exceed or double-score quotas. Requires a minimum of 20 online hours per week."
      }
    },
    {
      id: 'lease-to-own',
      title: 'Lease-to-Own Fleet Program',
      badge: 'Zero Deposit EV/Hybrid',
      badgeType: 'warning',
      icon: <Trophy size={22} />,
      category: 'earnings',
      desc: 'Upgrade from driver to owner. This lease-to-own fleet program is exclusively built for selective drivers who exhibit excellence in their duties and have achieved a highly credible performance score sheet, along with meeting robust accountability vetting measures.',
      moreInfo: "Transition into ownership of a custom-calibrated hybrid sedan or a premium EV crossover with pre-negotiated cooperative financing and full accountability vetting.",
      details: {
        tier: "Tier 3 (Platinum only)",
        dispatch: "Vetted asset handover in 7 days",
        coopBacking: "Green Transit Capital & Bank Funded",
        yieldRate: "0% Down Deposit",
        walkthrough: [
          "Demonstrate excellence in your daily duty and maintain an exemplary credible safety score sheet.",
          "Submit your Lease-to-Own application and undergo strict performance and accountability vetting.",
          "Pick up your brand-new hybrid or EV vehicle with full comprehensive insurance and operating licenses."
        ],
        impact: "Enables independent driver partners to own depreciating operating assets, turning transport jobs into long-term capital assets.",
        rules: "Reserved exclusively for selective, high-performing drivers. Candidates are vetted using comprehensive accountability measures and driver safety records. Payments are deducted directly from daily digital payouts."
      }
    },
    {
      id: 'emergency-dispatch',
      title: '24/7 Emergency Dispatch',
      badge: '6-8 Months Active',
      badgeType: 'success',
      icon: <Shield size={22} />,
      category: 'protection',
      desc: 'Never get stranded. Enjoy priority roadside towing, tyre repairs, electrical jumps, and mechanical support. Note: This service is unlocked after 6-8 active months. It is not free by default, but is fully paid by the company if you drive a company vehicle, or if you hold a Gold rank (claims can be processed with valid proof of vehicle fault issues).',
      moreInfo: "Live event tracking system dispatches professional mechanics, recovery flatbeds, and roadside assistance right to your GPS coordinates under clear cooperative coverage rules.",
      details: {
        tier: "Tier 2 (Gold & above, or Company Fleet)",
        dispatch: "Immediate dispatch (average 20m response)",
        coopBacking: "Emergency Roadside Association Vetted",
        yieldRate: "Cooperative or Company Covered",
        walkthrough: [
          "Complete 6 to 8 active service months (waived for company vehicle drivers).",
          "In the event of a mechanical breakdown, tap the 'Emergency Assistance' SOS button in the app.",
          "Submit valid proof of vehicle fault issues to process claims under company coverage or Gold rank membership."
        ],
        impact: "Reduces operational stress and downtime, keeping drivers safe on late-night routes with robust cooperative assistance.",
        rules: "Unlocked after 6-8 months active service. Fully covered for company vehicle operators. Gold ranked drivers can claim cost refunds with valid proof of mechanical fault issues."
      }
    },
    {
      id: 'carbon-green',
      title: 'Eco-Carbon Green Credits',
      badge: 'Green Bonuses',
      badgeType: 'success',
      icon: <Leaf size={22} />,
      category: 'financial',
      desc: 'Get compensated for driving green. Earn certified carbon energy offset credits for every mile driven in a hybrid or zero-emission EV vehicle, redeemable directly for solid cash ledger credits. Note: This is applicable only in countries or geographical zones that allow and support the use of green energy driven cars.',
      moreInfo: "Earn internationally certified carbon offset credits that trade on live green-commodity exchanges, instantly convertible to active QCoins. (Applicable only in allowed green energy zones/countries).",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Real-time mileage calculations",
        coopBacking: "Global Carbon Exchange Vetted",
        yieldRate: "Certified offset trade",
        walkthrough: [
          "Register a hybrid or fully electric EV vehicle on the driver portal dashboard.",
          "Our telemetry system calculates saved carbon emissions automatically on every ride.",
          "Redeem accumulated carbon credits directly for cash payouts or premium platform multipliers."
        ],
        impact: "Rewards environmentally-conscious drivers, speeding up the adoption of clean energy vehicles.",
        rules: "Requires telemetry verification of vehicle battery/fuel metrics. Restricted strictly to countries or geographical zones that allow the use of green energy driven cars."
      }
    },
    {
      id: 'tax-assist',
      title: 'Tax & Self-Assessments Assist',
      badge: 'Financial Organization',
      badgeType: 'info',
      icon: <Calculator size={22} />,
      category: 'financial',
      desc: 'Review and manage your earnings with ease. Our smart accounting layer tracks your business travel expenses and simplifies your records, curating your tax data so you can easily remain responsible for logging your own tax.',
      moreInfo: "An automated accounting assistant that generates clean profit-and-loss statements and curates your tax metrics so you are fully prepared to log your own tax responsibly.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Quarterly curated tax spreadsheets",
        coopBacking: "Chartered Accountant Approved Structure",
        yieldRate: "Auto expense logs",
        walkthrough: [
          "Keep driving normally. The platform logs all business miles, tolls, and operating fuel charges.",
          "Review your dynamically updated Profit & Loss sheets directly in the accounting panel.",
          "Download curated quarterly self-assessment spreadsheets designed to make logging your own tax simple and responsible."
        ],
        impact: "Saves driver partners hours of manual bookkeeping, providing a cleanly curated log to file taxes responsibly.",
        rules: "All tax metrics are curated for informational and tracking purposes. Driver partners remain solely responsible for verifying and logging their own tax filings."
      }
    },
    {
      id: 'floor-earnings',
      title: 'Guaranteed Earnings & Coins Growth',
      badge: 'Coins Accumulation & Swap Prep',
      badgeType: 'success',
      icon: <TrendingUp size={22} />,
      category: 'earnings',
      desc: 'Never miss an opportunity to build value. We do not provide out-of-pocket cash payouts for short ride volumes; instead, we offer robust alternative channels to grow your QCoins and prepare for the major future event where loyalty coins will be tokenized for public exchanges and digital asset investment.',
      moreInfo: "Focus on cooperative wealth generation! Learn how to maximize your coins through alternative active multiplier channels and prepare for the future tokenization and digital asset exchange event.",
      details: {
        tier: "Tier 2 (Gold & above)",
        dispatch: "Daily active coin challenges",
        coopBacking: "Queens OS  Treasury Swap Reserve",
        yieldRate: "High-yield token multipliers",
        walkthrough: [
          "Participate in daily alternative quests, safety score milestones, and cooperative challenges to grow your QCoins.",
          "Track dynamic coin accruals in your digital wallet without relying on traditional direct cash payouts.",
          "Accumulate coin balances to prepare for the upcoming public token exchange listing and digital asset investment launch."
        ],
        impact: "Enables drivers to build a robust digital asset portfolio, preparing them for the future transition of loyalty points into high-value tradable assets.",
        rules: "No out-of-pocket cash top-ups are paid due to low ride volumes. Coins are accumulated strictly via quest performance and multiplier milestones in preparation for the future exchange event."
      }
    },
    {
      id: 'maintenance-discount',
      title: 'Bulk Maintenance Assist',
      badge: '40% Off Spares & Servicing',
      badgeType: 'warning',
      icon: <Wrench size={22} />,
      category: 'earnings',
      desc: 'Reduce your running overheads. Access up to 40% off high-quality tyres, engine oil changes, brake pads, and major servicing via our authorized partner workshop networks. Note: This perk is unlocked after 9 months of active driving and a verified successful trip score turnover.',
      moreInfo: "Exclusive access to a nationwide cooperative spare parts supplier, giving you massive group-buying discounts on premium tires, batteries, and brakes.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Instant service discount authorization",
        coopBacking: "Cooperative Workshop Alliance Vetted",
        yieldRate: "Up to 40% Off spares",
        walkthrough: [
          "Complete 9 months of active driving on the platform with a verified successful trip score turnover.",
          "Select 'Workshop Discounts' inside your driver portal dashboard to see nearby approved partners.",
          "Book a maintenance request and generate a dynamic service voucher inside the portal."
        ],
        impact: "Significantly lowers vehicle maintenance overheads, promoting safer vehicle conditions and boosting driver profitability.",
        rules: "Unlocked only after 9 months of active riding and reaching a verified successful trip score turnover. Voucher redemptions are subject to cooperative workshop guidelines."
      }
    },
    {
      id: 'accusation-protection',
      title: 'Accusation Protections',
      badge: 'Fair Mediation Board',
      badgeType: 'success',
      icon: <Eye size={22} />,
      category: 'protection',
      desc: 'Fair treatment is our core value. We fully subsidize high-definition dual-view cabin dashcams and process any customer reports via an independent, driver-represented panel, eliminating immediate auto-suspensions.',
      moreInfo: "Combats false passenger reports through automated front-and-back cabin video logging and a neutral review committee before any account suspension is allowed.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Neutral mediation panels",
        coopBacking: "Elected Driver Council Mediation Board",
        yieldRate: "Subsidized dual-view dashcam",
        walkthrough: [
          "Install the platform-subsidized dual-view dashcam inside your vehicle cabin.",
          "In the event of a customer dispute or safety report, incident footage is secured automatically.",
          "A neutral driver-represented mediation board reviews all telemetry before determining account status."
        ],
        impact: "Shields driver partners from false passenger complaints and arbitrary suspensions.",
        rules: "Dashcam must remain powered and online during customer rides to qualify for mediation protections."
      }
    },
    {
      id: 'driver-councils',
      title: 'Elected Driver Councils',
      badge: 'Direct Democracy',
      badgeType: 'info',
      icon: <Users size={22} />,
      category: 'earnings',
      desc: 'We govern this ecosystem together. High-performing driver partners can run for and vote in democratic elections for local Driver Councils, gaining a direct vote on fare rates and platform protocols. Note: This program is applicable only in supported regions.',
      moreInfo: "Ensures every driver has a direct voice in fare adjustments, region allocations, and platform software changes through transparent quarterly voting, restricted strictly to supported regions.",
      details: {
        tier: "Tier 2 (Gold & above)",
        dispatch: "Quarterly local assembly votes",
        coopBacking: "Democratic Driver Cooperative Charter",
        yieldRate: "Active voting privilege",
        walkthrough: [
          "Participate in local assembly discussions and submit proposals on regional dispatch structures within supported regions.",
          "Vote in quarterly electronic ballot elections for your district's Driver Representative.",
          "Elected representatives meet directly with Queens executive board members to determine policies."
        ],
        impact: "Establishes a truly democratic transport network, giving the workers direct control over their operational conditions in establishment regions.",
        rules: "Must maintain active driver standing for at least 90 days to vote or run in local council elections. Applicable only in supported regions."
      }
    },
    {
      id: 'expiry-alert',
      title: 'Expiry Early-Alert System',
      badge: '60-Day Warning & Renewal Advances',
      badgeType: 'warning',
      icon: <Clock size={22} />,
      category: 'protection',
      desc: 'Never face sudden account locks. Receive automatic notification warnings 60 days before credentials expire. For driver partners in the cooperative system who maintain a good credit score, the company can make advance renewal payments on your behalf. Remittance is then easily structured via a good loan budget or a one-off remittance after the End of Day (EOD).',
      moreInfo: "OCR document scanning matches upcoming expirations with cooperative credit accounts, allowing eligible partners to utilize company-financed renewal advances.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Continuous OCR checking and renewal advances",
        coopBacking: "Regulatory & Cooperative Treasury Linked",
        yieldRate: "60-Day warning with optional EOD remittance",
        walkthrough: [
          "Upload credential documents to initiate continuous OCR tracking.",
          "Receive automated warnings 60, 30, and 14 days before any registered document expires.",
          "Request a company renewal advance if you are a cooperative member in good credit standing.",
          "Remit the advance amount easily through a structured loan budget or as a one-off deduction after EOD."
        ],
        impact: "Guarantees continuous uptime and removes the financial stress of sudden regulatory renewal fees.",
        rules: "Renewal advances are restricted to cooperative driver partners with a good credit score sheet. Deferrals are cleared after EOD or via customized loan schedules."
      }
    },
    {
      id: 'fee-deferrals',
      title: 'Remit-Later Fee Deferrals',
      badge: 'Deferred Commission Options',
      badgeType: 'success',
      icon: <Calendar size={22} />,
      category: 'financial',
      desc: 'Keep driving even when cash is low. Defer platform usage subscriptions or operational commissions seamlessly through our "Remit Later" protocol, carrying over balances to be debited from future bookings. Note: This perk is unlocked by 🪙 QCoins payment or an equivalent of 5 years of active service. Any pending bill owed will be carried over with additional charges should the driver partner default.',
      moreInfo: "Provides financial breathing room during emergency weeks. Carry over negative balances easily; however, defaulting on deferred balances will result in carried-over bills with penalty interest charges.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Dynamic balance carryover with default rules",
        coopBacking: "Partner Liquidity Fund Protected",
        yieldRate: "Deferred remittance",
        walkthrough: [
          "Unlock the perk using 🪙 QCoins payment or by completing 5 years of active service on the platform.",
          "If operational funds are low, select 'Defer Fees' inside the wallet panel.",
          "Platform usage fees are put on hold and dynamic remittance requirements are suspended.",
          "Ensure deferred balances are remitted within the required schedule to avoid carried-over default charges."
        ],
        impact: "Protects drivers from sudden financial crunches, allowing them to remain active and earn cash.",
        rules: "Unlocked via 🪙 QCoins payment or equivalent 5 years of active service. Deferrals are limited to a maximum equivalent of $150 per month. Any pending bill owed will be carried over with added charges should the driver default on the agreed schedule."
      }
    },
    {
      id: 'kyc-loans',
      title: 'KYC & Seniority Upfronts',
      badge: 'Tenure Credit Score',
      badgeType: 'warning',
      icon: <BadgeCheck size={22} />,
      category: 'financial',
      desc: 'Secure major financial upfronts. Our underwriting scoring assesses your overall platform service history, trip integrity metrics, and biometric KYC vetting, awarding dedicated partners with larger, low-interest capital lines.',
      moreInfo: "Unlock substantial unsecured commercial credit limits based on your active years, service consistency, and facial verification checkpoints.",
      details: {
        tier: "Tier 3 (Platinum only)",
        dispatch: "Within 24 hours of panel review",
        coopBacking: " Development Fund Partnered",
        yieldRate: "Up to $15,000 credit limit",
        walkthrough: [
          "Achieve Platinum status and keep a clean biometric KYC status for 12 months.",
          "Select the Tenure Credit program to calculate your pre-approved commercial capital line.",
          "Access funds with flat low interest rates for vehicle purchase, battery swap, or home repair."
        ],
        impact: "Allows long-term transport operators to fund structural career upgrades or purchase additional vehicles.",
        rules: "Requires clean background validation, active tenure, and daily biometric face scans."
      }
    },
    {
      id: 'bulk-fuel',
      title: 'Cooperative Bulk Fuel Purchases',
      badge: '12% Fuel Cashbacks & 6-Month Pass',
      badgeType: 'success',
      icon: <Fuel size={22} />,
      category: 'financial',
      desc: 'Access pre-negotiated volume discounts on premium fuel and charging at partnered national stations. Pay seamlessly using your integrated Queens OS driver wallet to instantly receive 12% cashback points back on every fill. Note: To unlock this cooperative program, you pay a certain equivalent of 🪙 QCoins or cash, which is viable for 6 months and fully renewable.',
      moreInfo: "Queens OS bundles driver volumes to negotiate direct discounts with energy networks. We keep a low 3% clearing spread while drivers save 12% on daily operation fuel bills during their 6-month access pass.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "6-Month renewable access pass",
        coopBacking: " Energy Union Vetted",
        yieldRate: "12% fuel discount",
        walkthrough: [
          "Unlock the program by paying the required equivalent of 🪙 QCoins or cash.",
          "Open your Queens driver wallet and check partnered fuel station maps during your 6-month active access period.",
          "Tap 'Pay Station' and scan the cashier's QR code at the pump to confirm checkout and instantly earn 12% cashback!"
        ],
        impact: "Lowers daily running costs significantly, saving full-time driver partners up to $45 a week in fuel overheads.",
        rules: "Requires active subscription unlocked by equivalent 🪙 QCoins or cash, viable for 6 months and renewable. Limited to a maximum of 60 gallons per driver weekly."
      }
    },
    {
      id: 'ev-rentals',
      title: 'Queens Certified EV Rent-to-Drive',
      badge: 'Zero-Deposit Rentals',
      badgeType: 'warning',
      icon: <Zap size={22} />,
      category: 'earnings',
      desc: 'Rent high-efficiency hybrid or fully electric vehicles on a daily or weekly basis. Bypasses massive upfront security deposits, allowing you to get on the road and earn high fares with zero initial investment.',
      moreInfo: "We lease fleets at heavy volume discounts from manufacturing giants and sub-lease them directly to qualified drivers, creating a high-margin recurring rental line for the platform.",
      details: {
        tier: "Tier 2 (Gold & above)",
        dispatch: "Vehicle dispatch in 24 hours",
        coopBacking: "Queens Fleet Leasing Group Vetted",
        yieldRate: "No deposit required",
        walkthrough: [
          "Submit your active gold-tier rating and basic driver profile to the fleet panel.",
          "Choose your preferred electric or hybrid model from our active hub listing.",
          "Pick up your certified EV with pre-paid commercial insurance and start passenger shifts immediately!"
        ],
        impact: "Enables highly skilled drivers without vehicles to start earning, while generating safe, recurring rental margins for the platform.",
        rules: "Requires continuous Gold tier status. Daily rental fees are auto-deducted directly from digital ride payouts."
      }
    },
    {
      id: 'snack-commerce',
      title: 'In-Car Premium Snack Commerce',
      badge: 'Passive In-Ride Sales',
      badgeType: 'success',
      icon: <ShoppingBag size={22} />,
      category: 'earnings',
      desc: 'Turn your passenger cabin into a high-yield retail hub! We mount a premium display dispenser filled with snacks and beverages. Passengers purchase via simple scan QR codes, and you pocket an outstanding 60% of net profits! Note: This snack commerce program is applicable only in allowed and supported regions where local commercial vending regulations permit.',
      moreInfo: "We supply display boxes and secure inventory at bulk wholesale prices (up to 80% off). The platform keeps a solid 40% margin split. Applicable strictly within allowed regions due to localized health and commerce laws.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Weekly profit disbursements",
        coopBacking: "Retail Logistics Group Partnered",
        yieldRate: "60/40 profit split",
        walkthrough: [
          "Verify that your registered operations hub lies within a supported snack-commerce allowed region.",
          "Install the official Queens passenger display dispenser behind your headrest.",
          "Passengers buy items during trips by scanning the unique QR code on the display."
        ],
        impact: "Creates an entirely passive revenue stream for drivers, boosting hourly trip yields by up to 15% with zero effort.",
        rules: "Requires maintaining a clean cabin presentation. Applicable strictly within allowed regions. Spares are replenished weekly at official charging hubs."
      }
    },
    {
      id: 'insurance-alliance',
      title: 'Queens OS Fleet Insurance Alliance',
      badge: '35% Lower Insurance & Auto-Access',
      badgeType: 'info',
      icon: <Shield size={22} />,
      category: 'protection',
      desc: 'Leverage our collective driver network to slash commercial vehicle insurance costs. Through consolidated group plans, partners access top-tier comprehensive policies with 35% lower premiums than individual retail options. Note: This is automatically available for Queens OS drivers and other Partners who pay the cooperative insurance fee to cover it. Individual drivers who choose to participate must also pay a fee to unlock this perk.',
      moreInfo: "By acting as a licensed corporate broker, we collect broker commission kickbacks from insurance providers. Group-rate coverage is automatically active for Queens OS drivers and partners upon paying the cooperative insurance fee, while independent individuals pay an unlock fee.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Instant policy activation",
        coopBacking: "National Insurance Underwriters Partnered",
        yieldRate: "35% lower premiums",
        walkthrough: [
          "Opt in through your partner profile. If you are a Queens OS driver or registered Partner, pay the cooperative insurance fee to activate coverage automatically.",
          "If you are an individual driver, submit the required fee to unlock cooperative group rates.",
          "Bind the policy instantly and have premiums deducted in tiny daily installments."
        ],
        impact: "Lowers major operational liabilities, protecting drivers from catastrophic loss while building strong broker reserves.",
        rules: "Automatically available for Queens OS drivers and partners paying the cooperative fee. Individual drivers must pay a separate fee to unlock. Requires maintaining a safe driving score of 4.7+."
      }
    },
    {
      id: 'coop-profit-share',
      title: 'Cooperative Equity & Profit Share Pool',
      badge: 'Platform Profit Shares',
      badgeType: 'success',
      icon: <Landmark size={22} />,
      category: 'earnings',
      desc: 'Hold actual  equity in the network. A dedicated pool of regional platform fees is distributed quarterly among high-performing cooperative drivers based on trip miles and platform seniority, turning active service into long-term financial equity.',
      moreInfo: "We lock a percentage of regional network commission margins directly into a cooperative trust fund, paying out dividends to certified driver partners quarterly.",
      details: {
        tier: "Tier 3 (Platinum & above)",
        dispatch: "Quarterly dividend disbursements",
        coopBacking: "Queens OS  Trust Alliance",
        yieldRate: " dividend yields",
        walkthrough: [
          "Maintain exceptional rating and milestone parameters over consecutive quarters.",
          "Track your accumulated dividend points directly inside the partner wallet panel.",
          "Receive direct quarterly profit shares transferred securely into your capital account."
        ],
        impact: "Aligns the long-term success of the platform with the drivers, turning active service workers into true enterprise co-owners.",
        rules: "Requires a minimum of 18 months active cooperative service with an excellent performance rating sheet."
      }
    },
    {
      id: 'solar-swap',
      title: 'Ecosystem EV Solar Battery Swap Hubs',
      badge: '3-Min Swap Hubs',
      badgeType: 'warning',
      icon: <Zap size={22} />,
      category: 'earnings',
      desc: 'Skip the long 45-minute battery charging downtime! Pull up to any of our off-grid solar-powered battery swap cabinets and exchange your depleted EV pack for a 100% full battery in under 3 minutes at a 20% discount. Note: This is applicable strictly in supported regions using this infrastructure as part of the Queens OS transport system, and is restricted strictly to Queens OS Drivers or vehicles with certified green energy service (not for general partners).',
      moreInfo: "Off-grid solar chargers generate electricity at almost zero utility cost. Battery swaps are restricted to certified Queens OS green service fleets and active ecosystem drivers.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Under 3 minutes exchange",
        coopBacking: "Green Energy Infrastructure Vetted",
        yieldRate: "20% cheaper than public grids",
        walkthrough: [
          "Confirm that your operation hub lies within a supported green energy region and that you are an active Queens OS Driver.",
          "Drive into the solar swap slot with your pre-certified green energy service vehicle.",
          "Swap your depleted cell with a fully-charged solar pack and drive off in under 3 minutes."
        ],
        impact: "Maximizes driver operating hours and eliminates range anxiety while generating excellent utility margins.",
        rules: "Strictly restricted to Queens OS Drivers or vehicles with certified green energy service in active regions. Not available for general external partners."
      }
    },
    {
      id: 'chama-savings-pool',
      title: 'Cooperative Peer Savings Circles (Chama)',
      badge: 'Zero-Cost Peer Lending',
      badgeType: 'success',
      icon: <Users size={22} />,
      category: 'financial',
      desc: 'Form trusted peer circles with fellow driver partners. The system will automatically peer drivers in groups of 5 or 10, and based on a fixed contribution amount, will circle money around the drivers. Each driver takes turns receiving the pooled lump sum weekly or monthly, ensuring no one goes broke and everyone has access to large interest-free funds.',
      moreInfo: "The platform acts as a secure cryptographic ledger and escrow agent, automating circle deductions and payouts. The circle capital is provided entirely by the drivers themselves, eliminating company treasury liability, while guaranteeing rotating weekly or monthly payouts for each driver in the 5-10 peer group.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Automated daily circle escrow",
        coopBacking: "Driver-Funded Trust Escrow",
        yieldRate: "0% interest peer capital",
        walkthrough: [
          "Join a peer group of 5 or 10 trusted drivers matched by the system based on location and rating.",
          "Agree on a fixed contribution amount to be deducted dynamically weekly or monthly.",
          "Take turns receiving the pooled interest-free funds in rotation, ensuring continuous cash flow so no partner goes broke."
        ],
        impact: "Provides drivers with interest-free capital for micro-investments without taking loans, utilizing a completely self-funded peer model.",
        rules: "Peer circles consist of exactly 5 or 10 matched drivers. Contributions are fixed and automatically deducted to guarantee equal rotation turns weekly or monthly."
      }
    },
    {
      id: 'co-working-lounges',
      title: 'Queens Co-Working Rest Lounges',
      badge: 'Full Membership Pass',
      badgeType: 'success',
      icon: <Home size={22} />,
      category: 'protection',
      desc: 'Recharge, rest, and relax between shifts. Access our premium air-conditioned driver lounges featuring high-speed Wi-Fi, clean showers, massage chairs, free filter coffee, and dynamic vehicle washing slots. Note: This is applicable only for drivers who pay for a full membership card. You can qualify for a full membership card payment if you have up to 200,000 QCoins, or you can pay an equivalent subscription for full membership, which is renewable every 2 years.',
      moreInfo: "We lease rest hubs at transit gateways. Real estate costs are fully offset by food vendors. Access is unlocked by a full membership card, redeemable for 200,000 QCoins or an equivalent cash subscription renewable every 2 years.",
      details: {
        tier: "Tier 1 (Bronze & above)",
        dispatch: "Lounge Pass Key dispatched instantly",
        coopBacking: "Driver Wellness Cooperative Trust",
        yieldRate: "Premium lounge amenities",
        walkthrough: [
          "Acquire a full membership card using 200,000 QCoins or an equivalent cash subscription.",
          "Locate dynamic Queens rest lounges marked in gold on your navigation dashboard.",
          "Scan your digital driver QR code or full membership card at the secure lounge entry turnstile."
        ],
        impact: "Improves driver well-being, lowers burnout rates, and builds a dedicated community feel.",
        rules: "Access requires a full membership card. Qualification requires up to 200,000 QCoins or an equivalent membership subscription, renewable every 2 years."
      }
    }
  ];

  const filteredPerks = perks.filter(perk => {
    const matchesTab = activeTab === 'all' || perk.category === activeTab;
    const matchesSearch = perk.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          perk.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          perk.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', overflow: 'hidden', padding: '1rem 0.5rem' }}>
      
      {/* Self-contained styling for responsive card glows, slide-up animations & media queries */}
      <style dangerouslySetInnerHTML={{__html: `
        .perks-hero {
          text-align: center;
          padding: 4.5rem 2rem;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, #FFD700 0%, #FFB800 55%, #E6A100 100%);
          border: 1px solid rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 50px rgba(255, 184, 0, 0.22);
        }
        .hero-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .perks-hero .search-input {
          background: #0d0d0d !important;
          border: 1px solid rgba(0, 0, 0, 0.25) !important;
          color: #ffffff !important;
        }
        .perks-hero .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .perks-hero .search-input:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2) !important;
        }
        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          z-index: 1;
          position: relative;
        }
        .filter-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--foreground-muted);
          padding: 0.6rem 1.2rem;
          border-radius: 9999px;
          cursor: pointer;
          font-family: var(--font-outfit);
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.15);
        }
        .filter-btn.active {
          background: rgba(255, 184, 0, 0.1);
          color: var(--primary);
          border-color: rgba(255, 184, 0, 0.3);
          box-shadow: 0 4px 20px rgba(255, 184, 0, 0.05);
        }
        .perks-hero .filter-btn {
          background: #0d0d0d !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: rgba(255, 255, 255, 0.6) !important;
          transition: all 0.2s ease !important;
        }
        .perks-hero .filter-btn:hover {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
        }
        .perks-hero .filter-btn.active {
          background: #000000 !important;
          color: #FFB800 !important;
          border: 1px solid #000000 !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25) !important;
        }
        .perks-search {
          max-width: 400px;
          width: 100%;
          margin: 0 auto 2.5rem auto;
          position: relative;
          z-index: 1;
        }
        .search-input {
          width: 100%;
          padding: 0.8rem 1.2rem;
          border-radius: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #fff;
          font-size: 0.9rem;
          font-family: var(--font-inter);
          transition: all 0.2s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: rgba(255, 184, 0, 0.4);
          box-shadow: 0 0 15px rgba(255, 184, 0, 0.08);
          background: rgba(0, 0, 0, 0.5);
        }
        
        /* Premium Slide-up Perk Cards */
        .perk-card-wrapper {
          position: relative;
          overflow: hidden;
          height: 290px;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.015);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .perk-card-wrapper:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 184, 0, 0.35) !important;
          box-shadow: 0 12px 30px rgba(255, 184, 0, 0.08) !important;
        }
        .perk-card-main {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: flex-start;
          transition: opacity 0.2s ease;
        }
        .perk-card-slideup {
          position: absolute;
          inset: 0;
          transform: translateY(101%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background: linear-gradient(180deg, #181818 0%, #111111 100%);
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          z-index: 2;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 184, 0, 0.25);
        }
        .perk-card-wrapper:hover .perk-card-slideup {
          transform: translateY(0);
        }
        .perk-badge-success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .perk-badge-warning {
          background: rgba(255, 184, 0, 0.1);
          color: var(--primary);
          border: 1px solid rgba(255, 184, 0, 0.2);
        }
        .perk-badge-info {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .cta-banner {
          background: linear-gradient(135deg, rgba(255, 184, 0, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%);
          border: 1px solid rgba(255, 184, 0, 0.2);
          border-radius: 1.25rem;
          padding: 2.5rem;
          text-align: center;
          margin-top: 2rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          animation: logoPulse 4s ease-in-out infinite;
        }

        /* Detail View Styles */
        .detail-card {
          background: linear-gradient(180deg, rgba(25,25,25,0.4) 0%, rgba(10,10,10,0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--foreground-muted);
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-family: var(--font-outfit);
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          text-decoration: none;
          margin-bottom: 2rem;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(-3px);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 2.5rem;
          margin-top: 2rem;
        }
        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.85rem;
        }
        .spec-label {
          color: var(--foreground-muted);
        }
        .spec-val {
          color: #fff;
          font-weight: bold;
        }
      `}} />

      {/* ── CONDITIONAL RENDER: DETAIL VIEW OR DIRECTORY ── */}
      {selectedPerk ? (
        <div className="fade-in">
          {/* Back button */}
          <button className="back-btn" onClick={() => setSelectedPerk(null)}>
            <ArrowLeft size={16} /> Back to Perks Directory
          </button>

          {/* Cinematic Detail Card */}
          <div className="detail-card">
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            {/* Header / Meta */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)', padding: '0.35rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {selectedPerk.category === 'financial' && <Coins size={12} />}
                {selectedPerk.category === 'protection' && <HeartPulse size={12} />}
                {selectedPerk.category === 'earnings' && <Trophy size={12} />}
                {selectedPerk.category} benefit
              </div>

              <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '1rem', background: 'linear-gradient(135deg, #ffffff 50%, #FFB800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {selectedPerk.title}
              </h1>

              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--foreground-muted)', maxWidth: '800px', marginBottom: '2rem' }}>
                {selectedPerk.desc}
              </p>
            </div>

            {/* Main Spec / Detail split grid */}
            <div className="detail-grid" style={{ position: 'relative', zIndex: 1 }}>
              
              {/* Left Column: Specs sheet widget */}
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.15rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', margin: 0 }}>
                  Benefit Specifications
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="spec-item">
                    <span className="spec-label">Eligible Tier</span>
                    <span className="spec-val" style={{ color: 'var(--primary)' }}>{selectedPerk.details.tier}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Dispatch Delay</span>
                    <span className="spec-val">{selectedPerk.details.dispatch}</span>
                  </div>
                  {selectedPerk.details.yieldRate && (
                    <div className="spec-item">
                      <span className="spec-label">Rate Benefit</span>
                      <span className="spec-val" style={{ color: 'var(--success)' }}>{selectedPerk.details.yieldRate}</span>
                    </div>
                  )}
                  <div className="spec-item" style={{ borderBottom: 'none' }}>
                    <span className="spec-label">Mediation Alliance</span>
                    <span className="spec-val" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
                      <ShieldCheck size={14} /> Vetted 
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,184,0,0.03)', border: '1px dashed rgba(255,184,0,0.2)', padding: '0.85rem', borderRadius: '0.75rem', fontSize: '0.75rem', color: 'var(--foreground-muted)', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>Cooperative Trust Verification</span>
                  {selectedPerk.details.coopBacking}
                </div>
              </div>

              {/* Right Column: Walkthrough, Impact and Rules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* How it Works */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
                    Activation Walkthrough
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: '0.5rem' }}>
                    {selectedPerk.details.walkthrough.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '2px', borderRadius: '50%', display: 'flex', marginTop: '3px' }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--foreground-muted)', lineHeight: '1.5', margin: 0 }}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Impact */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>2</span>
                    Ecosystem Impact & Yields
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--foreground-muted)', lineHeight: '1.6', margin: 0, paddingLeft: '1.8rem' }}>
                    {selectedPerk.details.impact}
                  </p>
                </div>

                {/* Eligibility Rules */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>3</span>
                    Eligibility & Continuous Validation
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--foreground-muted)', lineHeight: '1.6', margin: 0, paddingLeft: '1.8rem' }}>
                    {selectedPerk.details.rules}
                  </p>
                </div>

              </div>

            </div>

            {/* Back action banner */}
            <div className="cta-banner" style={{ marginTop: '3.5rem', background: 'linear-gradient(135deg, rgba(255,184,0,0.04) 0%, rgba(0,0,0,0.3) 100%)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                Securely Registering to Unlock this Benefit?
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--foreground-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.4' }}>
                This {selectedPerk.category} benefit is actively underwritten by the  Cooperative Alliance. Complete driver onboarding to bind your credential key.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setSelectedPerk(null)} 
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  Return to Directory
                </button>
                <button 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('driver');
                    } else {
                      navigate('/driver');
                    }
                  }} 
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(255,184,0,0.2)' }}
                >
                  Onboard to Unlock <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* ── Perks Hero Section ── */}
          <div className="perks-hero">
            <div className="hero-glow" />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#0a0a0a', border: '1px solid rgba(0,0,0,0.15)', padding: '0.35rem 0.95rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FFB800', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
              <Sparkles size={12} className="animate-pulse" style={{ color: '#FFB800' }} /> Operator Alliance Privileges
            </div>
            <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.75rem', color: '#000000', fontWeight: '900', position: 'relative', zIndex: 1 }}>
              Cooperative Ecosystem & VIP Perks
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#1a1a1a', fontWeight: '600', maxWidth: '680px', margin: '0 auto 2rem auto', lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
              Queens OS goes beyond dynamic ride coordination. We operate a highly supportive, financially empowering driver-first ecosystem featuring baseline income protection, interest-free capital grants, and premium family security.
            </p>

            {/* Search Bar */}
            <div className="perks-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search perks, credit limits, or benefit details..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tab Filters */}
            <div className="filter-tabs">
              <button 
                className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Perks ({perks.length})
              </button>
              <button 
                className={`filter-btn ${activeTab === 'financial' ? 'active' : ''}`}
                onClick={() => setActiveTab('financial')}
              >
                Financial & Capital
              </button>
              <button 
                className={`filter-btn ${activeTab === 'protection' ? 'active' : ''}`}
                onClick={() => setActiveTab('protection')}
              >
                Health & Family Protection
              </button>
              <button 
                className={`filter-btn ${activeTab === 'earnings' ? 'active' : ''}`}
                onClick={() => setActiveTab('earnings')}
              >
                Earning Enhancements
              </button>
            </div>
          </div>

          {/* ── Perks Grid with slide-up hovered cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.50rem' }}>
            {filteredPerks.length > 0 ? (
              filteredPerks.map(perk => (
                <div key={perk.id} className="perk-card-wrapper">
                  
                  {/* MAIN CARD CONTENT */}
                  <div className="perk-card-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--primary)', display: 'flex' }}>
                        {perk.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-outfit)', margin: 0 }}>{perk.title}</h4>
                        <span className={`badge perk-badge-${perk.badgeType}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', display: 'inline-block', marginTop: '0.25rem', borderRadius: '4px' }}>
                          {perk.badge}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--foreground-muted)', lineHeight: '1.55', margin: 0 }}>
                      {perk.desc}
                    </p>
                  </div>

                  {/* HOVER SLIDE-UP CONTENT CARD */}
                  <div className="perk-card-slideup">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <Sparkles size={12} className="animate-pulse" /> Unlock Cooperative Power
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-outfit)', margin: 0 }}>
                        {perk.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', margin: 0 }}>
                        {perk.moreInfo}
                      </p>
                    </div>

                    <button 
                      onClick={() => setSelectedPerk(perk)}
                      className="btn btn-primary"
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        padding: '0.6rem',
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'rgba(255, 184, 0, 0.1)',
                        border: '1px solid rgba(255, 184, 0, 0.3)',
                        color: 'var(--primary)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary)';
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 184, 0, 0.1)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                    >
                      See More & How it Works <ChevronRight size={14} />
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.01)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem' }}>No perks matched your search or category selection.</p>
                <button 
                  className="btn btn-secondary" 
                  style={{ marginTop: '1rem' }} 
                  onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Call to Action Footer Banner ── */}
          <div className="cta-banner">
            <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
              Ready to Unlock the Full  Alliance?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--foreground-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
              Begin your high-fidelity document onboarding now. Complete our 4-step secure verification wizard to register your vehicle, bind your biometric profile, and activate all 19 system perks.
            </p>
            <button 
              onClick={() => {
                if (onNavigate) {
                  onNavigate('driver');
                } else {
                  navigate('/driver');
                }
              }}
              className="btn btn-primary"
              style={{ 
                margin: '0 auto', 
                padding: '0.8rem 1.8rem', 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                boxShadow: '0 8px 30px rgba(255,184,0,0.3)' 
              }}
            >
              Launch Driver Signup Portal <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

    </div>
  );
}
