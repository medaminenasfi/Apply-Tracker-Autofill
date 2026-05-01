// Extension Configuration
// Update these URLs for different environments

const config = {
  development: {
    FRONTEND_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3000',
  },
  production: {
    FRONTEND_URL: 'https://your-frontend-domain.com',
    API_URL: 'https://your-api-domain.com',
  }
};

// Set current environment (change 'development' to 'production' for production)
const ENVIRONMENT = 'development';

module.exports = config[ENVIRONMENT];
