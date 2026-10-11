/**
 * Shared constants and configuration for microservices.
 */

export const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:12000';
export const SERVER_URL = process.env.SERVER_URL || `${GATEWAY_URL}/api/v1`;
export const USER_APP_URL = process.env.USER_APP_URL || 'http://localhost:4002';
export const FRONTEND_URL = process.env.FRONTEND_URL || USER_APP_URL;
export const DRIVER_APP_URL = process.env.DRIVER_APP_URL || 'http://localhost:4004';
export const ADMIN_APP_URL = process.env.ADMIN_APP_URL || 'http://localhost:4001';

export const DOCKER_HOST = process.env.DOCKER_HOST || 'http://host.docker.internal';

export const CORS_ALLOWED_ORIGINS = [
  // Docker desktop host gateway
  `${DOCKER_HOST}:12000`,
  `${DOCKER_HOST}:4002`,
  `${DOCKER_HOST}:4004`,
  `${DOCKER_HOST}:4000`,
  `${DOCKER_HOST}:4001`,

  // Local network wildcard — any IP on common ports (resolved at runtime)
  // The CORS middleware also accepts any origin matching :port pattern
  // Gateway
  GATEWAY_URL,
  'http://localhost:12000',
  'http://127.0.0.1:12000',

  // User frontend (Docker: 4002, dev: 4002)
  USER_APP_URL,
  'http://localhost:4002',
  'http://127.0.0.1:4002',

  // Driver frontend (Docker: 4004, npm dev: 4000, vite.config dev: 4004)
  DRIVER_APP_URL,
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:4004',
  'http://127.0.0.1:4004',

  // Admin frontend (4001 and 4003 fallback)
  ADMIN_APP_URL,
  'http://localhost:4001',
  'http://127.0.0.1:4001',
  'http://localhost:4003',
  'http://127.0.0.1:4003',

  // Vite dev server defaults
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',

  // Expo web (mobile-user / mobile-driver running via expo start --web)
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://localhost:19000',
  'http://127.0.0.1:19000',

  // Expo Metro bundler — LAN access (physical device / Expo Go)
  'http://10.112.148.175:8081',
  'http://10.112.148.175:8082',
  'http://10.112.148.175:19000',
  'http://10.112.148.175:19006',
  'exp://10.112.148.175:8081',
  'exp://10.112.148.175:8082',
  'exp://10.112.148.175:19000',
  'exp://10.112.148.175:19006',
];

