import { FaCar, FaCarSide, FaStar, FaUsers, FaBolt } from 'react-icons/fa';

export const RIDE_TYPES = [
  {
    id: 'economy', name: 'Economy', capacity: 4, eta: '5 min',
    basePrice: 4000, perKm: 150, description: 'Affordable rides, all to yourself',
    icon: FaCar,
  },
  {
    id: 'comfort', name: 'Comfort', capacity: 4, eta: '4 min',
    basePrice: 5200, perKm: 200, description: 'Newer cars with extra legroom',
    icon: FaCarSide,
  },
  {
    id: 'premium', name: 'Premium', capacity: 4, eta: '7 min',
    basePrice: 7500, perKm: 300, description: 'Luxury rides with top-rated drivers',
    icon: FaStar,
  },
  {
    id: 'xl', name: 'XL', capacity: 6, eta: '6 min',
    basePrice: 5800, perKm: 250, description: 'Extra space for groups',
    icon: FaUsers,
  },
  {
    id: 'electric', name: 'Electric', capacity: 4, eta: '8 min',
    basePrice: 4200, perKm: 160, description: 'Green rides, zero emissions',
    icon: FaBolt,
  },
];

export const PRICE_MAP = {
  economy: { base: 4000, dist: 900, total: 4900 },
  comfort: { base: 5200, dist: 1200, total: 6400 },
  premium: { base: 7500, dist: 1800, total: 9300 },
  xl: { base: 5800, dist: 1500, total: 7300 },
  electric: { base: 4200, dist: 960, total: 5160 },
};

export function formatPrice(n) {
  return '₦' + n.toLocaleString();
}
