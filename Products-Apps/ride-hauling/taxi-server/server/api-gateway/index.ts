import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
console.log('[API Gateway] Booting...');
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';

const app = express();
const PORT: any = process.env.PORT || 12000;

const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:12001';
const RIDE_SERVICE_URL    = process.env.RIDE_SERVICE_URL    || 'http://localhost:12002';
const FLIGHT_INVENTORY_URL= process.env.FLIGHT_INVENTORY_URL|| 'http://localhost:12003';
const FLIGHT_BOOKING_URL  = process.env.FLIGHT_BOOKING_URL  || 'http://localhost:12004';
const SHIPPING_SERVICE_URL= process.env.SHIPPING_SERVICE_URL|| 'http://localhost:12006';
const AI_OS_URL           = process.env.AI_OS_URL           || 'http://localhost:12010';

// SaaS backend URLs for SSO integration
const SAAS_GATEWAY_URL    = process.env.SAAS_GATEWAY_URL    || 'http://localhost:3000';
const SAAS_AUTH_URL       = process.env.SAAS_AUTH_URL       || 'http://localhost:3000/auth';
const SAAS_CLIENT_ID      = process.env.SAAS_CLIENT_ID      || 'taxi-server';
const SAAS_CLIENT_SECRET  = process.env.SAAS_CLIENT_SECRET  || '';
const SAAS_SCOPES         = process.env.SAAS_SCOPES         || 'wallet:read earnings:read trips:read';

app.use(cors());
app.use(morgan('dev'));

/**
 * Creates a proxy middleware with a standardised onError handler.
 * Without this, when an upstream service is down, http-proxy-middleware
 * silently destroys the socket → browser sees ERR_EMPTY_RESPONSE.
 */
function makeProxy(target: string, opts: Record<string, any> = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    on: {
      error: (err: any, req: any, res: any) => {
        console.error(`[API Gateway] Proxy error → ${target}: ${err.message}`);
        console.error(`[API Gateway] Request: ${req.method} ${req.url}`);
        // If it's a standard HTTP request, res will have writeHead.
        // If it's a WebSocket upgrade, res might be a Socket.
        if (res && res.writeHead && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 502,
            error: 'Bad Gateway',
            message: `Upstream service unavailable: ${target}`,
            detail: err.message,
            path: req.url,
            method: req.method
          }));
        } else if (res && res.end) {
          // Fallback for sockets or other stream-like response objects
          res.end();
        }
      },
    },
    ...opts,
  });
}

// ── SaaS SSO Token Exchange ──────────────────────────────────────────────
// Exchanges a taxi-server user JWT for a SaaS scoped access token.
// Used by taxi-server microservices to authenticate against the SaaS backend.
app.post('/api/v1/saas/token-exchange', express.json(), async (req, res) => {
  try {
    const userToken = req.body.user_token;
    if (!userToken) {
      return res.status(400).json({ error: 'user_token is required' });
    }

    const response = await axios.post(
      `${SAAS_AUTH_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        client_id: SAAS_CLIENT_ID,
        client_secret: SAAS_CLIENT_SECRET,
        subject_token: userToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        scope: SAAS_SCOPES,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    res.json(response.data);
  } catch (err: any) {
    const status = err.response?.status || 502;
    const message = err.response?.data || err.message;
    console.error('[SSO] Token exchange failed:', message);
    res.status(status).json({ error: 'SSO token exchange failed', detail: message });
  }
});

// Proxy for SaaS API requests (wallet, earnings, trips, etc.)
// The taxi-server frontends send requests to /api/v1/saas/* which are
// proxied to the SaaS gateway with the exchanged Bearer token.
app.use(
  '/api/v1/saas',
  express.json(),
  async (req: any, res: any, next: any) => {
    // Extract the user token from the Authorization header
    const authHeader = req.headers.authorization as string;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing taxi-server Bearer token' });
    }
    const userToken = authHeader.substring(7);

    try {
      // Exchange the taxi-server user token for a SaaS token
      const tokenResponse = await axios.post(
        `${SAAS_AUTH_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          client_id: SAAS_CLIENT_ID,
          client_secret: SAAS_CLIENT_SECRET,
          subject_token: userToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
          scope: SAAS_SCOPES,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      // Replace the taxi-server token with the SaaS token and proxy
      req.headers.authorization = `Bearer ${tokenResponse.data.access_token}`;
      // Strip the /api/v1/saas prefix when proxying
      req.url = req.url.replace(/^\/api\/v1\/saas/, '');

      // Proxy to the SaaS gateway
      createProxyMiddleware({
        target: SAAS_GATEWAY_URL,
        changeOrigin: true,
        on: {
          proxyReq: (proxyReq: any) => {
            proxyReq.setHeader('Authorization', `Bearer ${tokenResponse.data.access_token}`);
          },
          error: (err: any, _req: any, _res: any) => {
            console.error('[SSO] SaaS proxy error:', err.message);
          },
        },
      })(req, res, next);
    } catch (err: any) {
      const status = err.response?.status || 502;
      const message = err.response?.data || err.message;
      console.error('[SSO] SaaS proxy setup failed:', message);
      res.status(status).json({ error: 'SSO proxy failed', detail: message });
    }
  },
);

// Driver Auth Proxy (Specific routes handled by ride-service)
app.use(
  makeProxy(RIDE_SERVICE_URL, {
    pathFilter: '/api/v1/auth/drivers-'
  })
);

// Auth Service Proxies
app.use(
  makeProxy(AUTH_SERVICE_URL, {
    pathFilter: ['/api/v1/auth', '/api/v1/google', '/api/v1/request', '/api/v1/logout']
  })
);

// Flight Inventory Service Proxy
app.use(
  makeProxy(FLIGHT_INVENTORY_URL, {
    pathFilter: '/api/v1/flights'
  })
);

// Flight Booking Service Proxy
app.use(
  makeProxy(FLIGHT_BOOKING_URL, {
    pathFilter: '/api/v1/bookings/flights'
  })
);

// Shipping Service Proxy
app.use(
  makeProxy(SHIPPING_SERVICE_URL, {
    pathFilter: '/api/v1/shipping'
  })
);

// AI Operating System Proxy
app.use(
  makeProxy(AI_OS_URL, {
    pathFilter: '/api/v1/os'
  })
);

// Ride Service Proxies (Catch-all for other /api/v1 routes)
const rideProxy = makeProxy(RIDE_SERVICE_URL, {
  pathFilter: (path: string) => path.startsWith('/api/v1') || path.startsWith('/health') || path.startsWith('/socket.io')
});

app.use(rideProxy);

// WebSocket catch-all for root and other non-API routes
const wsProxy = makeProxy(RIDE_SERVICE_URL, { 
  ws: true,
  pathFilter: (path: string) => path === '/' || !path.startsWith('/api/v1')
});

app.use('/', wsProxy);

// Note: WebSocket upgrade requests are handled automatically by `ws: true`
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Gateway] Running on 0.0.0.0:${PORT}`);
});

// Pass the upgrade request to the proxy to ensure WS routes correctly
server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/socket.io')) {
    (rideProxy as any).upgrade(req, socket, head);
  } else {
    (wsProxy as any).upgrade(req, socket, head);
  }
});
