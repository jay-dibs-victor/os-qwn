import { RideRequestDTO, LatLngDTO, FareDTO, PassengerDTO, PaymentMethod } from '../api/dto';

const PASSENGER_NAMES = [
  { first: 'Femi', last: 'Adeyemi' },
  { first: 'Chidi', last: 'Okonkwo' },
  { first: 'Amaka', last: 'Eze' },
  { first: 'Babatunde', last: 'Ojo' },
  { first: 'Tunde', last: 'Balogun' },
  { first: 'Ngozi', last: 'Okafor' },
  { first: 'Olumide', last: 'Afolabi' },
  { first: 'Chinaza', last: 'Igbokwe' },
  { first: 'Adebayo', last: 'Lawal' },
  { first: 'Ifeoma', last: 'Onyeka' },
  { first: 'Emeka', last: 'Nwosu' },
  { first: 'Folake', last: 'Adeniyi' },
  { first: 'Kemi', last: 'Adeyemo' },
  { first: 'Obinna', last: 'Umeh' },
  { first: 'Sade', last: 'Bakare' },
];

const LAGOS_LOCATIONS: { address: string; coords: LatLngDTO }[] = [
  { address: '12 Victoria Island, Lagos', coords: { latitude: 6.4281, longitude: 3.4219 } },
  { address: '45 Lekki Phase 1, Lagos', coords: { latitude: 6.4488, longitude: 3.4778 } },
  { address: '78 Ikeja GRA, Lagos', coords: { latitude: 6.6018, longitude: 3.3515 } },
  { address: '156 Yaba Main Campus, Lagos', coords: { latitude: 6.5111, longitude: 3.3848 } },
  { address: '89 Ikoyi, Lagos', coords: { latitude: 6.4531, longitude: 3.4219 } },
  { address: '234 Surulere, Lagos', coords: { latitude: 6.5000, longitude: 3.3500 } },
  { address: '67 Ajah, Lagos', coords: { latitude: 6.4688, longitude: 3.5863 } },
  { address: '312 Magodo, Lagos', coords: { latitude: 6.6108, longitude: 3.3853 } },
  { address: '145 Gbagada, Lagos', coords: { latitude: 6.5444, longitude: 3.3848 } },
  { address: '203 Marina, Lagos', coords: { latitude: 6.4500, longitude: 3.4000 } },
  { address: '56 Allen Avenue, Ikeja, Lagos', coords: { latitude: 6.6065, longitude: 3.3453 } },
  { address: '178 Lekki Toll Gate, Lagos', coords: { latitude: 6.4600, longitude: 3.4900 } },
  { address: '92 Maryland, Lagos', coords: { latitude: 6.5472, longitude: 3.3569 } },
  { address: '134 Anthony Village, Lagos', coords: { latitude: 6.5611, longitude: 3.3669 } },
  { address: '256 Ogba, Lagos', coords: { latitude: 6.6278, longitude: 3.3169 } },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomLocation(): LatLngDTO {
  const base = pickRandom(LAGOS_LOCATIONS);
  return {
    latitude: base.coords.latitude + (Math.random() - 0.5) * 0.008,
    longitude: base.coords.longitude + (Math.random() - 0.5) * 0.008,
  };
}

function generateRandomAddress(): string {
  return pickRandom(LAGOS_LOCATIONS).address;
}

function generateRealisticAddresses(): { pickup_address: string; destination_address: string; pickup: LatLngDTO; destination: LatLngDTO } {
  const pickupLoc = pickRandom(LAGOS_LOCATIONS);
  let destLoc = pickRandom(LAGOS_LOCATIONS);
  // Avoid duplicate locations
  while (destLoc.address === pickupLoc.address) {
    destLoc = pickRandom(LAGOS_LOCATIONS);
  }
  return {
    pickup_address: pickupLoc.address,
    destination_address: destLoc.address,
    pickup: {
      latitude: pickupLoc.coords.latitude + (Math.random() - 0.5) * 0.005,
      longitude: pickupLoc.coords.longitude + (Math.random() - 0.5) * 0.005,
    },
    destination: {
      latitude: destLoc.coords.latitude + (Math.random() - 0.5) * 0.005,
      longitude: destLoc.coords.longitude + (Math.random() - 0.5) * 0.005,
    },
  };
}

function calculateFare(
  baseFare: number,
  distanceKm: number,
  durationMin: number,
  toll: number,
  surge: number
): FareDTO {
  const distanceFare = distanceKm * 120;
  const timeFare = durationMin * 25;
  const subtotal = baseFare + distanceFare + timeFare + toll;
  const total = subtotal * surge;
  const amount = Math.round(total);
  const commissionAmount = Math.round(amount * 0.1);

  return {
    amount,
    currency: '₦',
    base_fare: Math.round(baseFare),
    distance_fare: Math.round(distanceFare),
    time_fare: Math.round(timeFare),
    surge,
    tip: 0,
    toll: Math.round(toll),
  };
}

function generateRandomPassenger(): PassengerDTO {
  const name = PASSENGER_NAMES[Math.floor(Math.random() * PASSENGER_NAMES.length)];
  return {
    id: `passenger-${Math.random().toString(16).slice(2)}`,
    first_name: name.first,
    last_name: name.last,
    rating: 4 + Math.random(),
    phone: `+44 7${Math.floor(Math.random() * 900000000 + 100000000)}`,
  };
}

export function generateRandomRide(): RideRequestDTO {
  const { pickup_address, destination_address, pickup, destination } = generateRealisticAddresses();
  // Approximate distance & duration from realistic Lagos coordinates
  const dlat = pickup.latitude - destination.latitude;
  const dlng = pickup.longitude - destination.longitude;
  const approxDeg = Math.sqrt(dlat * dlat + dlng * dlng);
  const distanceKm = Math.max(2, Math.round(approxDeg * 111 * 100) / 100); // 1° ≈ 111 km
  const durationMin = Math.max(8, Math.round(distanceKm * 3 + Math.random() * 10));

  const baseFare = 300 + Math.random() * 400;
  const surge = Math.random() < 0.15 ? 1.2 : 1.0;
  const toll = Math.random() < 0.25 ? 100 + Math.random() * 300 : 0;

  const fare = calculateFare(baseFare, distanceKm, durationMin, toll, surge);
  const commissionAmount = Math.round(fare.amount * 0.1);

  const paymentOptions: PaymentMethod[] = ['cash', 'wallet', 'bank_card', 'voucher', 'queens_coin'];
  const paymentMethod = pickRandom(paymentOptions);

  return {
    id: `mock-ride-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    pickup,
    destination,
    fare,
    passenger: generateRandomPassenger(),
    pickup_address,
    destination_address,
    distance_km: distanceKm,
    duration_min: durationMin,
    paymentMethod,
    commissionAmount,
    paymentStatus: 'pending',
    commissionStatus: 'pending',
  };
}

export function getRandomDelay(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
