const API_BASE = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';

// DOM Elements
const loginView = document.getElementById('loginView');
const profileView = document.getElementById('profileView');
const loginForm = document.getElementById('loginForm');
const syncFromWebsiteBtn = document.getElementById('syncFromWebsiteBtn');
const loginOnWebsiteBtn = document.getElementById('loginOnWebsiteBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const autofillBtn = document.getElementById('autofillBtn');
const cvStatus = document.getElementById('cvStatus');
const cvText = document.getElementById('cvText');
const previewCvBtn = document.getElementById('previewCvBtn');
const saveApplicationForm = document.getElementById('saveApplicationForm');
const companyNameInput = document.getElementById('companyName');
const positionInput = document.getElementById('position');
const jobUrlInput = document.getElementById('jobUrl');
const dateAppliedInput = document.getElementById('dateApplied');
const noteInput = document.getElementById('note');
const logoutBtn = document.getElementById('logoutBtn');
const message = document.getElementById('message');
const userEmail = document.getElementById('userEmail');

let userProfile = null;
let token = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  syncFromWebsiteBtn.addEventListener('click', handleSyncFromWebsite);
  loginOnWebsiteBtn.addEventListener('click', handleLoginOnWebsite);
  autofillBtn.addEventListener('click', handleAutofill);
  previewCvBtn.addEventListener('click', handlePreviewCv);
  saveApplicationForm.addEventListener('submit', handleSaveApplication);
  logoutBtn.addEventListener('click', handleLogout);
}

async function checkAuth() {
  console.log('Checking auth...');
  // First check chrome.storage.local for token
  const result = await chrome.storage.local.get(['token', 'user']);
  console.log('Storage result:', result);
  token = result.token;
  userProfile = result.user;
  
  console.log('Token from storage:', !!token);
  console.log('User from storage:', !!userProfile);
  
  if (token) {
    console.log('Token found, fetching profile...');
    // Verify token is still valid by fetching profile
    await fetchProfile();
    showProfileView();
  } else {
    console.log('No token in storage, showing login view');
    showLoginView();
  }
}

function showLoginView() {
  loginView.classList.remove('hidden');
  profileView.classList.add('hidden');
}

function showProfileView() {
  loginView.classList.add('hidden');
  profileView.classList.remove('hidden');
}

function handleLoginOnWebsite() {
  chrome.tabs.create({ url: `${FRONTEND_URL}/login` });
}

async function handleSyncFromWebsite() {
  try {
    // Find the website tab
    const [tab] = await chrome.tabs.query({ url: `${FRONTEND_URL}/*` });
    
    if (!tab) {
      showMessage('Please open the website first', 'error');
      return;
    }
    
    console.log('Found website tab:', tab.id);
    
    // Inject script to get token
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        return { token, user };
      }
    });
    
    const { token: websiteToken, user: websiteUser } = result[0].result;
    console.log('Token from website:', !!websiteToken);
    console.log('User from website:', !!websiteUser);
    
    if (websiteToken) {
      // Store in chrome.storage.local
      await chrome.storage.local.set({
        token: websiteToken,
        user: websiteUser
      });
      
      token = websiteToken;
      userProfile = websiteUser;
      
      showMessage('Synced from website!', 'success');
      await fetchProfile();
      showProfileView();
    } else {
      showMessage('Not logged in on website', 'error');
    }
  } catch (error) {
    console.error('Sync error:', error);
    showMessage('Failed to sync from website', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    token = data.access_token;
    
    // Store in chrome.storage.local
    await chrome.storage.local.set({
      token: token,
      user: data.user
    });
    
    await fetchProfile();
    showProfileView();
    loginError.textContent = '';
  } catch (error) {
    loginError.textContent = error.message;
  }
}

async function fetchProfile() {
  try {
    const response = await fetch(`${API_BASE}/extension/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
    
    userProfile = data;
    userEmail.textContent = data.email;
    
    // Update chrome.storage.local with latest user data
    await chrome.storage.local.set({ user: data });
    
    // Update CV status
    updateCvStatus(data.cvUrl);
    
    // Set default date
    dateAppliedInput.value = new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    // If token is invalid, clear it and show login view
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      await chrome.storage.local.remove(['token', 'user']);
      token = null;
      userProfile = null;
      showLoginView();
    } else {
      showMessage('Failed to fetch profile', 'error');
    }
  }
}

function updateCvStatus(cvUrl) {
  const indicator = cvStatus.querySelector('.status-indicator');
  
  if (cvUrl) {
    indicator.classList.add('uploaded');
    cvText.textContent = 'CV uploaded';
    previewCvBtn.classList.remove('hidden');
    previewCvBtn.dataset.cvUrl = cvUrl;
  } else {
    indicator.classList.remove('uploaded');
    cvText.textContent = 'No CV uploaded';
    previewCvBtn.classList.add('hidden');
  }
}

async function handleAutofill() {
  if (!userProfile) {
    showMessage('Profile not loaded', 'error');
    return;
  }
  
  // Send message to content script to autofill
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'autofill',
    profile: userProfile
  }, (response) => {
    if (chrome.runtime.lastError) {
      showMessage('Content script not loaded. Refresh the page.', 'error');
    } else if (response && response.success) {
      showMessage('Form autofilled successfully!', 'success');
    } else {
      showMessage('Failed to autofill form', 'error');
    }
  });
}

function handlePreviewCv() {
  const cvUrl = previewCvBtn.dataset.cvUrl;
  if (cvUrl) {
    chrome.tabs.create({ url: `${API_BASE}${cvUrl}` });
  }
}

async function handleSaveApplication(e) {
  e.preventDefault();
  
  const applicationData = {
    companyName: companyNameInput.value,
    position: positionInput.value,
    jobUrl: jobUrlInput.value,
    dateApplied: dateAppliedInput.value,
    note: noteInput.value,
  };
  
  try {
    const response = await fetch(`${API_BASE}/extension/save-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(applicationData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save application');
    }
    
    showMessage('Application saved successfully!', 'success');
    saveApplicationForm.reset();
    dateAppliedInput.value = new Date().toISOString().split('T')[0];
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleLogout() {
  // Clear chrome.storage.local (extension logout only)
  await chrome.storage.local.remove(['token', 'user']);
  token = null;
  userProfile = null;
  showLoginView();
  loginForm.reset();
  showMessage('Logged out from extension', 'success');
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
  
  setTimeout(() => {
    message.textContent = '';
    message.className = 'message';
  }, 3000);
}

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    jobUrlInput.value = tabs[0].url;
  }
});

// Listen for token updates from background (synced from website)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.token) {
    console.log('Token updated in storage:', changes.token.newValue);
    if (changes.token.newValue && !token) {
      // Token was added (user logged in on website)
      token = changes.token.newValue;
      checkAuth();
    } else if (!changes.token.newValue && token) {
      // Token was removed (user logged out on website)
      token = null;
      userProfile = null;
      showLoginView();
    }
  }
  
  if (areaName === 'local' && changes.user) {
    console.log('User updated in storage:', changes.user.newValue);
    if (changes.user.newValue) {
      userProfile = changes.user.newValue;
      if (token) {
        showProfileView();
        userEmail.textContent = userProfile.email;
      }
    }
  }
});
