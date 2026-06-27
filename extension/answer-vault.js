(function () {
  const VAULT_STORAGE_KEY = 'applyflow_answer_vault_v1';
  const VAULT_RECENT_KEY = 'applyflow_answer_vault_recent_v1';
  const MAX_RECENT = 10;

  let vaultAnswers = [];
  let vaultRecent = [];
  let panelOpen = false;
  let selectedCategory = 'all';
  let searchQuery = '';

  function loadVaultFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get([VAULT_STORAGE_KEY, VAULT_RECENT_KEY], (result) => {
        vaultAnswers = Array.isArray(result[VAULT_STORAGE_KEY]) ? result[VAULT_STORAGE_KEY] : [];
        vaultRecent = Array.isArray(result[VAULT_RECENT_KEY]) ? result[VAULT_RECENT_KEY] : [];
        resolve();
      });
    });
  }

  function saveVaultToStorage() {
    chrome.storage.local.set({
      [VAULT_STORAGE_KEY]: vaultAnswers,
      [VAULT_RECENT_KEY]: vaultRecent,
    });
  }

  function recordRecent(answerId) {
    vaultRecent = vaultRecent.filter((entry) => entry.answerId !== answerId);
    vaultRecent.unshift({ answerId, usedAt: new Date().toISOString() });
    vaultRecent = vaultRecent.slice(0, MAX_RECENT);
    saveVaultToStorage();
  }

  function getCategories() {
    const categories = new Set(vaultAnswers.map((answer) => answer.category));
    return ['all', ...categories];
  }

  function getFilteredAnswers() {
    const query = searchQuery.trim().toLowerCase();
    return vaultAnswers.filter((answer) => {
      if (selectedCategory !== 'all' && answer.category !== selectedCategory) return false;
      if (!query) return true;
      return (
        answer.title.toLowerCase().includes(query) ||
        answer.category.toLowerCase().includes(query) ||
        answer.content.toLowerCase().includes(query)
      );
    });
  }

  function getFavoriteAnswers() {
    return vaultAnswers.filter((answer) => answer.favorite);
  }

  function getRecentAnswers() {
    return vaultRecent
      .map((entry) => vaultAnswers.find((answer) => answer.id === entry.answerId))
      .filter(Boolean);
  }

  function getActiveField() {
    const active = document.activeElement;
    if (!active) return null;
    if (active.matches('input, textarea, select')) return active;
    if (active.isContentEditable) return active;
    return null;
  }

  function insertIntoContentEditable(element, value) {
    element.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      element.textContent = value;
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(value));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function insertAnswer(content) {
    const field = getActiveField();
    if (!field) return { success: false, reason: 'no-field' };

    try {
      if (field.isContentEditable) {
        insertIntoContentEditable(field, content);
        return { success: true };
      }

      if (typeof window.setNativeValue === 'function') {
        window.setNativeValue(field, content);
        return { success: true };
      }

      field.value = content;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true };
    } catch (error) {
      console.error('[Answer Vault] Insert failed:', error);
      return { success: false, reason: 'insert-error' };
    }
  }

  function showVaultToast(message, type) {
    let toast = document.getElementById('applyflow-vault-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'applyflow-vault-toast';
      toast.style.cssText = [
        'position:fixed',
        'bottom:96px',
        'right:24px',
        'z-index:2147483646',
        'max-width:320px',
        'padding:12px 14px',
        'border-radius:12px',
        'font:500 13px/1.4 system-ui,sans-serif',
        'box-shadow:0 10px 30px rgba(0,0,0,0.18)',
      ].join(';');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = type === 'error' ? '#FEE2E2' : type === 'warning' ? '#FEF3C7' : '#DCFCE7';
    toast.style.color = type === 'error' ? '#991B1B' : type === 'warning' ? '#92400E' : '#166534';
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 4000);
  }

  async function applyAnswer(answer) {
    const result = insertAnswer(answer.content);
    recordRecent(answer.id);

    if (result.success) {
      showVaultToast('Answer inserted successfully', 'success');
      return;
    }

    try {
      await navigator.clipboard.writeText(answer.content);
      showVaultToast('Answer copied to clipboard. Paste it manually with Ctrl + V.', 'warning');
    } catch {
      showVaultToast('Unable to insert answer', 'error');
    }
  }

  function renderAnswerButtons(container, answers, emptyText) {
    container.innerHTML = '';
    if (!answers.length) {
      const empty = document.createElement('p');
      empty.textContent = emptyText;
      empty.style.cssText = 'margin:0;color:#64748B;font-size:12px;';
      container.appendChild(empty);
      return;
    }

    answers.forEach((answer) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = answer.title;
      button.title = answer.category;
      button.style.cssText = [
        'border:1px solid #CBD5E1',
        'background:#fff',
        'color:#0F172A',
        'padding:8px 10px',
        'border-radius:10px',
        'font:500 12px system-ui,sans-serif',
        'cursor:pointer',
        'text-align:left',
      ].join(';');
      button.addEventListener('click', () => applyAnswer(answer));
      container.appendChild(button);
    });
  }

  function renderPanel() {
    const panel = document.getElementById('applyflow-vault-panel');
    if (!panel) return;

    const favorites = getFavoriteAnswers();
    const recent = getRecentAnswers();
    const filtered = getFilteredAnswers();
    const categories = getCategories();

    const categoryRow = panel.querySelector('[data-vault-categories]');
    const favoritesRow = panel.querySelector('[data-vault-favorites]');
    const recentRow = panel.querySelector('[data-vault-recent]');
    const answersRow = panel.querySelector('[data-vault-answers]');

    categoryRow.innerHTML = '';
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = category === 'all' ? 'All' : category;
      button.style.cssText = [
        'border:1px solid #CBD5E1',
        'background:' + (selectedCategory === category ? '#2563EB' : '#fff'),
        'color:' + (selectedCategory === category ? '#fff' : '#0F172A'),
        'padding:6px 10px',
        'border-radius:999px',
        'font:500 11px system-ui,sans-serif',
        'cursor:pointer',
      ].join(';');
      button.addEventListener('click', () => {
        selectedCategory = category;
        renderPanel();
      });
      categoryRow.appendChild(button);
    });

    renderAnswerButtons(favoritesRow, favorites.slice(0, 6), 'No favorite answers yet.');
    renderAnswerButtons(recentRow, recent.slice(0, 6), 'No recently used answers.');
    renderAnswerButtons(answersRow, filtered, 'No answers found.');
  }

  function createVaultUI() {
    if (document.getElementById('applyflow-vault-toggle')) return;

    const toggle = document.createElement('button');
    toggle.id = 'applyflow-vault-toggle';
    toggle.type = 'button';
    toggle.textContent = 'AV';
    toggle.title = 'Answer Vault Quick Picker';
    toggle.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:2147483646',
      'width:52px',
      'height:52px',
      'border:none',
      'border-radius:16px',
      'background:linear-gradient(135deg,#2563EB,#7C3AED)',
      'color:#fff',
      'font:700 14px system-ui,sans-serif',
      'box-shadow:0 10px 30px rgba(37,99,235,0.35)',
      'cursor:pointer',
    ].join(';');

    const panel = document.createElement('div');
    panel.id = 'applyflow-vault-panel';
    panel.style.cssText = [
      'position:fixed',
      'bottom:88px',
      'right:24px',
      'z-index:2147483646',
      'width:min(360px,calc(100vw - 32px))',
      'max-height:70vh',
      'overflow:auto',
      'display:none',
      'padding:14px',
      'border-radius:16px',
      'background:#fff',
      'border:1px solid #E2E8F0',
      'box-shadow:0 20px 40px rgba(15,23,42,0.18)',
      'font-family:system-ui,sans-serif',
    ].join(';');

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong style="font-size:14px;color:#0F172A;">Answer Vault</strong>
        <button type="button" data-vault-close style="border:none;background:transparent;font-size:18px;cursor:pointer;">×</button>
      </div>
      <input data-vault-search placeholder="Search answers..." style="width:100%;padding:8px 10px;border:1px solid #CBD5E1;border-radius:10px;margin-bottom:10px;font-size:12px;" />
      <div data-vault-categories style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:6px;">Favorites</div>
        <div data-vault-favorites style="display:flex;flex-wrap:wrap;gap:6px;"></div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:6px;">Recent</div>
        <div data-vault-recent style="display:flex;flex-wrap:wrap;gap:6px;"></div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:#64748B;margin-bottom:6px;">Answers</div>
        <div data-vault-answers style="display:flex;flex-direction:column;gap:6px;"></div>
      </div>
    `;

    toggle.addEventListener('click', async () => {
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'block' : 'none';
      if (panelOpen) {
        await loadVaultFromStorage();
        renderPanel();
      }
    });

    panel.querySelector('[data-vault-close]').addEventListener('click', () => {
      panelOpen = false;
      panel.style.display = 'none';
    });

    panel.querySelector('[data-vault-search]').addEventListener('input', (event) => {
      searchQuery = event.target.value;
      renderPanel();
    });

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type === 'APPLYFLOW_VAULT_SYNC') {
      vaultAnswers = Array.isArray(event.data.payload) ? event.data.payload : [];
      saveVaultToStorage();
      if (panelOpen) renderPanel();
    }
    if (event.data?.type === 'APPLYFLOW_VAULT_RECENT_SYNC') {
      vaultRecent = Array.isArray(event.data.payload) ? event.data.payload : [];
      saveVaultToStorage();
      if (panelOpen) renderPanel();
    }
  });

  async function initAnswerVault() {
    await loadVaultFromStorage();

    const host = window.location.host;
    const isApplyFlowApp = APPLYFLOW_FRONTEND_HOST_PATTERNS.some((pattern) => host.includes(pattern));
    if (!isApplyFlowApp) {
      createVaultUI();
    }
  }

  window.ApplyFlowAnswerVault = {
    init: initAnswerVault,
    reload: loadVaultFromStorage,
    applyAnswer,
  };

  initAnswerVault();
})();
