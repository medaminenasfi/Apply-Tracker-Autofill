// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action);
  
  try {
    if (request.action === 'autofill') {
      console.log('Autofill request profile:', request.profile);
      const profile = request.profile;
      
      if (!profile) {
        console.error('Profile is missing in autofill request');
        sendResponse({ success: false, error: 'Profile is missing' });
        return true;
      }
      
      console.log('Starting autofill with profile:', profile);
      autofillForm(profile);
      
      // Detect job info from the page
      const jobInfo = detectJobInfo();
      
      console.log('Sending response with job info:', jobInfo);
      
      // Add debug info to response
      const debugInfo = {
        hostname: window.location.hostname,
        url: window.location.href,
        h1Count: document.querySelectorAll('h1').length,
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
        ogSiteName: document.querySelector('meta[property="og:site_name"]')?.content || null
      };
      
      console.log('Debug info:', debugInfo);
      sendResponse({ success: true, jobInfo, debugInfo });
    } else if (request.action === 'ping') {
      // Ping to check if content script is loaded
      console.log('Ping received');
      sendResponse({ success: true });
    } else if (request.action === 'UPLOAD_CV') {
      // Handle CV upload to page
      console.log('CV upload request received, data length:', request.cvData?.length);
      uploadCvToPage(request.cvData, request.firstName, request.lastName).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('CV upload error:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep message channel open for async response
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

// Helper function to normalize text (remove accents, lowercase, trim)
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Keyword mappings for field detection (English and French)
const fieldKeywords = {
  firstName: [
    'first name', 'firstname', 'given name',
    'prénom', 'prenom'
  ],
  lastName: [
    'last name', 'lastname', 'family name', 'surname',
    'nom', 'nom de famille'
  ],
  fullName: [
    'full name', 'name',
    'nom complet', 'prénom et nom', 'prenom et nom'
  ],
  email: [
    'email', 'e-mail', 'mail',
    'adresse email', 'adresse e-mail', 'courriel'
  ],
  phone: [
    'phone', 'phone number', 'mobile', 'telephone',
    'téléphone', 'tel', 'tél', 'numéro', 'numero', 'contact'
  ],
  countryCode: [
    'country code', 'code pays', 'indicatif', 'indicatif pays',
    'prefix', 'préfixe', 'dial code', 'calling code'
  ],
  cv: [
    'cv', 'resume', 'résumé', 'curriculum vitae', 'document', 'fichier'
  ],
  linkedin: [
    'linkedin', 'linked in', 'profil linkedin'
  ],
  portfolio: [
    'portfolio', 'website', 'site web', 'personal website'
  ]
};

// Job title keywords for confidence scoring (English and French)
const jobTitleKeywords = [
  // English
  'developer', 'engineer', 'designer', 'manager', 'intern', 'internship',
  'fullstack', 'frontend', 'backend', 'software', 'data', 'analyst',
  'architect', 'consultant', 'specialist', 'lead', 'senior', 'junior',
  'marketing', 'sales', 'product', 'qa', 'devops',
  // French
  'développeur', 'developpeur', 'ingénieur', 'ingenieur', 'designer',
  'stagiaire', 'stage', 'fullstack', 'frontend', 'backend',
  'logiciel', 'données', 'data', 'analyste', 'chef de projet',
  'directeur', 'gérant', 'commercial', 'marketing'
];

// Generic text to ignore
const genericTextToIgnore = [
  'contactez-nous', 'restons en contact', 'let\'s connect', 'connect',
  'apply', 'submit', 'retour', 'back', 'fr', 'en', 'close', 'cancel',
  'save', 'upload', 'delete', 'voir', 'voir plus', 'see more', 'learn more'
];

// Native value setter for React forms
function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function autofillForm(profile) {
  console.log('Autofill profile:', profile);
  
  // Track which fields have been filled to avoid conflicts
  const filledFields = new Set();
  
  // Extract country code and local phone
  const defaultCountryCode = profile.countryCode || '+216';
  let countryCode = defaultCountryCode;
  let localPhone = profile.phone || '';
  
  // If phone starts with country code, split it
  if (profile.phone && profile.phone.startsWith('+')) {
    const phoneParts = profile.phone.split(' ');
    if (phoneParts.length > 1) {
      countryCode = phoneParts[0];
      localPhone = phoneParts.slice(1).join(' ');
    } else {
      // Try to find the country code pattern
      const countryCodeMatch = profile.phone.match(/^\+(\d{1,3})/);
      if (countryCodeMatch) {
        countryCode = countryCodeMatch[0];
        localPhone = profile.phone.substring(countryCode.length).trim();
      }
    }
  }
  
  const fullPhoneNumber = profile.phone || `${countryCode}${localPhone}`;
  console.log('Phone autofill:', { countryCode, localPhone, fullPhoneNumber, original: profile.phone });
  
  // Check if phone field should include country code
  const requiresFullPhone = checkPhoneRequiresFullCode();
  console.log('Phone requires full code:', requiresFullPhone);
  
  // First, try to handle country code fields separately
  if (!requiresFullPhone) {
    const countryCodeResult = fillCountryCode(countryCode, filledFields);
    console.log('Country code fill result:', countryCodeResult);
  }
  
  // Then fill phone number fields
  const phoneToFill = requiresFullPhone ? fullPhoneNumber : localPhone;
  fillPhoneFields(phoneToFill, fullPhoneNumber, filledFields);
  
  // Field mappings with multiple selectors to try (excluding phone)
  const fieldMappings = {
    firstName: [
      { selector: 'input[name="firstName"]', type: 'name' },
      { selector: 'input[name="first_name"]', type: 'name' },
      { selector: 'input[name="firstname"]', type: 'name' },
      { selector: 'input[name="prenom"]', type: 'name' },
      { selector: 'input[name="prénom"]', type: 'name' },
      { selector: 'input[id="firstName"]', type: 'name' },
      { selector: 'input[id="first_name"]', type: 'name' },
      { selector: 'input[id="firstname"]', type: 'name' },
      { selector: 'input[id="prenom"]', type: 'name' },
      { selector: 'input[id="prénom"]', type: 'name' },
      { selector: 'input[placeholder*="first name" i]', type: 'name' },
      { selector: 'input[placeholder*="First Name" i]', type: 'name' },
      { selector: 'input[placeholder*="prénom" i]', type: 'name' },
      { selector: 'input[placeholder*="Prénom" i]', type: 'name' },
      { selector: 'input[aria-label*="first name" i]', type: 'name' },
      { selector: 'input[aria-label*="First Name" i]', type: 'name' },
      { selector: 'input[aria-label*="prénom" i]', type: 'name' },
      { selector: 'input[aria-label*="Prénom" i]', type: 'name' },
    ],
    lastName: [
      { selector: 'input[name="lastName"]', type: 'name' },
      { selector: 'input[name="last_name"]', type: 'name' },
      { selector: 'input[name="lastname"]', type: 'name' },
      { selector: 'input[name="nom"]', type: 'name' },
      { selector: 'input[name="nom de famille"]', type: 'name' },
      { selector: 'input[id="lastName"]', type: 'name' },
      { selector: 'input[id="last_name"]', type: 'name' },
      { selector: 'input[id="lastname"]', type: 'name' },
      { selector: 'input[id="nom"]', type: 'name' },
      { selector: 'input[placeholder*="last name" i]', type: 'name' },
      { selector: 'input[placeholder*="Last Name" i]', type: 'name' },
      { selector: 'input[placeholder*="nom" i]', type: 'name' },
      { selector: 'input[placeholder*="Nom" i]', type: 'name' },
      { selector: 'input[aria-label*="last name" i]', type: 'name' },
      { selector: 'input[aria-label*="Last Name" i]', type: 'name' },
      { selector: 'input[aria-label*="nom" i]', type: 'name' },
      { selector: 'input[aria-label*="Nom" i]', type: 'name' },
    ],
    fullName: [
      { selector: 'input[name="fullName"]', type: 'name' },
      { selector: 'input[name="full_name"]', type: 'name' },
      { selector: 'input[name="fullname"]', type: 'name' },
      { selector: 'input[name="complete name"]', type: 'name' },
      { selector: 'input[name="nom complet"]', type: 'name' },
      { selector: 'input[id="fullName"]', type: 'name' },
      { selector: 'input[id="full_name"]', type: 'name' },
      { selector: 'input[id="nom complet"]', type: 'name' },
      { selector: 'input[placeholder*="full name" i]', type: 'name' },
      { selector: 'input[placeholder*="Full Name" i]', type: 'name' },
      { selector: 'input[placeholder*="complete name" i]', type: 'name' },
      { selector: 'input[placeholder*="Complete Name" i]', type: 'name' },
      { selector: 'input[placeholder*="name" i]', type: 'name' },
      { selector: 'input[placeholder*="nom complet" i]', type: 'name' },
      { selector: 'input[placeholder*="Nom complet" i]', type: 'name' },
      { selector: 'input[aria-label*="full name" i]', type: 'name' },
      { selector: 'input[aria-label*="Full Name" i]', type: 'name' },
      { selector: 'input[aria-label*="complete name" i]', type: 'name' },
      { selector: 'input[aria-label*="nom complet" i]', type: 'name' },
      { selector: 'input[aria-label*="Nom complet" i]', type: 'name' },
    ],
    email: [
      { selector: 'input[name="email"]', type: 'email' },
      { selector: 'input[name="Email"]', type: 'email' },
      { selector: 'input[name="courriel"]', type: 'email' },
      { selector: 'input[name="adresse email"]', type: 'email' },
      { selector: 'input[id="email"]', type: 'email' },
      { selector: 'input[id="courriel"]', type: 'email' },
      { selector: 'input[type="email"]', type: 'email' },
      { selector: 'input[placeholder*="email" i]', type: 'email' },
      { selector: 'input[placeholder*="Email" i]', type: 'email' },
      { selector: 'input[placeholder*="e-mail" i]', type: 'email' },
      { selector: 'input[placeholder*="E-mail" i]', type: 'email' },
      { selector: 'input[placeholder*="mail" i]', type: 'email' },
      { selector: 'input[placeholder*="Mail" i]', type: 'email' },
      { selector: 'input[placeholder*="courriel" i]', type: 'email' },
      { selector: 'input[placeholder*="Courriel" i]', type: 'email' },
      { selector: 'input[placeholder*="adresse email" i]', type: 'email' },
      { selector: 'input[placeholder*="Adresse email" i]', type: 'email' },
      { selector: 'input[aria-label*="email" i]', type: 'email' },
      { selector: 'input[aria-label*="Email" i]', type: 'email' },
      { selector: 'input[aria-label*="courriel" i]', type: 'email' },
      { selector: 'input[aria-label*="Courriel" i]', type: 'email' },
    ],
    linkedin: [
      { selector: 'input[name="linkedin"]', type: 'url' },
      { selector: 'input[name="linkedinUrl"]', type: 'url' },
      { selector: 'input[name="linkedin_url"]', type: 'url' },
      { selector: 'input[id="linkedin"]', type: 'url' },
      { selector: 'input[placeholder*="linkedin" i]', type: 'url' },
      { selector: 'input[placeholder*="LinkedIn" i]', type: 'url' },
      { selector: 'input[placeholder*="profil linkedin" i]', type: 'url' },
      { selector: 'input[placeholder*="Profil LinkedIn" i]', type: 'url' },
      { selector: 'input[aria-label*="linkedin" i]', type: 'url' },
      { selector: 'input[aria-label*="LinkedIn" i]', type: 'url' },
      { selector: 'input[aria-label*="profil linkedin" i]', type: 'url' },
      { selector: 'input[aria-label*="Profil LinkedIn" i]', type: 'url' },
    ],
    portfolio: [
      { selector: 'input[name="portfolio"]', type: 'url' },
      { selector: 'input[name="portfolioUrl"]', type: 'url' },
      { selector: 'input[name="portfolio_url"]', type: 'url' },
      { selector: 'input[name="website"]', type: 'url' },
      { selector: 'input[name="site web"]', type: 'url' },
      { selector: 'input[id="portfolio"]', type: 'url' },
      { selector: 'input[placeholder*="portfolio" i]', type: 'url' },
      { selector: 'input[placeholder*="Portfolio" i]', type: 'url' },
      { selector: 'input[placeholder*="website" i]', type: 'url' },
      { selector: 'input[placeholder*="Website" i]', type: 'url' },
      { selector: 'input[placeholder*="site web" i]', type: 'url' },
      { selector: 'input[placeholder*="Site web" i]', type: 'url' },
      { selector: 'input[aria-label*="portfolio" i]', type: 'url' },
      { selector: 'input[aria-label*="Portfolio" i]', type: 'url' },
      { selector: 'input[aria-label*="website" i]', type: 'url' },
      { selector: 'input[aria-label*="Website" i]', type: 'url' },
      { selector: 'input[aria-label*="site web" i]', type: 'url' },
      { selector: 'input[aria-label*="Site web" i]', type: 'url' },
    ],
  };

  // Get profile values
  const values = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    linkedin: profile.linkedin,
    portfolio: profile.portfolio,
  };

  // Try to fill each field using CSS selectors first
  for (const [field, mappings] of Object.entries(fieldMappings)) {
    const value = values[field];
    if (!value) continue;

    for (const mapping of mappings) {
      const element = document.querySelector(mapping.selector);
      if (element && element.tagName === 'INPUT' && !filledFields.has(element) && element.type !== 'file') {
        const context = getFieldContext(element);
        console.log('Detected field context:', context);
        console.log('Filling field:', field, value);
        fillInput(element, value);
        filledFields.add(element);
        break; // Stop trying once we find and fill a field
      }
    }
  }

  // Then try to find fields by label text (only if not already filled)
  const labelMappings = [
    { label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'full name', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'fullname', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'complete name', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'Nom complet', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'Prénom', value: profile.firstName },
    { label: 'First Name', value: profile.firstName },
    { label: 'Nom', value: profile.lastName },
    { label: 'Last Name', value: profile.lastName },
    { label: 'Adresse e-mail', value: profile.email },
    { label: 'Courriel', value: profile.email },
    { label: 'Email', value: profile.email },
    { label: 'LinkedIn', value: profile.linkedin },
    { label: 'Portfolio', value: profile.portfolio },
  ];

  for (const mapping of labelMappings) {
    if (mapping.value) {
      fillByLabel(mapping.label, mapping.value, filledFields);
    }
  }
  
  // Detect CV upload fields and show message
  detectAndNotifyCvFields();
}

function checkPhoneRequiresFullCode() {
  // Check if any phone label mentions "include country code"
  const phoneKeywords = ['phone', 'téléphone', 'telephone', 'tel', 'tél', 'mobile', 'numéro', 'numero'];
  const includeCodeKeywords = ['include country code', 'inclure code pays', 'code pays inclus', '+'];
  
  // Check labels
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = normalizeText(label.textContent);
    const isPhoneLabel = phoneKeywords.some(keyword => labelText.includes(normalizeText(keyword)));
    
    if (isPhoneLabel) {
      const includesCode = includeCodeKeywords.some(keyword => labelText.includes(normalizeText(keyword)));
      if (includesCode) {
        console.log('Phone label requires full code:', label.textContent);
        return true;
      }
    }
  }
  
  // Check placeholders
  const inputs = document.querySelectorAll('input[type="tel"], input[type="text"]');
  for (const input of inputs) {
    const placeholder = input.placeholder || '';
    const normalizedPlaceholder = normalizeText(placeholder);
    const isPhoneInput = phoneKeywords.some(keyword => normalizedPlaceholder.includes(normalizeText(keyword)));
    
    if (isPhoneInput) {
      const includesCode = includeCodeKeywords.some(keyword => normalizedPlaceholder.includes(normalizeText(keyword)));
      if (includesCode) {
        console.log('Phone placeholder requires full code:', placeholder);
        return true;
      }
    }
  }
  
  return false;
}

function getFieldContext(element) {
  const context = {
    name: element.name,
    id: element.id,
    placeholder: element.placeholder,
    ariaLabel: element.getAttribute('aria-label'),
    labelText: '',
    parentText: '',
    previousSiblingText: ''
  };
  
  // Get label text
  const label = document.querySelector(`label[for="${element.id}"]`);
  if (label) {
    context.labelText = label.textContent.trim();
  }
  
  // Get parent text
  const parent = element.closest('div, section, fieldset');
  if (parent) {
    context.parentText = parent.textContent.trim().substring(0, 100);
  }
  
  // Get previous sibling text
  const previousSibling = element.previousElementSibling;
  if (previousSibling) {
    context.previousSiblingText = previousSibling.textContent.trim().substring(0, 50);
  }
  
  return context;
}

function detectAndNotifyCvFields() {
  // Check for file inputs
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  for (const fileInput of fileInputs) {
    // Check if this is a CV field by checking its label or attributes
    const isCvField = isCvFieldDetected(fileInput);
    
    if (isCvField) {
      showCvUploadMessage(fileInput);
      return; // Only show message once
    }
  }
  
  // Also check labels for CV-related keywords
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = normalizeText(label.textContent);
    const isCvLabel = fieldKeywords.cv.some(keyword => labelText.includes(normalizeText(keyword)));
    
    if (isCvLabel) {
      // Find the associated input
      const forId = label.getAttribute('for');
      let input = null;
      
      if (forId) {
        input = document.getElementById(forId);
      } else {
        input = label.parentElement.querySelector('input');
      }
      
      if (input && input.type === 'file') {
        showCvUploadMessage(input);
        return; // Only show message once
      }
    }
  }
}

