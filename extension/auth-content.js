// Content script for authentication token sync (runs on ApplyFlow web app only)
const FRONTEND_URL = APPLYFLOW_CONFIG.FRONTEND_URL;

console.log('[EXT AUTH] Auth content script loaded on:', window.location.href);

// Function to get token and user data from localStorage
function getTokenAndUserData() {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('[EXT AUTH] Token found:', !!token);
    console.log('[EXT AUTH] User found:', user?.email || 'none');
    console.log('[EXT AUTH] Token length:', token ? token.length : 0);
    
    return { token, user };
  } catch (error) {
    console.error('[EXT AUTH] Error reading from localStorage:', error);
    return { token: null, user: null };
  }
}

// Send token to background script
function syncTokenWithExtension() {
  const { token, user } = getTokenAndUserData();
  
  console.log('[EXT AUTH] Attempting to sync token...');
  
  if (token) {
    chrome.runtime.sendMessage({
      action: 'syncToken',
      token: token,
      user: user
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[EXT AUTH] Error sending token to background:', chrome.runtime.lastError);
      } else {
        console.log('[EXT AUTH] Token synced with extension:', response);
      }
    });
  } else {
    console.log('[EXT AUTH] No token to sync (user logged out)');
    // Send logout signal to extension
    chrome.runtime.sendMessage({
      action: 'logout'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[EXT AUTH] Error sending logout to background:', chrome.runtime.lastError);
      } else {
        console.log('[EXT AUTH] Logout synced with extension');
      }
    });
  }
}

// Sync language preference
function syncLanguageWithExtension() {
  const lang = localStorage.getItem('i18nextLng') || 'en';
  chrome.runtime.sendMessage({ action: 'syncLanguage', language: lang }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[EXT AUTH] Error syncing language:', chrome.runtime.lastError);
    }
  });
}

// Sync token when page loads
console.log('[EXT AUTH] Page loaded, syncing token...');
syncTokenWithExtension();
syncLanguageWithExtension();

// Listen for localStorage changes (login/logout events)
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.call(this, key, value);
  
  // Sync token when it changes
  if (key === 'token' || key === 'user') {
    console.log('[EXT AUTH] localStorage changed:', key, 'value:', !!value);
    syncTokenWithExtension();
  }
  if (key === 'i18nextLng') {
    syncLanguageWithExtension();
  }
};

// Also listen for localStorage.removeItem to detect logout
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  originalRemoveItem.call(this, key);
  
  // Send logout signal when token or user is removed
  if (key === 'token' || key === 'user') {
    console.log('[EXT AUTH] localStorage removed:', key, '- user logged out');
    chrome.runtime.sendMessage({
      action: 'logout'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[EXT AUTH] Error sending logout to background:', chrome.runtime.lastError);
      } else {
        console.log('[EXT AUTH] Logout synced with extension');
      }
    });
  }
};

// Listen for messages from extension (e.g., request to sync token)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[EXT AUTH] Received message in content script:', request.action);
  if (request.action === 'getToken') {
    const { token, user } = getTokenAndUserData();
    console.log('[EXT AUTH] Sending token to extension:', !!token);
    sendResponse({ token, user });
  }
  return true;
});

// Also sync periodically (every 30 seconds) to catch any missed changes
setInterval(() => {
  console.log('[EXT AUTH] Periodic sync check...');
  syncTokenWithExtension();
}, 30000);
