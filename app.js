(() => {
  'use strict';

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const els = {
    apiEnabled: qs('#api-enabled'),
    apiKey: qs('#api-key'),
    btnGen: qs('#btn-generate'),
    btnTheme: qs('#btn-theme'),
    endpointUrl: qs('#endpoint-url'),
    endpointDirect: qs('#endpoint-direct'),
    btnFetchTree: qs('#btn-fetch-tree'),
    btnExpandAll: qs('#btn-expand-all'),
    btnCollapseAll: qs('#btn-collapse-all'),
    tree: qs('#tree-container'),
    logList: qs('#log-list'),
    btnAddRow: qs('#btn-add-row'),
    btnSave: qs('#btn-save'),
    btnTest: qs('#btn-test'),
    out: qs('#test-output'),
    btnReset: qs('#btn-reset'),
  };

  const state = {
    config: {
      apiEnabled: false,
      apiKey: '',
      files: [] // { path, deleteAfterRead }
    }
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
      showToast('Copiato negli appunti');
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showToast('Copiato');
    }
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 500);
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
    renderRows();
    buildEndpointPreview();
  }

  async function saveConfig() {
    const payload = JSON.stringify(state.config);
    const res = await fetch('save-config.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    if (!res.ok) throw new Error('Salvataggio fallito');
    showToast('Configurazione salvata');
  }

  function renderRows() {
    els.logList.innerHTML = '';
    state.config.files.forEach(f => addRow(f.path, !!f.deleteAfterRead, !!f.hide));
    if (state.config.files.length === 0) addRow('', false, false);
  }

  function addRow(path = '', del = false, hide = false) {
    const tpl = qs('#row-template');
    const li = tpl.content.firstElementChild.cloneNode(true);
    const input = qs('.path', li);
    const chk = qs('.delete-after', li);
    const hideChk = qs('.hide-log', li);
    const btn = qs('.remove', li);
    const btnExp = qs('.expand', li);
    const panel = qs('.details', li);
    const dragHandle = qs('.drag-handle', li);
    input.value = path;
    chk.checked = del;
    hideChk.checked = hide;
    
    // Apply hidden styling if needed
    if (hide) {
      li.classList.add('hidden-marked');
    }

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
        input.value = p;
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
    btn.addEventListener('click', () => {
      li.remove();
      syncStateFromDOM();
    });

    els.logList.appendChild(li);
  }

  function existsPath(path) {
    return qsa('.log-row .path').some(i => i.value === path);
  }

  function syncStateFromDOM() {
    const files = qsa('.log-row').map(row => ({
      path: qs('.path', row).value.trim(),
      deleteAfterRead: qs('.delete-after', row).checked,
      fromDate: qs('.from-date', row)?.value || '',
      fromTime: qs('.from-time', row)?.value || '',
      forceDate: !!qs('.force-date', row)?.checked,
      hide: !!qs('.hide-log', row)?.checked
    })).filter(f => f.path);
    state.config.files = dedupe(files);
    state.config.apiEnabled = els.apiEnabled.checked;
    state.config.apiKey = els.apiKey.value.trim();
    buildEndpointPreview();
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
    showToast('Struttura aggiornata');
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
    showToast('Nuova chiave generata');
  });
  els.apiEnabled.addEventListener('change', syncStateFromDOM);
  els.btnAddRow.addEventListener('click', () => { addRow('', false, false); showToast('Riga aggiunta'); });
  els.btnSave.addEventListener('click', async () => { syncStateFromDOM(); await saveConfig(); });
  els.btnFetchTree.addEventListener('click', fetchTree);
  els.btnExpandAll && els.btnExpandAll.addEventListener('click', () => { setAllCollapsed(false); showToast('Tutti espansi'); });
  els.btnCollapseAll && els.btnCollapseAll.addEventListener('click', () => { setAllCollapsed(true); showToast('Tutti compressi'); });
  els.btnTheme && els.btnTheme.addEventListener('click', () => {
    const current = localStorage.getItem('vsdbg_theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
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
    // Reset all values to defaults
    els.apiEnabled.checked = false;
    els.apiKey.value = '';
    state.config = {
      apiEnabled: false,
      apiKey: '',
      files: []
    };
    renderRows();
    buildEndpointPreview();
    await saveConfig();
    showToast('Reset completato');
  });
  els.btnTest.addEventListener('click', async () => {
    syncStateFromDOM();
    await saveConfig();
    const url = 'index.php?api_key=' + encodeURIComponent(state.config.apiKey) + '&pretty=1';
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const max = 500;
    const trimmed = lines.length > max ? lines.slice(-max).join('\n') : text;
    els.out.textContent = trimmed;
    showToast('Test eseguito');
  });

  // init
  // theme init
  applyTheme(localStorage.getItem('vsdbg_theme') || 'dark');
  loadConfig();
  fetchTree();
})();


