# Extension Production Setup Guide

When deploying the extension to production, make the following changes:

## Files to Update

### 1. manifest.json

**Development (Current):**
```json
{
  "host_permissions": [
    "http://localhost:3001/*"
  ],
  "content_scripts": [
    {
      "matches": ["http://localhost:3001/*"],
      "js": ["auth-content.js"]
    }
  ]
}
```

**Production:**
```json
{
  "host_permissions": [
    "https://your-frontend-domain.com/*",
    "https://your-api-domain.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://your-frontend-domain.com/*"],
      "js": ["auth-content.js"]
    }
  ]
}
```

### 2. popup.js

**Development (Current):**
```javascript
const FRONTEND_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:3000';
```

**Production:**
```javascript
const FRONTEND_URL = 'https://your-frontend-domain.com';
const API_URL = 'https://your-api-domain.com';
```

### 3. auth-content.js

**Development (Current):**
```javascript
// Content script for authentication token sync
// Only runs on the Apply Tracker website (http://localhost:3001/*)
```

**Production:**
```javascript
// Content script for authentication token sync
// Only runs on the Apply Tracker website (https://your-frontend-domain.com/*)
```

## Publishing to Chrome Web Store

### Step 1: Create Developer Account
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/dev/dashboard)
2. Sign in with your Google account
3. Pay the $5 one-time registration fee

### Step 2: Prepare Extension Package
1. Update all URLs in the files above
2. Remove any development-only files or comments
3. Create a ZIP file containing:
   - manifest.json
   - popup.html
   - popup.js
   - content.js
   - background.js
   - auth-content.js
   - styles.css
   - (Optional) icons folder

### Step 3: Upload to Web Store
1. Go to Developer Dashboard
2. Click "Add new item"
3. Upload the ZIP file
4. Fill in required information:
   - Name: "Apply Tracker Autofill"
   - Description: Brief description of features
   - Category: Productivity
   - Screenshots: At least one screenshot (1280x800 or 640x400)
   - Privacy policy URL: Link to your privacy policy
5. Submit for review

### Step 4: Review Process
- Review typically takes 1-3 business days
- Google may request changes
- Once approved, extension will be publicly available

## Alternative: Self-Distribution

If you don't want to publish to Chrome Web Store, you can:

1. Host the ZIP file on your website
2. Provide installation instructions:
   - Download the ZIP
   - Extract it
   - Open chrome://extensions
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the extracted folder

## Environment-Based Configuration (Advanced)

For easier switching between dev and prod, consider using a build script:

### Create config.js
```javascript
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

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
```

### Use in popup.js
```javascript
const { FRONTEND_URL, API_URL } = require('./config.js');
```

### Build script
```json
{
  "scripts": {
    "build:dev": "NODE_ENV=development node build.js",
    "build:prod": "NODE_ENV=production node build.js"
  }
}
```

## Checklist Before Production

- [ ] Update manifest.json host_permissions
- [ ] Update manifest.json content_scripts matches
- [ ] Update popup.js FRONTEND_URL and API_URL
- [ ] Update auth-content.js comment
- [ ] Test extension with production URLs
- [ ] Create extension ZIP file
- [ ] Prepare screenshots for Web Store
- [ ] Write privacy policy
- [ ] Create developer account
- [ ] Upload and submit for review

## Notes

- Chrome Web Store requires a privacy policy even if you don't collect data
- Screenshots must be actual screenshots of the extension in use
- Extension name and description should be clear and concise
- Review process checks for security and policy compliance
- Updates to published extensions require review but are faster than initial review
