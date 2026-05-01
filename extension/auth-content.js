// Content script for authentication token sync
// Only runs on the Apply Tracker website
// DEVELOPMENT: http://localhost:3001/*
// PRODUCTION: Change to your production domain (e.g., https://your-domain.com/*)
const FRONTEND_URL = 'http://localhost:3001';

console.log('Apply Tracker auth content script loaded on:', window.location.href);

// Function to get token and user data from localStorage
function getTokenAndUserData() {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('Token found:', !!token);
    console.log('User found:', !!user);
    console.log('Token length:', token ? token.length : 0);
    
    return { token, user };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { token: null, user: null };
  }
}

// Send token to background script
function syncTokenWithExtension() {
  const { token, user } = getTokenAndUserData();
  
  console.log('Attempting to sync token...');
  
  if (token) {
    chrome.runtime.sendMessage({
      action: 'syncToken',
      token: token,
      user: user
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending token to background:', chrome.runtime.lastError);
      } else {
        console.log('Token synced with extension:', response);
      }
    });
  } else {
    console.log('No token to sync');
  }
}

// Sync token when page loads
console.log('Page loaded, syncing token...');
syncTokenWithExtension();

// Listen for localStorage changes (login/logout events)
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.call(this, key, value);
  
  // Sync token when it changes
  if (key === 'token' || key === 'user') {
    console.log('localStorage changed:', key);
    syncTokenWithExtension();
  }
};

// Listen for messages from extension (e.g., request to sync token)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in content script:', request);
  if (request.action === 'getToken') {
    const { token, user } = getTokenAndUserData();
    console.log('Sending token to extension:', !!token);
    sendResponse({ token, user });
  }
  return true;
});

// Also sync periodically (every 30 seconds) to catch any missed changes
setInterval(() => {
  console.log('Periodic sync check...');
  syncTokenWithExtension();
}, 30000);
