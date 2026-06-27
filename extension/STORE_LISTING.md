# Chrome Web Store Listing — ApplyFlow Extension

## Checklist before submission

- [ ] Set production URLs in `extension/config.js` (`APPLYFLOW_ENV = 'production'`)
- [ ] Update `manifest.json` host_permissions with your real frontend domain
- [ ] Rebuild `extension.zip` and upload to `frontend/public/downloads/`
- [ ] Privacy policy live at `/privacy` on your frontend domain
- [ ] Stripe Pro plan tested end-to-end

## Store listing copy

**Name:** ApplyFlow — Job Application Autofill

**Short description:** Autofill job forms, track applications, and score CV match from your ApplyFlow profile.

**Category:** Productivity

**Permissions justification:**
- `storage` — save login session and answer vault cache
- `activeTab` / `scripting` — autofill on the current job application page
- `cookies` — sync login from the ApplyFlow website
- `<all_urls>` — read form fields on job board pages

## Screenshots needed

1. Extension popup with Autofill + Match buttons
2. Kanban tracker on web app
3. Match score panel with missing keywords
4. Answer Vault on profile page

## Privacy policy URL

`https://your-frontend-domain.com/privacy`
