// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    const profile = request.profile;
    autofillForm(profile);
    sendResponse({ success: true });
  }
  return true;
});

function autofillForm(profile) {
  // Field mappings with multiple selectors to try
  const fieldMappings = {
    firstName: [
      { selector: 'input[name="firstName"]', type: 'name' },
      { selector: 'input[name="first_name"]', type: 'name' },
      { selector: 'input[name="firstname"]', type: 'name' },
      { selector: 'input[id="firstName"]', type: 'name' },
      { selector: 'input[id="first_name"]', type: 'name' },
      { selector: 'input[placeholder*="first name" i]', type: 'name' },
      { selector: 'input[placeholder*="First Name" i]', type: 'name' },
      { selector: 'input[aria-label*="first name" i]', type: 'name' },
      { selector: 'input[aria-label*="First Name" i]', type: 'name' },
    ],
    lastName: [
      { selector: 'input[name="lastName"]', type: 'name' },
      { selector: 'input[name="last_name"]', type: 'name' },
      { selector: 'input[name="lastname"]', type: 'name' },
      { selector: 'input[id="lastName"]', type: 'name' },
      { selector: 'input[id="last_name"]', type: 'name' },
      { selector: 'input[placeholder*="last name" i]', type: 'name' },
      { selector: 'input[placeholder*="Last Name" i]', type: 'name' },
      { selector: 'input[aria-label*="last name" i]', type: 'name' },
      { selector: 'input[aria-label*="Last Name" i]', type: 'name' },
    ],
    fullName: [
      { selector: 'input[name="fullName"]', type: 'name' },
      { selector: 'input[name="full_name"]', type: 'name' },
      { selector: 'input[name="fullname"]', type: 'name' },
      { selector: 'input[id="fullName"]', type: 'name' },
      { selector: 'input[id="full_name"]', type: 'name' },
      { selector: 'input[placeholder*="full name" i]', type: 'name' },
      { selector: 'input[placeholder*="Full Name" i]', type: 'name' },
      { selector: 'input[placeholder*="name" i]', type: 'name' },
      { selector: 'input[aria-label*="full name" i]', type: 'name' },
      { selector: 'input[aria-label*="Full Name" i]', type: 'name' },
    ],
    email: [
      { selector: 'input[name="email"]', type: 'email' },
      { selector: 'input[name="Email"]', type: 'email' },
      { selector: 'input[id="email"]', type: 'email' },
      { selector: 'input[type="email"]', type: 'email' },
      { selector: 'input[placeholder*="email" i]', type: 'email' },
      { selector: 'input[placeholder*="Email" i]', type: 'email' },
      { selector: 'input[aria-label*="email" i]', type: 'email' },
      { selector: 'input[aria-label*="Email" i]', type: 'email' },
    ],
    phone: [
      { selector: 'input[name="phone"]', type: 'tel' },
      { selector: 'input[name="phoneNumber"]', type: 'tel' },
      { selector: 'input[name="phone_number"]', type: 'tel' },
      { selector: 'input[name="mobile"]', type: 'tel' },
      { selector: 'input[id="phone"]', type: 'tel' },
      { selector: 'input[type="tel"]', type: 'tel' },
      { selector: 'input[type="phone"]', type: 'tel' },
      { selector: 'input[placeholder*="phone" i]', type: 'tel' },
      { selector: 'input[placeholder*="Phone" i]', type: 'tel' },
      { selector: 'input[placeholder*="mobile" i]', type: 'tel' },
      { selector: 'input[aria-label*="phone" i]', type: 'tel' },
      { selector: 'input[aria-label*="Phone" i]', type: 'tel' },
    ],
    linkedin: [
      { selector: 'input[name="linkedin"]', type: 'url' },
      { selector: 'input[name="linkedinUrl"]', type: 'url' },
      { selector: 'input[name="linkedin_url"]', type: 'url' },
      { selector: 'input[id="linkedin"]', type: 'url' },
      { selector: 'input[placeholder*="linkedin" i]', type: 'url' },
      { selector: 'input[placeholder*="LinkedIn" i]', type: 'url' },
      { selector: 'input[aria-label*="linkedin" i]', type: 'url' },
      { selector: 'input[aria-label*="LinkedIn" i]', type: 'url' },
    ],
    portfolio: [
      { selector: 'input[name="portfolio"]', type: 'url' },
      { selector: 'input[name="portfolioUrl"]', type: 'url' },
      { selector: 'input[name="portfolio_url"]', type: 'url' },
      { selector: 'input[id="portfolio"]', type: 'url' },
      { selector: 'input[placeholder*="portfolio" i]', type: 'url' },
      { selector: 'input[placeholder*="Portfolio" i]', type: 'url' },
      { selector: 'input[placeholder*="website" i]', type: 'url' },
      { selector: 'input[placeholder*="Website" i]', type: 'url' },
      { selector: 'input[aria-label*="portfolio" i]', type: 'url' },
      { selector: 'input[aria-label*="Portfolio" i]', type: 'url' },
    ],
  };

  // Get profile values
  const values = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    phone: profile.phone,
    linkedin: profile.linkedin,
    portfolio: profile.portfolio,
  };

  // Try to fill each field
  for (const [field, mappings] of Object.entries(fieldMappings)) {
    const value = values[field];
    if (!value) continue;

    for (const mapping of mappings) {
      const element = document.querySelector(mapping.selector);
      if (element && element.tagName === 'INPUT') {
        fillInput(element, value);
        break; // Stop trying once we find and fill a field
      }
    }
  }

  // Also try to find fields by label text
  fillByLabel('First Name', profile.firstName);
  fillByLabel('Last Name', profile.lastName);
  fillByLabel('Full Name', `${profile.firstName} ${profile.lastName}`);
  fillByLabel('Email', profile.email);
  fillByLabel('Phone', profile.phone);
  fillByLabel('LinkedIn', profile.linkedin);
  fillByLabel('Portfolio', profile.portfolio);
}

function fillInput(element, value) {
  // Focus the element first
  element.focus();
  
  // Clear existing value
  element.value = '';
  
  // Set new value
  element.value = value;
  
  // Trigger input events to ensure the form recognizes the change
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Blur the element
  element.blur();
}

function fillByLabel(labelText, value) {
  if (!value) return;

  // Find all labels
  const labels = document.querySelectorAll('label');
  
  for (const label of labels) {
    if (label.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
      // Find the input associated with this label
      const forId = label.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input && input.tagName === 'INPUT') {
          fillInput(input, value);
          return;
        }
      }
      
      // If no for attribute, try to find input as sibling
      const parent = label.parentElement;
      if (parent) {
        const input = parent.querySelector('input');
        if (input) {
          fillInput(input, value);
          return;
        }
      }
    }
  }
}
