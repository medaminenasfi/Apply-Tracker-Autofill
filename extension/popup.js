// Extension Configuration
// DEVELOPMENT: http://localhost:3000 (API), http://localhost:3001 (Frontend)
// PRODUCTION: Change to your production domains
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
const cvInfo = document.getElementById('cvInfo');
const cvText = document.getElementById('cvText');
const cvFileName = document.getElementById('cvFileName');
const cvActions = document.getElementById('cvActions');
const openCvBtn = document.getElementById('openCvBtn');
const copyCvLinkBtn = document.getElementById('copyCvLinkBtn');
const copyFileNameBtn = document.getElementById('copyFileNameBtn');
const uploadCvToPageBtn = document.getElementById('uploadCvToPageBtn');
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
  openCvBtn.addEventListener('click', handleOpenCv);
  copyCvLinkBtn.addEventListener('click', handleCopyCvLink);
  copyFileNameBtn.addEventListener('click', handleCopyFileName);
  uploadCvToPageBtn.addEventListener('click', handleUploadCvToPage);
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
    
    console.log('Extension profile:', data);
    console.log('Extension cvUrl:', data?.cvUrl);
    
    // Update chrome.storage.local with latest user data
    await chrome.storage.local.set({ user: data });
    
    // Update CV status from profile
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

function getFullUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function extractFilename(url) {
  if (!url) return "";
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename || "CV file";
}

function updateCvStatus(cvUrl) {
  const indicator = cvInfo.querySelector('.status-indicator');
  
  if (cvUrl) {
    indicator.classList.add('uploaded');
    cvText.textContent = 'CV uploaded';
    const filename = extractFilename(cvUrl);
    cvFileName.textContent = filename;
    cvActions.classList.remove('hidden');
    openCvBtn.dataset.cvUrl = cvUrl;
    copyCvLinkBtn.dataset.cvUrl = getFullUrl(cvUrl);
    copyFileNameBtn.dataset.fileName = filename;
    console.log('CV status updated:', { cvUrl, filename, fullUrl: getFullUrl(cvUrl) });
  } else {
    indicator.classList.remove('uploaded');
    cvText.textContent = 'No CV uploaded';
    cvFileName.textContent = '';
    cvActions.classList.add('hidden');
    console.log('No CV uploaded');
  }
}

function handleOpenCv() {
  const cvUrl = openCvBtn.dataset.cvUrl;
  if (cvUrl) {
    chrome.tabs.create({ url: `${API_BASE}${cvUrl}` });
  }
}

function handleCopyCvLink() {
  const cvUrl = copyCvLinkBtn.dataset.cvUrl;
  if (cvUrl) {
    navigator.clipboard.writeText(cvUrl).then(() => {
      showMessage('CV link copied to clipboard!', 'success');
    }).catch(() => {
      showMessage('Failed to copy CV link', 'error');
    });
  }
}

function handleCopyFileName() {
  const fileName = copyFileNameBtn.dataset.fileName;
  if (fileName) {
    navigator.clipboard.writeText(fileName).then(() => {
      showMessage('File name copied to clipboard!', 'success');
    }).catch(() => {
      showMessage('Failed to copy file name', 'error');
    });
  }
}

