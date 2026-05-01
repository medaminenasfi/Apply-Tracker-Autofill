// Background service worker for Chrome Extension
console.log('Apply Tracker Extension background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Apply Tracker Extension installed');
});

// Listen for startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Apply Tracker Extension started');
});

// Listen for token sync from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  if (request.action === 'syncToken') {
    console.log('Received token sync request');
    console.log('Token length:', request.token ? request.token.length : 0);
    
    // Store token and user data in chrome.storage.local
    const data = {
      token: request.token,
      user: request.user,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set(data, () => {
      console.log('Token stored in chrome.storage.local');
      sendResponse({ success: true });
    });
    
    return true;
  }
  
  return true;
});