function isCvFieldDetected(fileInput) {
  const attributesToCheck = [
    fileInput.name,
    fileInput.id,
    fileInput.placeholder,
    fileInput.getAttribute('aria-label')
  ];
  
  for (const attr of attributesToCheck) {
    if (attr) {
      const normalizedAttr = normalizeText(attr);
      const isCvField = fieldKeywords.cv.some(keyword => normalizedAttr.includes(normalizeText(keyword)));
      if (isCvField) {
        return true;
      }
    }
  }
  
  return false;
}

function showCvUploadMessage(fileInput) {
  // Create or update message element
  let messageEl = document.getElementById('cv-autofill-message');
  
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'cv-autofill-message';
    messageEl.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
    `;
    document.body.appendChild(messageEl);
  }
  
  messageEl.textContent = 'CV upload detected. Please upload your CV manually.';
  
  // Highlight the file input area
  fileInput.style.border = '2px solid #2563eb';
  fileInput.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
  
  // Remove highlight after 5 seconds
  setTimeout(() => {
    fileInput.style.border = '';
    fileInput.style.boxShadow = '';
  }, 5000);
  
  // Remove message after 10 seconds
  setTimeout(() => {
    if (messageEl && messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 10000);
}

async function uploadCvToPage(cvData, firstName, lastName) {
  try {
    console.log('Converting base64 data to blob');
    console.log('Received firstName:', firstName, 'lastName:', lastName);
    
    if (!cvData) {
      throw new Error('No CV data provided');
    }
    
    // 1. Convert base64 to blob
    const response = await fetch(cvData);
    const blob = await response.blob();
    console.log('CV blob size:', blob.size);
    
    // 2. Convert to File object with proper name using user's real name
    const sanitizedName = `${firstName}_${lastName}_CV`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const fileName = `${sanitizedName}.pdf`;
    const file = new File([blob], fileName, {
      type: 'application/pdf'
    });
    console.log('Created file with name:', fileName);
    
    // 3. Find correct file input
    const fileInput = findCvFileInput();
    
    if (!fileInput) {
      return {
        success: false,
        error: 'No CV upload field found on this page.'
      };
    }
    
    console.log('Found file input:', fileInput);
    
    // 4. Inject file into input
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      
      fileInput.files = dt.files;
      
      // Trigger events
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('CV injected successfully');
      
      // Highlight the input
      fileInput.style.border = '2px solid #10b981';
      fileInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        fileInput.style.border = '';
        fileInput.style.boxShadow = '';
      }, 3000);
      
      return {
        success: true,
        message: 'CV uploaded successfully'
      };
    } catch (error) {
      console.error('Failed to inject CV:', error);
      return {
        success: false,
        error: 'This website blocks automatic CV upload. Please upload manually.'
      };
    }
  } catch (error) {
    console.error('CV upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload CV'
    };
  }
}

function findCvFileInput() {
  // CV-related keywords
  const cvKeywords = ['cv', 'resume', 'résumé', 'curriculum vitae', 'document', 'fichier'];
  
  // Get all file inputs
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  if (fileInputs.length === 0) {
    return null;
  }
  
  // First, try to find CV-related file input
  for (const input of fileInputs) {
    const attributesToCheck = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('aria-label')
    ];
    
    for (const attr of attributesToCheck) {
      if (attr) {
        const normalizedAttr = normalizeText(attr);
        const isCvField = cvKeywords.some(keyword => normalizedAttr.includes(normalizeText(keyword)));
        if (isCvField) {
          console.log('Found CV-related input:', attr);
          return input;
        }
      }
    }
    
    // Also check label text
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      const labelText = normalizeText(label.textContent);
      const isCvLabel = cvKeywords.some(keyword => labelText.includes(normalizeText(keyword)));
      if (isCvLabel) {
        console.log('Found CV-related label:', label.textContent);
        return input;
      }
    }
  }
  
  // Fallback to first file input if no CV-related input found
  console.log('No CV-related input found, using first file input');
  return fileInputs[0];
}

function detectJobInfo() {
  const { position, company } = detectJobTitle();
  
  console.log('Detected job info:', { position, company });
  
  // Don't return jobUrl from content script - it may be in an iframe
  // The popup will use the tab URL instead
  return {
    jobTitle: position || '',
    companyName: company || '',
    confidence: calculateConfidence(position, company)
  };
}

function calculateConfidence(jobTitle, companyName) {
  if (!jobTitle && !companyName) return 'none';
  if (jobTitle && companyName) return 'high';
  if (jobTitle || companyName) return 'medium';
  return 'low';
}

function detectJobTitle() {
  console.log('Detecting job title...');
  console.log('Current hostname:', window.location.hostname);
  console.log('Current URL:', window.location.href);
  
  // Platform-specific detection
  if (window.location.hostname.includes('ashbyhq.com')) {
    const ashbyResult = detectAshbyHQJob();
    if (ashbyResult.position || ashbyResult.company) {
      console.log('AshbyHQ detection succeeded:', ashbyResult);
      return ashbyResult;
    }
  }
  
  if (window.location.hostname.includes('taleez.com')) {
    const taleezResult = detectTaleezJob();
    if (taleezResult.position || taleezResult.company) {
      console.log('Taleez detection succeeded:', taleezResult);
      return taleezResult;
    }
  }
  
  // First, try to detect from visible chips/badges in the header section
  const headerChips = scanHeaderChips();
  console.log('Visible chips:', headerChips);
  
  let detectedPosition = null;
  let detectedCompany = null;
  
  for (const chip of headerChips) {
    const chipText = chip.textContent.trim().toLowerCase();
    const normalizedText = normalizeText(chipText);
    
    // Check if chip contains job keywords
    const hasJobKeywords = jobTitleKeywords.some(keyword => 
      normalizedText.includes(normalizeText(keyword))
    );
    
    // Check if chip is generic text to ignore
    const isGeneric = genericTextToIgnore.some(text => 
      normalizedText.includes(normalizeText(text))
    );
    
    if (!isGeneric && hasJobKeywords && chipText.length > 2 && chipText.length <= 100) {
      detectedPosition = chip.textContent.trim();
      console.log('Detected position from chip:', detectedPosition);
      break;
    }
  }
  
  // If we found a position, try to find company from nearby chips
  if (detectedPosition) {
    for (const chip of headerChips) {
      const chipText = chip.textContent.trim().toLowerCase();
      const normalizedText = normalizeText(chipText);
      
      // Check if chip does NOT contain job keywords
      const hasJobKeywords = jobTitleKeywords.some(keyword => 
        normalizedText.includes(normalizeText(keyword))
      );
      
      // Check if chip is generic text to ignore
      const isGeneric = genericTextToIgnore.some(text => 
        normalizedText.includes(normalizeText(text))
      );
      
      if (!isGeneric && !hasJobKeywords && chipText.length > 2 && chipText.length <= 60) {
        detectedCompany = chip.textContent.trim();
        console.log('Detected company from chip:', detectedCompany);
        break;
      }
    }
  }
  
  // If we found both, return them directly
  if (detectedPosition && detectedCompany) {
    return { position: detectedPosition, company: detectedCompany };
  }
  
  // Fallback to h1 detection
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    const h1Text = h1.textContent.trim().toLowerCase();
    const normalizedH1 = normalizeText(h1Text);
    const isGeneric = genericTextToIgnore.some(text => 
      normalizedH1.includes(normalizeText(text))
    );
    const hasJobKeywords = jobTitleKeywords.some(keyword => 
      normalizedH1.includes(normalizeText(keyword))
    );
    
    if (!isGeneric && h1Text.length > 5 && h1Text.length <= 100) {
      if (!detectedPosition) {
        detectedPosition = h1.textContent.trim();
        console.log('Detected position from h1:', detectedPosition);
      }
    }
  }
  
  // Try meta og:title as another fallback
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content && !detectedPosition) {
    const ogTitleText = ogTitle.content.trim().toLowerCase();
    const normalizedOgTitle = normalizeText(ogTitleText);
    const isGeneric = genericTextToIgnore.some(text => 
      normalizedOgTitle.includes(normalizeText(text))
    );
    const hasJobKeywords = jobTitleKeywords.some(keyword => 
      normalizedOgTitle.includes(normalizeText(keyword))
    );
    
    if (!isGeneric && hasJobKeywords && ogTitleText.length > 5 && ogTitleText.length <= 100) {
      detectedPosition = ogTitle.content.trim();
      console.log('Detected position from og:title:', detectedPosition);
    }
  }
  
  // Try to extract company from og:site_name
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName && ogSiteName.content && !detectedCompany) {
    const siteName = ogSiteName.content.trim();
    // Don't use platform names (Taleez, LinkedIn, etc.) as company
    const platformNames = ['taleez', 'linkedin', 'indeed', 'glassdoor'];
    const normalizedSiteName = normalizeText(siteName);
    const isPlatform = platformNames.some(name => normalizedSiteName.includes(normalizeText(name)));
    
    if (!isPlatform && siteName.length > 2 && siteName.length <= 60) {
      detectedCompany = siteName;
      console.log('Detected company from og:site_name:', detectedCompany);
    }
  }
  
  return { position: detectedPosition, company: detectedCompany };
}

function detectTaleezJob() {
  console.log('Detecting Taleez job...');
  
  let position = null;
  let company = null;
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  
  console.log('Taleez: og:title:', ogTitle?.content);
  console.log('Taleez: og:site_name:', ogSiteName?.content);
  
  // Parse og:title: "be-softilys Tunisie recrute : Support IT CDI à undefined"
  if (ogTitle && ogTitle.content) {
    const titleText = ogTitle.content.trim();
    
    // Extract company from the beginning (before "recrute" or ":")
    const recruteMatch = titleText.match(/^(.+?)\s+(?:recrute|recruit|hiring)/i);
    if (recruteMatch) {
      company = recruteMatch[1].trim();
      console.log('Taleez: Found company from og:title (recrute pattern):', company);
    } else {
      // Try extracting before ":"
      const colonMatch = titleText.match(/^(.+?)\s+:/i);
      if (colonMatch) {
        company = colonMatch[1].trim();
        console.log('Taleez: Found company from og:title (colon pattern):', company);
      }
    }
    
    // Extract position (after "recrute :" or after ":")
    const positionMatch = titleText.match(/(?:recrute\s*:?\s*|:\s*)(.+?)(?:\s+(?:CDI|CDD|Freelance|Stage|Alternance|Internship|Full-time|Part-time))/i);
    if (positionMatch) {
      position = positionMatch[1].trim();
      console.log('Taleez: Found position from og:title:', position);
    } else {
      // Fallback: extract everything after the last colon
      const lastColonIndex = titleText.lastIndexOf(':');
      if (lastColonIndex > -1) {
        position = titleText.substring(lastColonIndex + 1).trim();
        // Remove job type suffixes
        position = position.replace(/\s+(?:CDI|CDD|Freelance|Stage|Alternance|Internship|Full-time|Part-time|à\s+\S+).*$/i, '').trim();
        console.log('Taleez: Found position from og:title (fallback):', position);
      }
    }
  }
  
  // Extract company from URL: https://taleez.com/apply/support-it-halq-al-wadi-be-softilys-tunisie-cdi/applying
  if (!company) {
    const urlMatch = window.location.href.match(/taleez\.com\/apply\/[^\/]+-([^-]+)(?:-[^\/]+)?\/applying/);
    if (urlMatch && urlMatch[1]) {
      const companySlug = urlMatch[1];
      // Convert slug to title case
      const companyName = companySlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      if (companyName.length > 2 && companyName.length <= 60) {
        company = companyName;
        console.log('Taleez: Found company from URL:', company);
      }
    }
  }
  
  console.log('Taleez: Final result:', { position, company });
  return { position, company };
}

function detectAshbyHQJob() {
  console.log('Detecting AshbyHQ job...');
  
  let position = null;
  let company = null;
  
  // Log all h1 elements for debugging
  const allH1s = document.querySelectorAll('h1');
  console.log('AshbyHQ: Found h1 elements:', allH1s.length);
  allH1s.forEach((h1, index) => {
    console.log(`AshbyHQ: h1[${index}]:`, h1.textContent.trim());
  });
  
  // Log all meta tags for debugging
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  console.log('AshbyHQ: og:title:', ogTitle?.content);
  console.log('AshbyHQ: og:site_name:', ogSiteName?.content);
  
  // Try og:title first for position
  if (ogTitle && ogTitle.content) {
    position = ogTitle.content.trim();
    console.log('AshbyHQ: Found position from og:title:', position);
  }
  
  // Try to find company name - AshbyHQ specific
  const companySelectors = [
    '[class*="company"]',
    '[class*="organization"]',
    '[class*="employer"]',
    '[data-test*="company"]',
    '[data-testid*="company"]',
    '.ashby-company',
    '.company-header',
    'a[href*="/company/"]',
    'a[href*="/companies/"]'
  ];
  
  for (const selector of companySelectors) {
    const elements = document.querySelectorAll(selector);
    console.log(`AshbyHQ: Found ${elements.length} elements for selector:`, selector);
    
    for (const element of elements) {
      if (element && element.textContent && element.textContent.trim().length > 2) {
        const text = element.textContent.trim();
        // Filter out generic text
        const normalizedText = normalizeText(text.toLowerCase());
        const isGeneric = genericTextToIgnore.some(t => normalizedText.includes(normalizeText(t)));
        
        if (!isGeneric) {
          company = text;
          console.log('AshbyHQ: Found company from selector:', selector, company);
          break;
        }
      }
    }
    
    if (company) break;
  }
  
  // Try to extract company from URL
  if (!company) {
    const urlMatch = window.location.href.match(/jobs\.ashbyhq\.com\/([^\/]+)/);
    if (urlMatch && urlMatch[1]) {
      // Company slug in URL, convert to title case
      const companySlug = urlMatch[1];
      const companyName = companySlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      if (companyName.length > 2 && companyName.length <= 60) {
        company = companyName;
        console.log('AshbyHQ: Found company from URL:', company);
      }
    }
  }
  
  // Try meta tags as fallback for company
  if (!company && ogSiteName && ogSiteName.content) {
    company = ogSiteName.content.trim();
    console.log('AshbyHQ: Found company from og:site_name:', company);
  }
  
  console.log('AshbyHQ: Final result:', { position, company });
  return { position, company };
}

function scanHeaderChips() {
  const chips = [];
  
  // Find header section (first 500px from top)
  const headerElements = [];
  const allElements = document.querySelectorAll('button, span, div, a, p, h1, h2');
  
  allElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < 500 && rect.top > 0) {
      headerElements.push(element);
    }
  });
  
  // Filter for chip-like elements
  headerElements.forEach(element => {
    const text = element.textContent?.trim();
    if (!text || text.length === 0 || text.length > 60) return;
    
    const normalizedText = normalizeText(text.toLowerCase());
    
    // Ignore generic text
    const isGeneric = genericTextToIgnore.some(text => 
      normalizedText.includes(normalizeText(text))
    );
    if (isGeneric) return;
    
    // Check if it's a chip-like element
    const isChip = isChipElement(element);
    if (isChip) {
      chips.push(element);
    }
  });
  
  return chips;
}

function isChipElement(element) {
  // Check for border-radius
  const style = window.getComputedStyle(element);
  const borderRadius = parseFloat(style.borderRadius) || 0;
  const hasBorderRadius = borderRadius > 4;
  
  // Check for role="button"
  const hasButtonRole = element.getAttribute('role') === 'button';
  
  // Check for chip/badge/tag/pill in class or id
  const className = element.className || '';
  const id = element.id || '';
  const hasChipClass = /\b(chip|badge|tag|pill)\b/i.test(className) || /\b(chip|badge|tag|pill)\b/i.test(id);
  
  // Check if it's a button or span
  const isButtonOrSpan = element.tagName === 'BUTTON' || element.tagName === 'SPAN';
  
  return hasBorderRadius || hasButtonRole || hasChipClass || isButtonOrSpan;
}

function detectChipsNearElement(element) {
  const chips = [];
  const parent = element.parentElement;
  if (!parent) return chips;
  
  // Get next siblings (chips often appear after the title)
  let sibling = element.nextElementSibling;
  let maxChips = 5;
  
  while (sibling && maxChips > 0) {
    // Check if it's a chip-like element (button, span, div with specific classes)
    const isChip = (
      sibling.tagName === 'BUTTON' ||
      sibling.tagName === 'SPAN' ||
      (sibling.tagName === 'DIV' && (
        sibling.classList.contains('chip') ||
        sibling.classList.contains('badge') ||
        sibling.classList.contains('tag') ||
        /\bchip\b|\bbadge\b|\btag\b/i.test(sibling.className)
      ))
    );
    
    if (isChip && sibling.textContent && sibling.textContent.trim().length > 2) {
      chips.push(sibling);
      maxChips--;
    }
    
    sibling = sibling.nextElementSibling;
  }
  
  return chips;
}

function detectCompanyName() {
  console.log('Detecting company name...');
  
  // Company detection is now integrated into detectJobTitle
  // This function is kept for backward compatibility but delegates to detectJobTitle
  const { company } = detectJobTitle();
  return company;
}

function fillPhoneFields(phoneNumber, fullPhoneNumber, filledFields) {
  console.log('Filling phone fields with:', phoneNumber);
  
  // Phone field keywords
  const phoneKeywords = [
    'phone', 'téléphone', 'telephone', 'tel', 'tél', 'mobile', 'numéro', 'numero', 'contact'
  ];
  
  // Find all phone-related containers and inputs
  const phoneContainers = [];
  
  // Check labels with phone-related text
  const labels = document.querySelectorAll('label');
  labels.forEach(label => {
    const labelText = normalizeText(label.textContent);
    const isPhoneLabel = phoneKeywords.some(keyword => labelText.includes(normalizeText(keyword)));
    
    if (isPhoneLabel) {
      // Find the parent container
      const container = label.closest('div, section, form, fieldset');
      if (container) {
        const inputs = container.querySelectorAll('input[type="tel"], input[type="text"]');
        if (inputs.length > 0) {
          phoneContainers.push({
            container,
            inputs: Array.from(inputs).filter(i => !filledFields.has(i) && i.type !== 'file')
          });
        }
      }
    }
  });
  
  // Also check input[type="tel"] directly
  const telInputs = document.querySelectorAll('input[type="tel"]');
  telInputs.forEach(input => {
    if (!filledFields.has(input) && input.type !== 'file') {
      const container = input.closest('div, section, form, fieldset');
      if (container) {
        phoneContainers.push({
          container,
          inputs: [input]
        });
      }
    }
  });
  
  // Check inputs with phone-related attributes
  const allInputs = document.querySelectorAll('input');
  allInputs.forEach(input => {
    if (filledFields.has(input) || input.type === 'file') return;
    
    const attributesToCheck = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('aria-label')
    ];
    
    for (const attr of attributesToCheck) {
      if (attr) {
        const normalizedAttr = normalizeText(attr);
        const isPhoneField = phoneKeywords.some(keyword => normalizedAttr.includes(normalizeText(keyword)));
        if (isPhoneField) {
          const container = input.closest('div, section, form, fieldset');
          if (container) {
            phoneContainers.push({
              container,
              inputs: [input]
            });
          }
          break;
        }
      }
    }
  });
  
  console.log('Detected phone containers:', phoneContainers.length);
  
  // Handle phone filling strategy
  if (phoneContainers.length === 0) {
    console.log('No phone fields detected');
    return;
  }
  
  // Check if we have split phone inputs (country code + phone)
  let hasSplitPhone = false;
  for (const { container, inputs } of phoneContainers) {
    if (inputs.length >= 2) {
      hasSplitPhone = true;
      console.log('Detected split phone inputs:', inputs.length);
      
      // Sort by width - smaller first (likely country code)
      inputs.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.width - rectB.width;
      });
      
      // First input = country code (already handled by fillCountryCode)
      // Second input = phone number
      if (inputs[1] && !filledFields.has(inputs[1])) {
        fillInput(inputs[1], phoneNumber);
        filledFields.add(inputs[1]);
        console.log('Filled phone input (second in container):', inputs[1].name || inputs[1].id);
      }
      
      break; // Only handle first container with split inputs
    }
  }
  
  // If no split inputs, fill all phone inputs with full number
  if (!hasSplitPhone) {
    console.log('Using full phone number for single inputs:', fullPhoneNumber);
    
    phoneContainers.forEach(({ inputs }) => {
      inputs.forEach(input => {
        if (!filledFields.has(input)) {
          fillInput(input, fullPhoneNumber);
          filledFields.add(input);
          console.log('Filled phone input (single):', input.name || input.id);
        }
      });
    });
  }
}

function fillCountryCode(countryCode, filledFields) {
  console.log('Filling country code with:', countryCode);
  
  // Country code keywords
  const countryCodeKeywords = [
    'country code', 'code pays', 'indicatif', 'indicatif pays', 'prefix', 'préfixe', 'dial code', 'calling code'
  ];
  
  // First, try to find select elements for country code
  const selects = document.querySelectorAll('select');
  for (const select of selects) {
    if (filledFields.has(select)) continue;
    
    const normalizedAttributes = [
      select.name,
      select.id,
      select.placeholder,
      select.getAttribute('aria-label')
    ].map(attr => attr ? normalizeText(attr) : '');
    
    // Check if this select is for country code
    const isCountryCodeField = countryCodeKeywords.some(keyword =>
      normalizedAttributes.some(attr => attr.includes(normalizeText(keyword)))
    );
    
    if (isCountryCodeField) {
      console.log('Found country code select:', select.name || select.id);
      
      // Check if the select is disabled (cannot be changed)
      if (select.disabled) {
        console.log('Country code select is disabled, cannot change');
        showCountryCodeMessage();
        return { success: false, reason: 'disabled' };
      }
      
      // Try to find an option matching the country code
      const options = select.querySelectorAll('option');
      for (const option of options) {
        const optionText = normalizeText(option.textContent);
        const optionValue = normalizeText(option.value);
        
        // Match by country code, Tunisia, or Tunisie
        if (optionText.includes(countryCode.toLowerCase()) ||
            optionText.includes('tunisia') ||
            optionText.includes('tunisie') ||
            optionValue.includes(countryCode.toLowerCase())) {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));
          filledFields.add(select);
          console.log('Country code filled successfully:', countryCode);
          return { success: true };
        }
      }
      
      console.log('Could not find matching country code option');
      showCountryCodeMessage();
      return { success: false, reason: 'no_match' };
    }
  }
  
  // Second, try to find input elements for country code
  const inputs = document.querySelectorAll('input');
  for (const input of inputs) {
    if (filledFields.has(input) || input.type === 'file') continue;
    
    const normalizedAttributes = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('aria-label')
    ].map(attr => attr ? normalizeText(attr) : '');
    
    // Check if this input is for country code
    const isCountryCodeField = countryCodeKeywords.some(keyword =>
      normalizedAttributes.some(attr => attr.includes(normalizeText(keyword)))
    );
    
    if (isCountryCodeField) {
      console.log('Found country code input:', input.name || input.id);
      
      // Check if the input is disabled
      if (input.disabled) {
        console.log('Country code input is disabled, cannot change');
        showCountryCodeMessage();
        return { success: false, reason: 'disabled' };
      }
      
      // Check if input is near a country flag or has small width (likely country code)
      const rect = input.getBoundingClientRect();
      const isSmallInput = rect.width < 100;
      
      if (isSmallInput) {
        console.log('Detected small input (likely country code)');
        fillInput(input, countryCode);
        filledFields.add(input);
        console.log('Country code filled successfully:', countryCode);
        return { success: true };
      }
    }
  }
  
  console.log('No country code field found');
  return { success: false, reason: 'not_found' };
}

function showCountryCodeMessage() {
  let messageEl = document.getElementById('country-code-message');
  
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'country-code-message';
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
    `;
    document.body.appendChild(messageEl);
  }
  
  messageEl.textContent = 'Please select country code manually.';
  
  setTimeout(() => {
    if (messageEl && messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 5000);
}

function fillInput(element, value) {
  // Use native value setter for React forms
  setNativeValue(element, value);
  
  // Also set attribute for compatibility
  element.setAttribute('value', value);
  
  console.log('Filled input:', element.name || element.id, 'with value:', value);
}

function fillByLabel(labelText, value, filledFields = new Set()) {
  if (!value) return false;

  const normalizedLabelText = normalizeText(labelText);

  // First, try to find by label text (more specific)
  const labels = document.querySelectorAll('label');
  
  for (const label of labels) {
    const normalizedLabelContent = normalizeText(label.textContent);
    
    // Exact match or contains match
    if (normalizedLabelContent === normalizedLabelText || 
        normalizedLabelContent.includes(normalizedLabelText)) {
      // Find the input associated with this label
      const forId = label.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input && input.tagName === 'INPUT' && !filledFields.has(input) && input.type !== 'file') {
          fillInput(input, value);
          filledFields.add(input);
          return true; // Return success
        }
      }
      
      // If no for attribute, try to find input as sibling
      const parent = label.parentElement;
      if (parent) {
        const input = parent.querySelector('input');
        if (input && !filledFields.has(input) && input.type !== 'file') {
          fillInput(input, value);
          filledFields.add(input);
          return true; // Return success
        }
      }
    }
  }
  
  // Second, try to find inputs by checking their attributes (less specific)
  const inputs = document.querySelectorAll('input');
  for (const input of inputs) {
    if (filledFields.has(input) || input.type === 'file') continue; // Skip already filled fields and file inputs
    
    const attributesToCheck = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('aria-label')
    ];
    
    for (const attr of attributesToCheck) {
      if (attr) {
        const normalizedAttr = normalizeText(attr);
        // More precise matching - exact match or starts with match
        if (normalizedAttr === normalizedLabelText || 
            normalizedAttr.startsWith(normalizedLabelText)) {
          fillInput(input, value);
          filledFields.add(input);
          return true; // Return success
        }
      }
    }
  }
  
  return false; // Return failure
}