async function handleUploadCvToPage() {
  if (!userProfile || !userProfile.cvUrl) {
    showMessage('No CV uploaded. Please upload your CV first.', 'error');
    return;
  }
  
  // Use direct file path to avoid IDM interception
  const cvUrl = getFullUrl(userProfile.cvUrl);
  console.log('CV URL:', cvUrl);
  
  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    showMessage('No active tab found', 'error');
    return;
  }
  
  // Fetch CV as blob in popup (same-origin with backend)
  try {
    const response = await fetch(cvUrl);
    console.log('Fetch response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CV file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('CV blob size:', blob.size);
    
    if (blob.size === 0) {
      throw new Error('CV file is empty or not found');
    }
    
    // Convert blob to base64 to send to content script
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result;
      console.log('CV converted to base64, length:', base64data.length);
      
      // Function to check if content script is loaded
      const checkContentScript = async () => {
        return new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError) {
              resolve({ loaded: false });
            } else {
              resolve({ loaded: true });
            }
          });
        });
      };
      
      // Check if content script is loaded
      const checkResult = await checkContentScript();
      
      // If content script not loaded, inject it
      if (!checkResult.loaded) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          // Wait for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Failed to inject content script:', error);
          showMessage('This website blocks extension scripts.', 'error');
          return;
        }
      }
      
      // Send message to content script with base64 data and user name
      chrome.tabs.sendMessage(tab.id, {
        action: 'UPLOAD_CV',
        cvData: base64data,
        firstName: userProfile.firstName || 'user',
        lastName: userProfile.lastName || 'cv'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending CV upload message:', chrome.runtime.lastError);
          showMessage('Failed to upload CV to page', 'error');
        } else if (response && response.success) {
          showMessage('CV uploaded successfully!', 'success');
        } else if (response && response.error) {
          showMessage(response.error, 'error');
        } else {
          showMessage('Failed to upload CV to page', 'error');
        }
      });
    };
    
    reader.onerror = () => {
      showMessage('Failed to read CV file', 'error');
    };
  } catch (error) {
    console.error('Error fetching CV:', error);
    showMessage('Failed to fetch CV from server', 'error');
  }
}

async function handleAutofill() {
  if (!userProfile) {
    showMessage('Profile not loaded', 'error');
    return;
  }
  
  // Send message to content script to autofill
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    showMessage('No active tab found', 'error');
    return;
  }
  
  console.log('Active tab:', tab.url);
  
  // Get current tab URL for job URL field
  jobUrlInput.value = tab.url;
  
  // Function to check if content script is loaded
  const checkContentScript = async () => {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Ping failed:', chrome.runtime.lastError);
          resolve({ loaded: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Content script is loaded');
          resolve({ loaded: true });
        }
      });
    });
  };
  
  // Function to send autofill message
  const sendAutofillMessage = async () => {
    return new Promise((resolve) => {
      console.log('Sending autofill message with profile:', userProfile);
      chrome.tabs.sendMessage(tab.id, {
        action: 'autofill',
        profile: userProfile
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          resolve({ error: chrome.runtime.lastError.message });
        } else {
          console.log('Autofill response:', response);
          resolve(response);
        }
      });
    });
  };
  
  // Check if content script is loaded
  const checkResult = await checkContentScript();
  
  // If content script not loaded, inject it
  if (!checkResult.loaded) {
    console.log('Content script not loaded, attempting injection...');
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      console.log('Content script injected');
      
      // Wait for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify it's loaded now
      const recheckResult = await checkContentScript();
      if (!recheckResult.loaded) {
        showMessage('Content script failed to load. Please refresh the page.', 'error');
        return;
      }
    } catch (error) {
      console.error('Failed to inject content script:', error);
      showMessage('This website blocks extension scripts. Please refresh the page.', 'error');
      return;
    }
  }
  
  // Send autofill message
  const response = await sendAutofillMessage();
  
  if (response && response.success) {
    // Log debug info if available
    if (response.debugInfo) {
      console.log('Content script debug info:', response.debugInfo);
    }
    
    // Fill job info from detection
    if (response.jobInfo) {
      const { jobTitle, companyName, confidence } = response.jobInfo;
      console.log('Received job info:', { jobTitle, companyName, confidence });
      
      // Only fill if fields are empty and confidence is medium or high
      if (confidence === 'high' || confidence === 'medium') {
        if (jobTitle && !positionInput.value) {
          positionInput.value = jobTitle;
        }
        
        if (companyName && !companyNameInput.value) {
          companyNameInput.value = companyName;
        }
        
        if (confidence === 'high') {
          showMessage('Form autofilled successfully with job details!', 'success');
        } else {
          showMessage('Form autofilled. Please verify company and position before saving.', 'warning');
        }
      } else {
        showMessage('Form autofilled. Please verify company and position manually.', 'warning');
      }
    } else {
      showMessage('Form autofilled successfully!', 'success');
    }
  } else {
    showMessage('Failed to autofill form', 'error');
  }
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
