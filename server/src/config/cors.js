/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing options for the API
 */

// Determine allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [];
  
  // Add environment-specific origins
  if (process.env.NODE_ENV === 'development') {
    // In development, allow localhost on common ports
    origins.push('http://localhost:3000'); // React default
    origins.push('http://127.0.0.1:3000');
    origins.push('http://localhost:8080'); // Alternative port
  } else {
    // In production, use specific allowed origins from env var or default to empty
    const productionOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : [];
    origins.push(...productionOrigins);
  }
  
  // Add any additional origins that should always be allowed
  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL);
  }
  
  return origins;
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, curl requests, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400, // Cache preflight request results for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};

module.exports = corsOptions;
