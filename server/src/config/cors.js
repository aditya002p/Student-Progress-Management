/**
 * Enhanced CORS Configuration
 */

const getAllowedOrigins = () => {
  const origins = [];

  const env = process.env.NODE_ENV || 'development';
  console.log(`[CORS] Detected NODE_ENV: ${env}`);

  if (env === 'development') {
    // Allow localhost ports in development
    origins.push('http://localhost:5173'); // Vite
    origins.push('http://127.0.0.1:3000'); // CRA
    origins.push('http://localhost:8080');
  } else {
    // Use env-provided origins in production
    const productionOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];
    origins.push(...productionOrigins);
  }

  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL);
  }

  console.log(`[CORS] Allowed origins:`, origins);
  return origins;
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    console.log(`[CORS] Request origin: ${origin}`);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Allowed`);
      callback(null, true);
    } else {
      console.warn(`[CORS] ❌ Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;
