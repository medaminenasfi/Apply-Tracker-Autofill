// Background service worker for Chrome Extension
console.log('[EXT AUTH] Apply Tracker Extension background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[EXT AUTH] Apply Tracker Extension installed');
});

// Listen for startup
chrome.runtime.onStartup.addListener(() => {
  console.log('[EXT AUTH] Apply Tracker Extension started');
});

// Listen for token sync and logout from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[EXT AUTH] Background received message:', request.action);
  
  if (request.action === 'syncToken') {
    console.log('[EXT AUTH] Received token sync request');
    console.log('[EXT AUTH] Token length:', request.token ? request.token.length : 0);
    console.log('[EXT AUTH] User email:', request.user?.email || 'none');
    
    // Store token and user data in chrome.storage.local
    const data = {
      token: request.token,
      user: request.user,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set(data, () => {
      console.log('[EXT AUTH] Token stored in chrome.storage.local');
      sendResponse({ success: true });
    });
    
    return true;
  }
  
  if (request.action === 'syncLanguage') {
    const lang = request.language || 'en';
    chrome.storage.local.set({ language: lang }, () => {
      console.log('[EXT AUTH] Language synced:', lang);
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'logout') {
    console.log('[EXT AUTH] Received logout request, clearing extension storage');
    // Clear all extension auth data
    chrome.storage.local.remove(['token', 'user', 'cvInfo'], () => {
      console.log('[EXT AUTH] Extension storage cleared');
      sendResponse({ success: true });
    });
    return true;
  }
  
  return true;
});
