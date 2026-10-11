function coordDist(a, b) {
  const dlat = a[0] - b[0];
  const dlng = a[1] - b[1];
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function calcHeading(from, to) {
  const dlat = to[0] - from[0];
  const dlng = to[1] - from[1];
  const angle = Math.atan2(dlng, dlat) * (180 / Math.PI);
  return (angle + 360) % 360;
}

function cumulativeSegmentLengths(polyline) {
  const lengths = [0];
  for (let i = 1; i < polyline.length; i++) {
    lengths.push(lengths[i - 1] + coordDist(polyline[i - 1], polyline[i]));
  }
  return lengths;
}

function interpolatePolyline(polyline, t) {
  if (!polyline || polyline.length === 0) return null;
  if (polyline.length === 1) return polyline[0];

  const segLengths = cumulativeSegmentLengths(polyline);
  const totalLength = segLengths[segLengths.length - 1];
  if (totalLength === 0) return polyline[0];

  const targetDist = t * totalLength;
  for (let i = 1; i < segLengths.length; i++) {
    if (targetDist <= segLengths[i]) {
      const segStart = segLengths[i - 1];
      const segEnd = segLengths[i];
      const segT = (targetDist - segStart) / (segEnd - segStart);
      return lerp(polyline[i - 1], polyline[i], Math.max(0, Math.min(1, segT)));
    }
  }
  return polyline[polyline.length - 1];
}

const DEG_TO_KM = 111.32;

export function startDriverSimulation({ pickupCoords, dropoffCoords, routeCoords, selectedRide, onUpdate, onComplete }) {
  const pCoords = pickupCoords;
  const dCoords = dropoffCoords;
  const distKm = coordDist(pCoords, dCoords) * DEG_TO_KM;
  const startPos = [pCoords[0] + 0.018, pCoords[1] - 0.008];
  const approxMin = Math.max(Math.round(distKm / 30 * 60), 8);

  let driverPos = startPos;
  let prevPos = startPos;
  let phase = 'to_pickup';
  let lastTime = performance.now();
  let running = true;
  let callbacksFired = { arriving: false, en_route: false, completed: false };
  let currentEta = 5 * 60;
  let heading = 0;

  const assignedDuration = 5000;
  const arriveDuration = 3000;
  const routeDuration = Math.max(distKm * 1500, 6000);

  let elapsed = 0;

  function tick() {
    if (!running) return;

    const now = performance.now();
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;
    elapsed += dt;

    if (phase === 'to_pickup') {
      const t = Math.min(elapsed / assignedDuration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      driverPos = lerp(startPos, pCoords, eased);
      currentEta = Math.max(0, Math.round((1 - t) * 5 * 60));

      if (coordDist(prevPos, driverPos) > 0.00001) {
        heading = calcHeading(prevPos, driverPos);
      }

      if (t >= 1 && !callbacksFired.arriving) {
        callbacksFired.arriving = true;
        phase = 'arriving';
        elapsed = 0;
        currentEta = 2 * 60;
      }
    } else if (phase === 'arriving') {
      currentEta = Math.max(0, Math.round((1 - Math.min(elapsed / arriveDuration, 1)) * 2 * 60));
      const orbitAngle = elapsed * 0.003;
      driverPos = [
        pCoords[0] + 0.002 * Math.sin(orbitAngle),
        pCoords[1] + 0.002 * Math.cos(orbitAngle),
      ];

      if (coordDist(prevPos, driverPos) > 0.00001) {
        heading = calcHeading(prevPos, driverPos);
      }

      if (elapsed >= arriveDuration && !callbacksFired.en_route) {
        callbacksFired.en_route = true;
        phase = 'to_destination';
        elapsed = 0;
        currentEta = approxMin * 60;

        const dirTarget = routeCoords && routeCoords.length > 1
          ? routeCoords[Math.min(5, routeCoords.length - 1)]
          : lerp(pCoords, dCoords, 0.05);
        heading = calcHeading(driverPos, dirTarget);
      }
    } else if (phase === 'to_destination') {
      const t = Math.min(elapsed / routeDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      if (routeCoords && routeCoords.length > 1) {
        driverPos = interpolatePolyline(routeCoords, eased);
      } else {
        driverPos = lerp(pCoords, dCoords, eased);
      }

      if (coordDist(prevPos, driverPos) > 0.00001) {
        heading = calcHeading(prevPos, driverPos);
      }

      const jitterLat = 0.0008 * Math.sin(elapsed * 0.005);
      const jitterLng = 0.0008 * Math.cos(elapsed * 0.007);
      driverPos = [driverPos[0] + jitterLat, driverPos[1] + jitterLng];

      currentEta = Math.max(0, Math.round((1 - t) * approxMin * 60));

      if (t >= 1 && !callbacksFired.completed) {
        callbacksFired.completed = true;
        running = false;
      }
    }

    prevPos = [...driverPos];

    onUpdate({
      driverPos: [...driverPos],
      heading,
      eta: currentEta,
      status: phase === 'to_pickup' ? 'assigned' : phase === 'arriving' ? 'arriving' : 'en_route',
      phaseProgress: phase === 'to_pickup' ? Math.min(elapsed / assignedDuration, 1) : phase === 'arriving' ? Math.min(elapsed / arriveDuration, 1) : Math.min(elapsed / routeDuration, 1),
    });

    if (callbacksFired.completed) {
      onComplete({
        pickup: 'Ikeja',
        dropoff: 'Victoria Island',
        distance: distKm,
        duration: approxMin,
        rideType: selectedRide,
      });
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  let rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };
}
