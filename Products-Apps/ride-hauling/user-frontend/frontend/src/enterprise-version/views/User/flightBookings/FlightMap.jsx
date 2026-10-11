import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FlightMap = ({ originCoords, destCoords, style = { height: '100%', width: '100%' } }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pathRef = useRef(null);

  const [arcD, setArcD] = useState('');
  const [originPx, setOriginPx] = useState(null);
  const [destPx, setDestPx] = useState(null);
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });
  const [dotAngle, setDotAngle] = useState(0);
  const animRef = useRef(null);

  // ── Init Leaflet once ─────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // Use ResizeObserver to reliably trigger invalidateSize during animations
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      resizeObserver.disconnect();
    };
  }, []);

  // ── Recalculate arc pixel coords ─────────────
  const recalc = useCallback(() => {
    const map = mapRef.current;
    if (!map || !originCoords || !destCoords) return;
    const o = map.latLngToContainerPoint(L.latLng(originCoords[0], originCoords[1]));
    const d = map.latLngToContainerPoint(L.latLng(destCoords[0], destCoords[1]));
    const mx = (o.x + d.x) / 2;
    const dist = Math.sqrt((d.x - o.x) ** 2 + (d.y - o.y) ** 2);
    // Control point: always curves upward (sky arc)
    const cy = Math.min(o.y, d.y) - dist * 0.38;
    setArcD(`M ${o.x} ${o.y} Q ${mx} ${cy} ${d.x} ${d.y}`);
    setOriginPx({ x: o.x, y: o.y });
    setDestPx({ x: d.x, y: d.y });
  }, [originCoords, destCoords]);

  // Re-bind map events whenever recalc changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on('move zoom resize', recalc);
    return () => map.off('move zoom resize', recalc);
  }, [recalc]);

  // Fit bounds + initial draw when coords change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !originCoords || !destCoords) return;
    map.fitBounds(
      [[originCoords[0], originCoords[1]], [destCoords[0], destCoords[1]]],
      { padding: [120, 120], animate: true, duration: 1.2 }
    );
    setTimeout(recalc, 1300);
  }, [originCoords, destCoords, recalc]);

  // ── Animate plane dot along arc ───────────────
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (!arcD || !pathRef.current) return;
    const path = pathRef.current;
    const total = path.getTotalLength?.() ?? 200;
    const duration = 2800;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const t = ((ts - start) % duration) / duration;
      const pt = path.getPointAtLength(t * total);
      const pt2 = path.getPointAtLength(Math.min((t + 0.01) * total, total));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
      setDotPos({ x: pt.x, y: pt.y });
      setDotAngle(angle);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [arcD]);

  const showArc = arcD && originPx && destPx;

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Real Leaflet street map */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* SVG overlay — pointer-events: none so map stays interactive */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 500 }}
      >
        {showArc && (
          <g>
            {/* Glow shadow arc */}
            <path d={arcD} fill="none" stroke="#ffb800" strokeWidth="6" strokeOpacity="0.18" strokeLinecap="round" />

            {/* Primary dashed arc — missile trajectory */}
            <path
              ref={pathRef}
              d={arcD}
              fill="none"
              stroke="#ffb800"
              strokeWidth="2.5"
              strokeDasharray="10 7"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />

            {/* ✈ animated plane */}
            <g transform={`translate(${dotPos.x}, ${dotPos.y}) rotate(${dotAngle})`}>
              <circle r="10" fill="#1a1a1a" fillOpacity="0.9" />
              <text x="0" y="5" textAnchor="middle" fontSize="12" fill="#ffb800">✈</text>
            </g>

            {/* Origin — amber pulsating ring */}
            <circle cx={originPx.x} cy={originPx.y} r="5" fill="#ffb800" />
            <circle cx={originPx.x} cy={originPx.y} r="5" fill="none" stroke="#ffb800" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="7;20;7" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Destination — red pulsating ring */}
            <circle cx={destPx.x} cy={destPx.y} r="5" fill="#e74c3c" />
            <circle cx={destPx.x} cy={destPx.y} r="5" fill="none" stroke="#e74c3c" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="7;20;7" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};

export default FlightMap;
