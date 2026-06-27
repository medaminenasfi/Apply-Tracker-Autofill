// ApplyFlow extension — single source for API/frontend URLs
// Change APPLYFLOW_ENV to 'production' and set production URLs before shipping extension.zip

const APPLYFLOW_CONFIGS = {
  development: {
    FRONTEND_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3000',
  },
  production: {
    FRONTEND_URL: 'https://your-frontend-domain.com',
    API_URL: 'https://your-api-domain.com',
  },
};

/** @type {'development' | 'production'} */
const APPLYFLOW_ENV = 'development';

const APPLYFLOW_CONFIG = APPLYFLOW_CONFIGS[APPLYFLOW_ENV] || APPLYFLOW_CONFIGS.development;

/** Host patterns for auth-content.js (must match manifest content_scripts.matches) */
const APPLYFLOW_FRONTEND_HOST_PATTERNS = [
  'localhost:3001',
  'your-frontend-domain.com',
  'vercel.app',
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = APPLYFLOW_CONFIG;
}
