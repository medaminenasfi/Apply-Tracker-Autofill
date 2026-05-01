# Apply Tracker Chrome Extension

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder in this project

## Features

- **Login**: Login using your Apply Tracker credentials
- **Autofill**: Automatically fill job application forms with your profile information
- **CV Status**: Check if your CV is uploaded and preview it
- **Save Applications**: Save job applications directly from the extension

## Usage

1. Click the extension icon in Chrome
2. Login with your email and password
3. Click "Autofill Form" on any job application page to fill your information
4. Fill in company name and position, then click "Save Application"

## API Endpoints

- `POST /auth/login` - Login and get JWT token
- `GET /extension/profile` - Fetch user profile
- `POST /extension/save-application` - Save job application

## Development

The extension communicates with the backend API at `http://localhost:3000`.

Make sure the backend is running before using the extension.
