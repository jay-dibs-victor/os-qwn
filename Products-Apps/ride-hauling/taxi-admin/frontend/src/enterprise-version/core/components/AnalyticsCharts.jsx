import React from 'react';

/**
 * Custom SVG Line Chart
 * Maps time-series data to a responsive SVG path.
 */
export const LineChart = ({ data, color = '#FFB800', height = 200 }) => {
  if (!data || data.length === 0) return <div className="text-muted p-5 text-center">No data available</div>;

  const padding = 20;
  const maxVal = Math.max(...data.map(d => d.total || d.count || 0), 1);
  const width = 500;
  
  const points = data.map((d, i) => {
    const x = padding + (i * ((width - padding * 2) / (data.length - 1)));
    const y = (height - padding) - (((d.total || d.count || 0) / maxVal) * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path
        d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
        fill="url(#gradient)"
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

/**
 * Custom SVG Bar Chart
 * Grouped bars for traction analysis.
 */
export const BarChart = ({ data, color = '#1e90ff', height = 200 }) => {
  if (!data || data.length === 0) return <div className="text-muted p-5 text-center">No data available</div>;

  const padding = 20;
  const maxVal = Math.max(...data.map(d => d.count || 0), 1);
  const width = 500;
  const barWidth = (width - padding * 2) / data.length;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const x = padding + i * barWidth;
        const h = ((d.count || 0) / maxVal) * (height - padding * 2);
        const y = height - padding - h;
        return (
          <rect
            key={i}
            x={x + 5}
            y={y}
            width={barWidth - 10}
            height={h}
            fill={color}
            rx="4"
          >
           <title>{d._id}: {d.count}</title>
          </rect>
        );
      })}
    </svg>
  );
};

/**
 * Custom SVG Donut Chart
 * For success rates and status distributions.
 */
export const DonutChart = ({ data, size = 200 }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, d) => acc + d.count, 0);
  let currentAngle = 0;
  const center = size / 2;
  const radius = size * 0.4;
  const strokeWidth = size * 0.15;
  const circumference = 2 * Math.PI * radius;

  const colors = {
    COMPLETED: '#2ed573',
    CANCELLED: '#ff4757',
    STARTED: '#ffa502',
    SEARCHING: '#1e90ff',
    ARRIVED: '#FFB800'
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const angle = (d.count / total) * 360;
        const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
        const rotation = currentAngle - 90;
        currentAngle += angle;

        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors[d._id] || '#eee'}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            transform={`rotate(${rotation} ${center} ${center})`}
          />
        );
      })}
      <circle cx={center} cy={center} r={radius - strokeWidth} fill="#fff" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontWeight: 800, fontSize: '18px' }}>
        {total}
      </text>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: '10px', fill: '#999', textTransform: 'uppercase' }}>
        Total Rides
      </text>
    </svg>
  );
};
