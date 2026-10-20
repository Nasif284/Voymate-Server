import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'voymate_',
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'voymate_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Total HTTP requests
const httpRequestsTotal = new client.Counter({
  name: 'voymate_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP errors

const httpErrorsTotal = new client.Counter({
  name: 'voymate_http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active HTTP requests
const activeRequests = new client.Gauge({
  name: 'voymate_http_active_requests',
  help: 'Number of currently active HTTP requests',
  registers: [register],
});

// Login attempts

const loginAttemptsTotal = new client.Counter({
  name: 'voymate_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'],
  registers: [register],
});

// Chat messages
const chatMessagesTotal = new client.Counter({
  name: 'voymate_chat_messages_total',
  help: 'Total number of chat messages sent',
  registers: [register],
});

export {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  activeRequests,
  loginAttemptsTotal,
  chatMessagesTotal,
};
