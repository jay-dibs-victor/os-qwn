"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import countryToCurrency from 'country-to-currency';

import './WebPlatformShowcase.css';
import { steps } from './wps/constants';
import SidebarFlows from './wps/SidebarFlows';
import MapLayer from './wps/MapLayer';
import OverlayHUD from './wps/OverlayHUD';
import FlightFlow from './wps/FlightFlow';
import EcosystemComplete from './wps/EcosystemComplete';
import SplashFlow from './wps/SplashFlow';

export default function WebPlatformShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [currencyInfo, setCurrencyInfo] = useState({ code: 'NGN', rate: 1500 });

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        const countryCode = ipData.country_code;
        const code = countryToCurrency[countryCode as keyof typeof countryToCurrency] || 'USD';
        
        const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await rateRes.json();
        const rate = rateData.rates[code] || 1;
        
        setCurrencyInfo({ code, rate });
      } catch (err) {
        console.error('Failed to fetch currency data', err);
      }
    };
    fetchCurrencyData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (baseUsd: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyInfo.code,
      maximumFractionDigits: 0
    }).format(baseUsd * currencyInfo.rate);
  };

  const isSplashFlow = activeStep === 0;
  const isFlightFlow = activeStep >= 9 && activeStep <= 12;
  const isItineraryFlow = activeStep === 25;
  const showSidebar = (activeStep > 0 && activeStep < 9) || (activeStep >= 13 && activeStep < 25);

  return (
    <section className="wps-container relative">
      <div className="wps-wrapper">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-outfit mb-6">
              The Web Platform Experience
            </h2>
            <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
              A frictionless booking flow designed for scale. From intent to global logistics, entirely on the web.
            </p>
          </motion.div>
        </div>

        <div className="wps-desktop-frame relative overflow-hidden">
          <SplashFlow activeStep={activeStep} />
          
          <div className="wps-browser-header relative z-10">
            <div className="wps-browser-dots">
              <div className="wps-dot red" />
              <div className="wps-dot yellow" />
              <div className="wps-dot green" />
            </div>
            <div className="wps-browser-url">
              <Globe size={12} className="mr-2 opacity-50" />
              {isSplashFlow ? 'app.queens.os/init' : isFlightFlow ? 'app.queens.os/flights' : isItineraryFlow ? 'app.queens.os/ecosystem' : activeStep >= 22 ? 'app.queens.os/marine' : activeStep >= 19 ? 'app.queens.os/rail' : activeStep >= 15 ? 'app.queens.os/logistics' : 'app.queens.os/book'}
            </div>
            <div className="wps-browser-dots" /> {/* Spacer */}
          </div>

          <div className="wps-body">
            
            <SidebarFlows activeStep={activeStep} formatPrice={formatPrice} />

            {/* Main Map/Display Area */}
            <div className="wps-map-area" style={{ width: showSidebar ? 'auto' : '100%' }}>
              
              <MapLayer activeStep={activeStep} />
              <OverlayHUD activeStep={activeStep} />
              <FlightFlow activeStep={activeStep} formatPrice={formatPrice} />
              <EcosystemComplete activeStep={activeStep} />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
