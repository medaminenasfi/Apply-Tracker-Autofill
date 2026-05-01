// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    const profile = request.profile;
    autofillForm(profile);
    
    // Detect job info from the page
    const jobInfo = detectJobInfo();
    
    sendResponse({ success: true, jobInfo });
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

// Job title keywords for confidence scoring
const jobTitleKeywords = [
  'developer', 'engineer', 'designer', 'manager', 'intern', 'internship', 'stage',
  'fullstack', 'frontend', 'backend', 'software', 'data', 'analyst', 'marketing', 'sales',
  'product', 'qa', 'devops', 'architect', 'consultant', 'specialist', 'lead', 'senior', 'junior',
  // French
  'développeur', 'developpeur', 'ingénieur', 'ingenieur', 'designer', 'stagiaire', 'stage',
  'commercial', 'marketing', 'analyste', 'chef de projet', 'directeur', 'gérant'
];

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
  
  // First, try to handle country code fields separately
  const countryCodeResult = fillCountryCode(countryCode, filledFields);
  console.log('Country code fill result:', countryCodeResult);
  
  // Then fill phone number fields
  fillPhoneFields(localPhone, filledFields);
  
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

function detectJobInfo() {
  const jobTitle = detectJobTitle();
  const companyName = detectCompanyName();
  const jobUrl = window.location.href;
  
  console.log('Detected job info:', { jobTitle, companyName, jobUrl });
  
  return {
    jobTitle: jobTitle || '',
    companyName: companyName || '',
    jobUrl: jobUrl,
    confidence: calculateConfidence(jobTitle, companyName)
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
  
  // Generic titles to ignore
  const genericTitles = [
    "let's connect", 'connect', 'contact', 'apply', 'application form', 'join us', 'careers', 'jobs', 'opportunities'
  ];
  
  let detectedTitle = null;
  let confidence = 0;
  
  // Try h1 first (most reliable)
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    const h1Text = h1.textContent.trim().toLowerCase();
    const isGeneric = genericTitles.some(title => h1Text.includes(title));
    const hasJobKeywords = jobTitleKeywords.some(keyword => h1Text.includes(keyword));
    
    if (!isGeneric && h1Text.length > 5) {
      detectedTitle = h1.textContent.trim();
      confidence = hasJobKeywords ? 90 : 70;
      console.log('Job title found in h1:', detectedTitle, 'confidence:', confidence);
      return detectedTitle;
    }
  }
  
  // Try visible chips/badges near h1
  if (h1) {
    const chips = detectChipsNearElement(h1);
    console.log('Detected chips near h1:', chips);
    
    for (const chip of chips) {
      const chipText = chip.textContent.trim().toLowerCase();
      const hasJobKeywords = jobTitleKeywords.some(keyword => chipText.includes(keyword));
      const isGeneric = genericTitles.some(title => chipText.includes(title));
      
      if (hasJobKeywords && !isGeneric && chipText.length > 5) {
        detectedTitle = chip.textContent.trim();
        confidence = 85;
        console.log('Job title found in chip:', detectedTitle, 'confidence:', confidence);
        return detectedTitle;
      }
    }
  }
  
  // Try h2
  const h2s = document.querySelectorAll('h2');
  for (const h2 of h2s) {
    const h2Text = h2.textContent.trim().toLowerCase();
    const isGeneric = genericTitles.some(title => h2Text.includes(title));
    const hasJobKeywords = jobTitleKeywords.some(keyword => h2Text.includes(keyword));
    
    if (!isGeneric && hasJobKeywords && h2Text.length > 5) {
      detectedTitle = h2.textContent.trim();
      confidence = 80;
      console.log('Job title found in h2:', detectedTitle, 'confidence:', confidence);
      return detectedTitle;
    }
  }
  
  // Try meta og:title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    const ogTitleText = ogTitle.content.trim().toLowerCase();
    const isGeneric = genericTitles.some(title => ogTitleText.includes(title));
    const hasJobKeywords = jobTitleKeywords.some(keyword => ogTitleText.includes(keyword));
    
    if (!isGeneric && ogTitleText.length > 5) {
      detectedTitle = ogTitle.content.trim();
      confidence = hasJobKeywords ? 75 : 50;
      console.log('Job title found in og:title:', detectedTitle, 'confidence:', confidence);
      return detectedTitle;
    }
  }
  
  // Try elements with job title related classes/attributes
  const jobTitleSelectors = [
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[id*="job-title"]',
    '[id*="jobTitle"]',
    '[class*="position"]',
    '[class*="poste"]',
    '[class*="role"]',
    '[class*="vacancy"]',
    '[class*="emploi"]',
    '[class*="offre"]',
    '[data-test*="job-title"]',
    '[data-testid*="job-title"]'
  ];
  
  for (const selector of jobTitleSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.textContent && element.textContent.trim() && element.textContent.trim().length > 5) {
        const text = element.textContent.trim().toLowerCase();
        const isGeneric = genericTitles.some(title => text.includes(title));
        const hasJobKeywords = jobTitleKeywords.some(keyword => text.includes(keyword));
        
        if (!isGeneric && hasJobKeywords) {
          detectedTitle = element.textContent.trim();
          confidence = 85;
          console.log('Job title found in element:', detectedTitle, 'confidence:', confidence);
          return detectedTitle;
        }
      }
    }
  }
  
  // Try document.title as last resort
  if (document.title) {
    const titleText = document.title.trim().toLowerCase();
    const isGeneric = genericTitles.some(title => titleText.includes(title));
    const hasJobKeywords = jobTitleKeywords.some(keyword => titleText.includes(keyword));
    
    if (!isGeneric && titleText.length > 5) {
      detectedTitle = document.title.trim();
      confidence = hasJobKeywords ? 60 : 30;
      console.log('Job title found in document.title:', detectedTitle, 'confidence:', confidence);
      return detectedTitle;
    }
  }
  
  console.log('No valid job title detected');
  return null;
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
  
  // First, try to detect from chips near h1
  const h1 = document.querySelector('h1');
  if (h1) {
    const chips = detectChipsNearElement(h1);
    console.log('Detected chips for company detection:', chips);
    
    for (const chip of chips) {
      const chipText = chip.textContent.trim().toLowerCase();
      const hasJobKeywords = jobTitleKeywords.some(keyword => chipText.includes(keyword));
      
      // If chip doesn't have job keywords, it's likely the company name
      if (!hasJobKeywords && chipText.length > 2) {
        const companyName = chip.textContent.trim();
        // Filter out common non-company words
        if (!/apply|submit|save|cancel|close|upload|delete/i.test(companyName)) {
          console.log('Company name found in chip:', companyName);
          return companyName;
        }
      }
    }
  }
  
  // Prefer elements with company-related classes/attributes first
  const companySelectors = [
    '[class*="company"]',
    '[class*="company-name"]',
    '[class*="employer"]',
    '[class*="organization"]',
    '[class*="organisation"]',
    '[class*="entreprise"]',
    '[class*="société"]',
    '[class*="recruiter"]',
    '[class*="recruteur"]',
    '[id*="company"]',
    '[id*="employer"]',
    '[data-test*="company"]',
    '[data-testid*="company"]'
  ];
  
  for (const selector of companySelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.textContent && element.textContent.trim() && element.textContent.trim().length > 2) {
        const text = element.textContent.trim();
        // Filter out common non-company words
        if (!/apply|submit|save|cancel|close|upload|delete/i.test(text)) {
          console.log('Company name found in element:', text);
          return text;
        }
      }
    }
  }
  
  // Try meta og:site_name
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName && ogSiteName.content) {
    const siteName = ogSiteName.content.trim();
    if (siteName.length > 2) {
      console.log('Company name found in og:site_name:', siteName);
      return siteName;
    }
  }
  
  // Try document.title as fallback
  if (document.title) {
    const title = document.title.trim();
    // Try to extract company from title (common patterns: "Job at Company", "Company - Job")
    const patterns = [
      /at\s+([A-Za-z\s&]+)$/i,
      /([A-Za-z\s&]+)\s*[-–]\s*/,
      /([A-Za-z\s&]+)\s*\|\s*/,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        const company = match[1].trim();
        if (!/apply|submit|save|cancel|close/i.test(company)) {
          console.log('Company name extracted from title:', company);
          return company;
        }
      }
    }
  }
  
  console.log('No company name detected');
  return null;
}

function fillPhoneFields(phoneNumber, filledFields) {
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
    const fullPhoneNumber = profile?.phone || phoneNumber;
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
