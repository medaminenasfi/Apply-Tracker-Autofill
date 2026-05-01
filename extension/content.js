// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    const profile = request.profile;
    autofillForm(profile);
    sendResponse({ success: true });
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
    'téléphone', 'tel', 'tél', 'numéro de téléphone', 'numero de telephone',
    'phoneNumber', 'contact'
  ],
  countryCode: [
    'country code', 'code pays', 'indicatif', 'indicatif pays',
    'prefix', 'préfixe', 'dial code'
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

function autofillForm(profile) {
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
  
  // First, try to handle country code fields
  const countryCodeFilled = fillCountryCode(countryCode, filledFields);
  
  // If country code was filled successfully, use local phone only
  // Otherwise, use full phone number as fallback
  const phoneToFill = countryCodeFilled ? localPhone : fullPhoneNumber;
  
  // Field mappings with multiple selectors to try
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
      { selector: 'input[name="nom complet"]', type: 'name' },
      { selector: 'input[id="fullName"]', type: 'name' },
      { selector: 'input[id="full_name"]', type: 'name' },
      { selector: 'input[placeholder*="full name" i]', type: 'name' },
      { selector: 'input[placeholder*="Full Name" i]', type: 'name' },
      { selector: 'input[placeholder*="name" i]', type: 'name' },
      { selector: 'input[placeholder*="nom complet" i]', type: 'name' },
      { selector: 'input[placeholder*="Nom complet" i]', type: 'name' },
      { selector: 'input[aria-label*="full name" i]', type: 'name' },
      { selector: 'input[aria-label*="Full Name" i]', type: 'name' },
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
      { selector: 'input[placeholder*="courriel" i]', type: 'email' },
      { selector: 'input[placeholder*="Courriel" i]', type: 'email' },
      { selector: 'input[placeholder*="adresse email" i]', type: 'email' },
      { selector: 'input[placeholder*="Adresse email" i]', type: 'email' },
      { selector: 'input[aria-label*="email" i]', type: 'email' },
      { selector: 'input[aria-label*="Email" i]', type: 'email' },
      { selector: 'input[aria-label*="courriel" i]', type: 'email' },
      { selector: 'input[aria-label*="Courriel" i]', type: 'email' },
    ],
    phone: [
      { selector: 'input[type="tel"]', type: 'tel' },
      { selector: 'input[name="phone"]', type: 'tel' },
      { selector: 'input[name="phoneNumber"]', type: 'tel' },
      { selector: 'input[name="phone_number"]', type: 'tel' },
      { selector: 'input[name="mobile"]', type: 'tel' },
      { selector: 'input[name="telephone"]', type: 'tel' },
      { selector: 'input[name="téléphone"]', type: 'tel' },
      { selector: 'input[name="tel"]', type: 'tel' },
      { selector: 'input[name="tél"]', type: 'tel' },
      { selector: 'input[name="contact"]', type: 'tel' },
      { selector: 'input[id="phone"]', type: 'tel' },
      { selector: 'input[id="phoneNumber"]', type: 'tel' },
      { selector: 'input[id="telephone"]', type: 'tel' },
      { selector: 'input[id="téléphone"]', type: 'tel' },
      { selector: 'input[placeholder*="phone" i]', type: 'tel' },
      { selector: 'input[placeholder*="Phone" i]', type: 'tel' },
      { selector: 'input[placeholder*="mobile" i]', type: 'tel' },
      { selector: 'input[placeholder*="Mobile" i]', type: 'tel' },
      { selector: 'input[placeholder*="telephone" i]', type: 'tel' },
      { selector: 'input[placeholder*="Telephone" i]', type: 'tel' },
      { selector: 'input[placeholder*="téléphone" i]', type: 'tel' },
      { selector: 'input[placeholder*="Téléphone" i]', type: 'tel' },
      { selector: 'input[placeholder*="numéro" i]', type: 'tel' },
      { selector: 'input[placeholder*="Numéro" i]', type: 'tel' },
      { selector: 'input[placeholder*="tel" i]', type: 'tel' },
      { selector: 'input[placeholder*="Tel" i]', type: 'tel' },
      { selector: 'input[aria-label*="phone" i]', type: 'tel' },
      { selector: 'input[aria-label*="Phone" i]', type: 'tel' },
      { selector: 'input[aria-label*="telephone" i]', type: 'tel' },
      { selector: 'input[aria-label*="Telephone" i]', type: 'tel' },
      { selector: 'input[aria-label*="téléphone" i]', type: 'tel' },
      { selector: 'input[aria-label*="Téléphone" i]', type: 'tel' },
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
    phone: phoneToFill,
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
        fillInput(element, value);
        filledFields.add(element);
        break; // Stop trying once we find and fill a field
      }
    }
  }

  // Then try to find fields by label text (only if not already filled)
  const labelMappings = [
    { label: 'Prénom', value: profile.firstName },
    { label: 'First Name', value: profile.firstName },
    { label: 'Nom', value: profile.lastName },
    { label: 'Last Name', value: profile.lastName },
    { label: 'Nom complet', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
    { label: 'Adresse e-mail', value: profile.email },
    { label: 'Courriel', value: profile.email },
    { label: 'Email', value: profile.email },
    { label: 'Téléphone', value: phoneToFill },
    { label: 'Tél', value: phoneToFill },
    { label: 'Phone', value: phoneToFill },
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

function fillCountryCode(countryCode, filledFields) {
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
    const isCountryCodeField = fieldKeywords.countryCode.some(keyword =>
      normalizedAttributes.some(attr => attr.includes(normalizeText(keyword)))
    );
    
    if (isCountryCodeField) {
      // Check if the select is disabled (cannot be changed)
      if (select.disabled) {
        console.log('Country code select is disabled, cannot change');
        return false;
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
          filledFields.add(select);
          console.log('Country code filled successfully:', countryCode);
          return true;
        }
      }
      
      console.log('Could not find matching country code option');
      return false;
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
    const isCountryCodeField = fieldKeywords.countryCode.some(keyword =>
      normalizedAttributes.some(attr => attr.includes(normalizeText(keyword)))
    );
    
    if (isCountryCodeField) {
      // Check if the input is disabled
      if (input.disabled) {
        console.log('Country code input is disabled, cannot change');
        return false;
      }
      
      fillInput(input, countryCode);
      filledFields.add(input);
      console.log('Country code filled successfully:', countryCode);
      return true;
    }
  }
  
  console.log('No country code field found');
  return false;
}

function fillInput(element, value) {
  // Focus the element first
  element.focus();
  
  // Clear existing value
  element.value = '';
  
  // Set new value
  element.value = value;
  
  // Also try setAttribute for masked inputs (React/Styled components)
  element.setAttribute('value', value);
  
  // Trigger input events to ensure the form recognizes the change
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Blur the element
  element.blur();
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
