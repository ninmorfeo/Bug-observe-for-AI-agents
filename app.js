(() => {
  'use strict';

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const els = {
    apiEnabled: qs('#api-enabled'),
    apiKey: qs('#api-key'),
    btnGen: qs('#btn-generate'),
    btnTheme: qs('#btn-theme'),
    btnLogout: qs('#btn-logout'),
    endpointUrl: qs('#endpoint-url'),
    endpointDirect: qs('#endpoint-direct'),
    btnFetchTree: qs('#btn-fetch-tree'),
    btnExpandAll: qs('#btn-expand-all'),
    btnCollapseAll: qs('#btn-collapse-all'),
    btnCollapsePanel: qs('#btn-collapse-panel'),
    rightColumn: qs('#right-column'),
    logFilesCont: qs('.log-files-grid'),
    tree: qs('#tree-container'),
    logList: qs('#log-list'),
    btnAddRow: qs('#btn-add-row'),
    btnSave: qs('#btn-save'),
    btnTest: qs('#btn-test'),
    out: qs('#test-output'),
    btnReset: qs('#btn-reset'),
    unsavedChanges: qs('#unsaved-changes'),
    btnDownloadHtaccess: qs('#btn-download-htaccess'),
    maxAttempts: qs('#max-attempts'),
    blockDuration: qs('#block-duration'),
    sessionTimeout: qs('#session-timeout'),
    currentPassword: qs('#current-password'),
    newPassword: qs('#new-password'),
    confirmPassword: qs('#confirm-password'),
    btnChangePassword: qs('#btn-change-password'),
    passwordStrength: qs('#password-strength'),
    adminUsername: qs('#admin-username'),
    sessionExpires: qs('#session-expires'),
  };

  const state = {
    config: {
      apiEnabled: false,
      apiKey: '',
      maxAttempts: 10,
      blockDuration: 300,
      sessionTimeout: 30,
      files: [] // { path, deleteAfterRead }
    },
    hasUnsavedChanges: false
  };

  function buildEndpointPreview() {
    const base = location.origin + location.pathname.replace(/\/admin\.html$/, '/');
    const idx = base + 'index.php';
    els.endpointUrl.textContent = idx + '?api_key=' + (state.config.apiKey || 'XXXXX');
    els.endpointDirect.textContent = idx + '?api_key=' + (state.config.apiKey || 'XXXXX') + '&pretty=1';
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('toast.copied'));
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showToast(t('toast.copied.short'));
    }
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  // Theme handling
  function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      mode = 'dark';
    }
    localStorage.setItem('vsdbg_theme', mode);
    // toggle SVG states (handled by CSS via [data-theme]) - no text swap
  }

  async function loadConfig() {
    const res = await fetch('load-config.php');
    const data = await res.json();
    state.config = Object.assign(state.config, data);
    els.apiEnabled.checked = !!state.config.apiEnabled;
    els.apiKey.value = state.config.apiKey || '';
    els.maxAttempts.value = state.config.maxAttempts || 10;
    els.blockDuration.value = state.config.blockDuration || 300;
    els.sessionTimeout.value = state.config.sessionTimeout || 30;
    
    // Temporarily disable change tracking during initial load
    const prevState = state.hasUnsavedChanges;
    state.hasUnsavedChanges = false;
    
    renderRows(true); // Prevent sync during initial render
    buildEndpointPreview();
    
    // Restore state (should be false on initial load)
    state.hasUnsavedChanges = prevState;
  }

  async function saveConfig(silent = false) {
    const payload = JSON.stringify(state.config);
    const res = await fetch('save-config.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    
    const result = await res.json();
    
    if (!res.ok || !result.ok) {
      throw new Error(result.error || 'Salvataggio fallito');
    }
    
    // Hide unsaved changes warning
    state.hasUnsavedChanges = false;
    els.unsavedChanges.style.display = 'none';
    
    if (!silent) {
      // Show success banner
      const successBanner = document.getElementById('save-success');
      if (successBanner) {
        successBanner.style.display = 'flex';
        // Hide it after 3 seconds
        setTimeout(() => {
          successBanner.style.display = 'none';
        }, 3000);
      }
      
      showToast(t('toast.saved'));
    }
  }

  function renderRows(preventSync = false) {
    els.logList.innerHTML = '';
    
    // Temporarily disable sync during render to prevent false change detection
    const originalSync = window.syncStateFromDOM;
    if (preventSync) {
      window.syncStateFromDOM = () => {};
    }
    
    state.config.files.forEach(f => addRow(f.path, !!f.deleteAfterRead, !!f.hide, f.charLimit || 0));
    if (state.config.files.length === 0) addRow('', false, false, 0);
    
    // Restore original sync function
    if (preventSync) {
      window.syncStateFromDOM = originalSync;
    }
  }

  function addRow(path = '', del = false, hide = false, charLimit = 0) {
    const tpl = qs('#row-template');
    const li = tpl.content.firstElementChild.cloneNode(true);
    const input = qs('.path', li);
    const chk = qs('.delete-after', li);
    const hideChk = qs('.hide-log', li);
    const charLimitInput = qs('.char-limit', li);
    const btnEmpty = qs('.empty-log', li);
    const btn = qs('.remove', li);
    const btnExp = qs('.expand', li);
    const panel = qs('.details', li);
    const dragHandle = qs('.drag-handle', li);
    // Remove readonly to set value, then restore it
    input.removeAttribute('readonly');
    input.value = path;
    input.setAttribute('readonly', '');
    chk.checked = del;
    hideChk.checked = hide;
    charLimitInput.value = charLimit || 0;
    
    // Apply hidden styling if needed
    if (hide) {
      li.classList.add('hidden-marked');
    }
    
    // Apply translations to cloned template elements
    li.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = t(key);
      
      if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
        element.value = text;
      } else if (element.tagName === 'INPUT' && element.placeholder) {
        element.placeholder = text;
      } else {
        element.textContent = text;
      }
    });
    
    // Apply title translations
    li.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = t(key);
      element.setAttribute('aria-label', t(key));
    });

    // Improved drag & drop with visual gaps
    dragHandle.addEventListener('dragstart', ev => {
      li.classList.add('dragging');
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', '');
      
      // Add dragging state to container
      els.logList.classList.add('dragging-active');
      
      // Create drop zones between all rows
      setTimeout(() => {
        createDropZones();
      }, 0);
    });
    
    dragHandle.addEventListener('dragend', ev => {
      ev.preventDefault();
      
      li.classList.remove('dragging');
      els.logList.classList.remove('dragging-active');
      
      // Remove all drop zones
      removeDropZones();
      
      syncStateFromDOM();
    });
    
    // Handle drop from file explorer
    input.addEventListener('dragover', ev => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'copy';
      input.classList.add('drop-target');
    });
    
    input.addEventListener('dragleave', () => {
      input.classList.remove('drop-target');
    });
    
    input.addEventListener('drop', ev => {
      ev.preventDefault();
      input.classList.remove('drop-target');
      const p = ev.dataTransfer.getData('text/plain');
      if (p && !existsPath(p)) {
        // Temporarily remove readonly to allow value change
        input.removeAttribute('readonly');
        input.value = p;
        input.setAttribute('readonly', '');
        syncStateFromDOM();
      }
    });
    
    // Handle row reordering
    li.addEventListener('dragover', ev => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    });
    
    li.addEventListener('drop', ev => {
      ev.preventDefault();
      ev.stopPropagation();
    });

    chk.addEventListener('change', syncStateFromDOM);
    charLimitInput.addEventListener('change', syncStateFromDOM);
    
    // Handle hide checkbox styling
    hideChk.addEventListener('change', () => {
      if (hideChk.checked) {
        li.classList.add('hidden-marked');
      } else {
        li.classList.remove('hidden-marked');
      }
      syncStateFromDOM();
    });
    
    btnExp.addEventListener('click', () => {
      const open = panel.classList.toggle('show');
      btnExp.classList.toggle('open', open);
    });
    
    btnEmpty.addEventListener('click', async () => {
      const logPath = input.value.trim();
      if (!logPath) {
        showToast(t('error.path'));
        return;
      }
      
      if (confirm(`${t('confirm.empty')}:\n${logPath}?`)) {
        try {
          const response = await fetch('empty-log.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
              // No API key needed - using session authentication
            },
            body: JSON.stringify({ path: logPath })
          });
          
          if (response.ok) {
            // Show success banner
            const emptyBanner = document.getElementById('empty-success');
            if (emptyBanner) {
              emptyBanner.style.display = 'flex';
              // Hide it after 3 seconds
              setTimeout(() => {
                emptyBanner.style.display = 'none';
              }, 3000);
            }
            showToast(t('toast.empty'));
          } else {
            const error = await response.text();
            showToast(`${t('error.save')}${error}`);
          }
        } catch (err) {
          showToast(`${t('error.connection')}${err.message}`);
        }
      }
    });
    
    btn.addEventListener('click', () => {
      li.remove();
      syncStateFromDOM();
    });

    els.logList.appendChild(li);
  }

  function existsPath(path) {
    return qsa('.log-row .path').some(i => i.value === path);
  }

  function syncStateFromDOM(skipChangeDetection = false) {
    // Save old state to compare
    const oldState = JSON.stringify(state.config);
    
    const logRows = qsa('.log-row');
    const files = logRows.map(row => {
      const pathInput = qs('.path', row);
      const pathValue = pathInput ? pathInput.value.trim() : '';
      return {
        path: pathValue,
        deleteAfterRead: qs('.delete-after', row).checked,
        fromDate: qs('.from-date', row)?.value || '',
        fromTime: qs('.from-time', row)?.value || '',
        forceDate: !!qs('.force-date', row)?.checked,
        hide: !!qs('.hide-log', row)?.checked,
        charLimit: parseInt(qs('.char-limit', row)?.value || '0', 10)
      };
    }).filter(f => f.path);
    state.config.files = dedupe(files);
    state.config.apiEnabled = els.apiEnabled.checked;
    state.config.apiKey = els.apiKey.value.trim();
    state.config.maxAttempts = parseInt(els.maxAttempts.value, 10) || 10;
    state.config.blockDuration = parseInt(els.blockDuration.value, 10) || 300;
    state.config.sessionTimeout = parseInt(els.sessionTimeout.value, 10) || 30;
    buildEndpointPreview();
    
    // Compare new state with old state
    const newState = JSON.stringify(state.config);
    const hasChanges = oldState !== newState;
    
    // Show unsaved changes warning only if there are real changes
    if (!skipChangeDetection && hasChanges && !state.hasUnsavedChanges) {
      state.hasUnsavedChanges = true;
      els.unsavedChanges.style.display = 'flex';
    }
  }

  function dedupe(arr) {
    const seen = new Set();
    return arr.filter(o => (seen.has(o.path) ? false : (seen.add(o.path), true)));
  }
  
  // Helper functions for drag and drop
  function createDropZones() {
    const rows = qsa('.log-row:not(.dragging)');
    const draggingRow = document.querySelector('.log-row.dragging');
    
    // Add drop zone before first item
    const firstZone = document.createElement('div');
    firstZone.className = 'drop-zone';
    firstZone.addEventListener('dragover', ev => {
      ev.preventDefault();
      firstZone.classList.add('active');
    });
    firstZone.addEventListener('dragleave', () => {
      firstZone.classList.remove('active');
    });
    firstZone.addEventListener('drop', ev => {
      ev.preventDefault();
      if (draggingRow && rows[0]) {
        els.logList.insertBefore(draggingRow, rows[0]);
      }
    });
    if (rows[0]) {
      els.logList.insertBefore(firstZone, rows[0]);
    }
    
    // Add drop zones between items
    rows.forEach((row, index) => {
      const zone = document.createElement('div');
      zone.className = 'drop-zone';
      
      zone.addEventListener('dragover', ev => {
        ev.preventDefault();
        zone.classList.add('active');
      });
      
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('active');
      });
      
      zone.addEventListener('drop', ev => {
        ev.preventDefault();
        if (draggingRow) {
          if (row.nextSibling) {
            els.logList.insertBefore(draggingRow, row.nextSibling);
          } else {
            els.logList.appendChild(draggingRow);
          }
        }
      });
      
      // Insert zone after each row
      if (row.nextSibling) {
        els.logList.insertBefore(zone, row.nextSibling);
      } else {
        els.logList.appendChild(zone);
      }
    });
  }
  
  function removeDropZones() {
    qsa('.drop-zone').forEach(zone => zone.remove());
  }

  async function fetchTree() {
    els.tree.textContent = 'Caricamento...';
    const res = await fetch('folders.php');
    const data = await res.json();
    els.tree.innerHTML = '';
    els.tree.appendChild(renderTree(data, true));
    showToast(t('toast.tree'));
  }

  // Nuovo renderer: usa <details>/<summary> per evitare bug di click sul primo figlio
  function renderTree(node, isRoot = false) {
    if (node.type === 'dir') {
      const details = document.createElement('details');
      details.className = 'dir';
      if (isRoot) details.open = true;
      const summary = document.createElement('summary');
      summary.className = 'label';
      const chev = document.createElement('span');
      chev.className = 'chev';
      chev.innerHTML = '&#9656;';
      summary.appendChild(chev);
      const icon = document.createElement('span');
      icon.className = 'icon ico-folder';
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h5l2 2h11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V5a2 2 0 0 1 2-2h3l2 2h4"/></svg>';
      summary.appendChild(icon);
      const text = document.createElement('span');
      text.textContent = ' ' + node.name;
      summary.appendChild(text);
      details.appendChild(summary);
      const group = document.createElement('div');
      group.className = 'group';
      // Inizializza display basato sullo stato open del details
      group.style.display = details.open ? 'block' : 'none';
      if (node.children) node.children.forEach(ch => group.appendChild(renderTree(ch)));
      details.appendChild(group);
      // Assicura la visibilità tramite toggle event nativo
      details.addEventListener('toggle', () => {
        group.style.display = details.open ? 'block' : 'none';
      });
      return details;
    } else {
      const file = document.createElement('div');
      file.className = 'label file';
      const spacer = document.createElement('span'); spacer.className = 'chev-spacer'; spacer.innerHTML = '&nbsp;';
      file.appendChild(spacer);
      const icon = document.createElement('span');
      icon.className = 'icon ico-file';
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
      file.appendChild(icon);
      const text = document.createElement('span'); text.textContent = ' ' + node.name; file.appendChild(text);
      file.setAttribute('draggable', 'true');
      file.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData('text/plain', node.path);
        file.classList.add('dragging');
      });
      file.addEventListener('dragend', () => file.classList.remove('dragging'));
      return file;
    }
  }

  function setAllCollapsed(collapsed) {
    qsa('#tree-container details').forEach((d) => {
      d.open = !collapsed;
      const g = d.querySelector(':scope > .group');
      if (g) g.style.display = d.open ? 'block' : 'none';
    });
  }

  // Non più necessari (lasciati come no-op per compatibilità)
  function expandBranch() {}
  function collapseBranch() {}

  // Nessuna delega manuale: <details>/<summary> gestiscono toggle di sistema

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  // Events
  els.btnGen.addEventListener('click', () => {
    const rnd = Math.random().toString(36).slice(2) + '_' + Date.now();
    els.apiKey.value = 'dbg_' + rnd;
    syncStateFromDOM();
    showToast(t('toast.key'));
  });
  els.apiEnabled.addEventListener('change', syncStateFromDOM);
  els.maxAttempts.addEventListener('change', syncStateFromDOM);
  els.blockDuration.addEventListener('change', syncStateFromDOM);
  els.sessionTimeout && els.sessionTimeout.addEventListener('change', syncStateFromDOM);
  els.btnAddRow.addEventListener('click', () => { addRow('', false, false, 0); showToast(t('toast.row')); });
  els.btnSave.addEventListener('click', async () => { 
    try {
      // Force a fresh sync from DOM (skip change detection since we're saving)
      syncStateFromDOM(true); 
      await saveConfig();
    } catch (error) {
      showToast(t('error.save') + error.message);
      // Show warning banner again if save failed
      if (state.hasUnsavedChanges) {
        els.unsavedChanges.style.display = 'flex';
      }
    }
  });
  els.btnFetchTree.addEventListener('click', fetchTree);
  els.btnExpandAll && els.btnExpandAll.addEventListener('click', () => { setAllCollapsed(false); showToast(t('toast.expand')); });
  els.btnCollapseAll && els.btnCollapseAll.addEventListener('click', () => { setAllCollapsed(true); showToast(t('toast.collapse')); });
  
  // Collapse panel handler with height calculation
  els.btnCollapsePanel && els.btnCollapsePanel.addEventListener('click', () => {
    const isCollapsed = els.rightColumn.classList.contains('collapsed');
    
    if (isCollapsed) {
      // Expanding sequence: start expansion but keep content hidden
      els.rightColumn.classList.remove('collapsed');
      els.rightColumn.classList.add('expanding');
      
      // Start grid expansion immediately
      els.logFilesCont.classList.remove('panel-collapsed');
      
      // Show content only after transform animation completes
      setTimeout(() => {
        const contentWrapper = els.rightColumn.querySelector('.content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.display = '';
          contentWrapper.style.background = '';
        }
      }, 350);
      
      // Complete expansion
      setTimeout(() => {
        els.rightColumn.style.height = '';
        els.rightColumn.classList.remove('expanding');
        els.rightColumn.classList.add('expanded');
        showToast(t('toast.explorer.show'));
      }, 400);
      
    } else {
      // Collapsing sequence: calculate and fix height first
      const currentHeight = els.rightColumn.offsetHeight;
      els.rightColumn.style.height = currentHeight + 'px';
      
      els.rightColumn.classList.remove('expanded');
      els.rightColumn.classList.add('collapsing');
      
      // Start grid compression after content starts fading
      setTimeout(() => {
        els.logFilesCont.classList.add('panel-collapsed');
      }, 150);
      
      // Complete collapse state
      setTimeout(() => {
        els.rightColumn.classList.remove('collapsing');
        els.rightColumn.classList.add('collapsed');
        showToast(t('toast.explorer.hide'));
      }, 400);
    }
  });
  
  els.btnTheme && els.btnTheme.addEventListener('click', () => {
    const current = localStorage.getItem('vsdbg_theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
  
  // Logout handler
  els.btnLogout && els.btnLogout.addEventListener('click', async () => {
    if (confirm(t('confirm.logout'))) {
      try {
        await fetch('auth.php', { method: 'DELETE' });
        window.location.href = 'login.html';
      } catch (error) {
        showToast(t('error.connection'));
      }
    }
  });
  
  // Password strength indicator
  els.newPassword && els.newPassword.addEventListener('input', updatePasswordStrength);
  
  // Change password handler
  els.btnChangePassword && els.btnChangePassword.addEventListener('click', async () => {
    const currentPassword = els.currentPassword?.value || '';
    const newPassword = els.newPassword?.value || '';
    const confirmPassword = els.confirmPassword?.value || '';
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t('error.password.fields'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast(t('error.password.match'));
      return;
    }
    
    if (newPassword.length < 8) {
      showToast(t('error.password.length'));
      return;
    }
    
    try {
      els.btnChangePassword.disabled = true;
      els.btnChangePassword.textContent = 'Cambio in corso...';
      
      const response = await fetch('change-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('Password cambiata con successo!');
        // Clear form
        els.currentPassword.value = '';
        els.newPassword.value = '';
        els.confirmPassword.value = '';
        updatePasswordStrength();
      } else {
        showToast(data.error || 'Errore nel cambio password');
      }
    } catch (error) {
      showToast('Errore di connessione');
    } finally {
      els.btnChangePassword.disabled = false;
      els.btnChangePassword.textContent = 'Cambia Password';
    }
  });
  // rimosso pulsante clipboard globale
  // Copy endpoints on click with visual feedback
  els.endpointUrl && els.endpointUrl.addEventListener('click', async () => {
    await copyToClipboard(els.endpointUrl.textContent.trim());
    els.endpointUrl.classList.add('copied');
    setTimeout(() => els.endpointUrl.classList.remove('copied'), 600);
  });
  els.endpointDirect && els.endpointDirect.addEventListener('click', async () => {
    await copyToClipboard(els.endpointDirect.textContent.trim());
    els.endpointDirect.classList.add('copied');
    setTimeout(() => els.endpointDirect.classList.remove('copied'), 600);
  });
  els.btnReset.addEventListener('click', async () => {
    if (!confirm(t('confirm.reset'))) {
      return;
    }
    
    // Reset all values to defaults
    els.apiEnabled.checked = false;
    els.apiKey.value = '';
    els.maxAttempts.value = 10;
    els.blockDuration.value = 300;
    els.sessionTimeout.value = 30;
    state.config = {
      apiEnabled: false,
      apiKey: '',
      maxAttempts: 10,
      blockDuration: 300,
      sessionTimeout: 30,
      files: []
    };
    renderRows();
    buildEndpointPreview();
    
    try {
      // Save config
      await saveConfig();
      
      // Reset admin password via new endpoint
      const resetResponse = await fetch('reset-admin.php', { 
        method: 'POST' 
      });
      
      if (resetResponse.ok) {
        showToast('Reset completato! Reindirizzamento al login...');
        // Logout and redirect after reset
        setTimeout(async () => {
          await fetch('auth.php', { method: 'DELETE' });
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showToast('Reset configurazione completato, ma errore nel reset password admin');
      }
    } catch (error) {
      showToast('Errore durante il reset');
    }
  });
  els.btnTest.addEventListener('click', async () => {
    // Sync without showing warning banner
    syncStateFromDOM(true);
    
    await saveConfig(true); // Silent save for test
    
    // Use the test endpoint that works with session auth
    const res = await fetch('test-endpoint.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const max = 500;
    const trimmed = lines.length > max ? lines.slice(-max).join('\n') : text;
    els.out.textContent = trimmed;
    showToast(t('toast.test'));
  });
  
  // Download htaccess example
  els.btnDownloadHtaccess && els.btnDownloadHtaccess.addEventListener('click', async () => {
    try {
      const response = await fetch('htaccess-example.txt');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'htaccess-example.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('.htaccess di esempio scaricato');
    } catch (err) {
      showToast('Errore nel download del file');
    }
  });

  // Password strength checker
  function checkPasswordStrength(password) {
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }
  
  // Update password strength indicator
  function updatePasswordStrength() {
    const password = els.newPassword?.value || '';
    const strength = checkPasswordStrength(password);
    
    if (els.passwordStrength) {
      els.passwordStrength.className = 'password-strength';
      if (strength) {
        els.passwordStrength.classList.add(strength);
      }
    }
  }
  
  // Check authentication first
  async function checkAuth() {
    try {
      const res = await fetch('auth.php');
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = 'login.html';
        return false;
      }
      // Update username display
      if (els.adminUsername) {
        els.adminUsername.textContent = data.username || 'admin';
      }
      // Update session timer
      updateSessionTimer();
      return true;
    } catch (error) {
      window.location.href = 'login.html';
      return false;
    }
  }
  
  // Update session expiry timer
  function updateSessionTimer() {
    if (!els.sessionExpires) return;
    
    const sessionTimeoutMinutes = state.config.sessionTimeout || 30;
    const sessionTimeoutMs = sessionTimeoutMinutes * 60000;
    let lastActivity = Date.now();
    
    // Reset activity on any user interaction
    document.addEventListener('click', () => { lastActivity = Date.now(); });
    document.addEventListener('keypress', () => { lastActivity = Date.now(); });
    
    const updateTimer = () => {
      const expiresIn = sessionTimeoutMs - (Date.now() - lastActivity);
      
      if (expiresIn <= 0) {
        els.sessionExpires.textContent = 'Sessione scaduta';
        window.location.href = 'login.html';
        return;
      }
      
      const minutes = Math.floor(expiresIn / 60000);
      const seconds = Math.floor((expiresIn % 60000) / 1000);
      els.sessionExpires.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    updateTimer();
    setInterval(updateTimer, 1000);
  }
  
  // init
  checkAuth().then(authenticated => {
    if (authenticated) {
      // Initialize language system first
      initLanguage();
      // theme init
      applyTheme(localStorage.getItem('vsdbg_theme') || 'dark');
      loadConfig();
      fetchTree();
    }
  });
})();


