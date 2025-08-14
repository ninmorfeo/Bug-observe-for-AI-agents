// Internationalization for BugObserve AI Agents
const translations = {
  it: {
    // Header
    'app.title': 'BugObserve for AI Agents',
    'app.subtitle': 'Amministrazione endpoint log v2.0',
    'btn.save': 'Salva configurazione',
    'btn.save.profile': 'Salva i tuoi dati',
    'btn.theme': 'Tema notte/chiaro',
    'btn.language': 'Cambia lingua / Change language',
    
    // Main sections
    'section.api': 'Configurazione API Log',
    'section.security': 'Sicurezza e Account',
    'section.files': 'Nomi file di log da esaminare',
    'section.explorer': 'Explorer file',
    
    // API Configuration
    'api.enabled': 'API attivata',
    'api.key': 'Chiave API',
    'api.generate': 'Genera nuova chiave',
    'api.endpoint': 'Endpoint',
    'api.direct': 'Endpoint diretto',
    'api.test': 'Testa endpoint',
    'api.reset': 'Reset Completo',
    'api.status': 'Stato del Sistema',
    'api.drop.hint': 'Trascina qui i file di log dal riquadro a destra',
    
    // Security
    'security.attempts': 'Tentativi massimi',
    'security.block': 'Durata blocco (secondi)',
    'security.session': 'Timeout sessione (minuti)',
    'security.password.current': 'Password attuale',
    'security.password.new': 'Nuova password',
    'security.password.confirm': 'Conferma password',
    'security.password.change': 'Cambia Password',
    'security.user': 'Utente',
    'security.expires': 'Sessione scade tra',
    'security.logout': 'Logout',
    'security.personal': 'Dati Personali',
    'security.change.password': 'Cambia Password',
    'security.session.status': 'Stato Sessione',
    'security.account.info': 'Informazioni Account',
    'security.brute.force': 'Protezione Brute Force',
    'security.warning.title': '⚠️ Sicurezza',
    'security.warning.text': 'Ricordati di proteggere la tua cartella in ambiente di produzione inserendo un .htaccess corretto!',
    'security.warning.description': 'Questo impedirà accessi non autorizzati ai file di configurazione e ai log.',
    'security.download.htaccess': 'Scarica .htaccess di esempio',
    'security.reset.title': '🔄 Reset completo',
    'security.reset.warning': '⚠️ ATTENZIONE: Questa operazione:',
    'security.reset.list.1': 'Rigenera una nuova chiave API',
    'security.reset.list.2': 'Reimposta la configurazione',
    'security.reset.list.3': 'Pulisce la lista dei file',
    'security.reset.list.4': 'Ripristina le impostazioni di sicurezza ai valori predefiniti',
    'security.reset.list.5': 'Resetta la password admin a: changeme123',
    'security.reset.list.6': 'Cancella tutti i tentativi di login falliti',
    'security.reset.list.7': 'Rimuove tutti i blocchi IP attivi',
    'security.reset.irreversible': 'Questa azione è irreversibile! Dovrai effettuare nuovamente il login.',
    'security.help.attempts': 'Tentativi prima del blocco IP',
    'security.help.block': 'Tempo di blocco dopo tentativi falliti',
    'security.help.session': 'Logout automatico dopo inattività',
    'security.help.requirements': 'Requisiti: min 8 caratteri, maiuscole, minuscole e numeri',
    'security.help.note': '💡 Queste impostazioni si applicano sia al login admin che all\'API endpoint',
    'security.nickname': 'Nickname',
    'security.nickname.description': 'Nome visualizzato nel sistema',
    'security.nickname.not.configured': 'Non configurato',
    'security.email.not.configured': 'Non configurata',
    'security.htaccess.note': 'Dopo il download, rinomina il file in .htaccess e posizionalo nella cartella bugobserve-ai-agents',
    
    // File management
    'files.add': 'Aggiungi riga',
    'files.path': 'Percorso',
    'files.empty': 'Svuota',
    'files.remove': 'Rimuovi',
    'files.expand': 'Espandi',
    'files.date': 'Da data',
    'files.time': 'Ora',
    'files.hide': 'Non mostrare',
    'files.force': 'Forza filtro data',
    'files.delete': 'Cancella dopo la lettura',
    'files.limit': 'Limite caratteri (0 = illimitato)',
    
    // Explorer
    'explorer.fetch': 'Aggiorna struttura',
    'explorer.expand': 'Espandi tutto',
    'explorer.collapse': 'Comprimi tutto',
    'explorer.toggle': 'Mostra/Nascondi Explorer',
    
    // Toast messages
    'toast.saved': 'Configurazione salvata',
    'toast.key': 'Nuova chiave generata',
    'toast.row': 'Riga aggiunta',
    'toast.tree': 'Struttura aggiornata',
    'toast.test': 'Test eseguito',
    'toast.expand': 'Tutti espansi',
    'toast.collapse': 'Tutti compressi',
    'toast.explorer.show': 'Explorer mostrato',
    'toast.explorer.hide': 'Explorer nascosto',
    'toast.empty': 'Log svuotato con successo',
    'toast.copied': 'Copiato negli appunti',
    'toast.copied.short': 'Copiato',
    
    // Banners
    'banner.unsaved': '⚠️ Ricordati di salvare la configurazione',
    'banner.saved': '✅ Configurazione salvata con successo',
    'banner.empty': '✅ File svuotato con successo',
    
    // Notes and descriptions
    'note.usage': 'Come usare:',
    'note.drag': 'Trascina i file dall\'explorer al campo di input nel box "Nomi file di log da esaminare" per aggiungere i file all\'esposizione.',
    'note.extensions': 'Nell\'explorer vengono visualizzati file di log con varie estensioni (.log, .txt, .err, .out, .json, .xml, ecc.) e file di log comuni senza estensione (php_errorlog, access_log, error_log, ecc.).',
    'note.important': 'NOTA BENE:',
    'note.email': 'Obbligatoria per il recupero password',
    
    // Confirmations
    'confirm.empty': 'Sei sicuro di voler svuotare completamente il log:',
    'confirm.logout': 'Sei sicuro di voler uscire?',
    'confirm.reset': '⚠️ ATTENZIONE: Questo resetterà TUTTO inclusa la password admin!\\n\\nLa password tornerà a: changeme123\\n\\nVuoi continuare?',
    
    // Errors
    'error.path': 'Inserisci prima un percorso al file log',
    'error.save': 'Errore nel salvataggio: ',
    'error.connection': 'Errore di connessione: ',
    'error.password.fields': 'Compila tutti i campi',
    'error.password.match': 'Le nuove password non coincidono',
    'error.password.length': 'La password deve essere di almeno 8 caratteri',
    
    // Footer
    'footer.copyright': '2025© - BugObserve for AI Agents v2.0 by',
    
    // Login page
    'login.title': 'BugObserve for AI Agents',
    'login.subtitle': 'Accesso Amministratore',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Accedi',
    'login.button.loading': 'Accesso in corso...',
    'login.error.invalid': 'Credenziali non valide',
    'login.error.connection': 'Errore di connessione. Riprova.',
    'login.warning.attempts': 'Attenzione: {count} tentativi rimanenti prima del blocco'
  },
  
  en: {
    // Header
    'app.title': 'BugObserve for AI Agents',
    'app.subtitle': 'Log endpoint administration v2.0',
    'btn.save': 'Save configuration',
    'btn.save.profile': 'Save your data',
    'btn.theme': 'Light/dark theme',
    'btn.language': 'Change language / Cambia lingua',
    
    // Main sections
    'section.api': 'API Log Configuration',
    'section.security': 'Security and Account',
    'section.files': 'Log file names to examine',
    'section.explorer': 'File Explorer',
    
    // API Configuration
    'api.enabled': 'API enabled',
    'api.key': 'API Key',
    'api.generate': 'Generate new key',
    'api.endpoint': 'Endpoint',
    'api.direct': 'Direct endpoint',
    'api.test': 'Test endpoint',
    'api.reset': 'Complete Reset',
    'api.status': 'System Status',
    'api.drop.hint': 'Drag log files here from the right panel',
    
    // Security
    'security.attempts': 'Max attempts',
    'security.block': 'Block duration (seconds)',
    'security.session': 'Session timeout (minutes)',
    'security.password.current': 'Current password',
    'security.password.new': 'New password',
    'security.password.confirm': 'Confirm password',
    'security.password.change': 'Change Password',
    'security.user': 'User',
    'security.expires': 'Session expires in',
    'security.logout': 'Logout',
    'security.personal': 'Personal Data',
    'security.change.password': 'Change Password',
    'security.session.status': 'Session Status',
    'security.account.info': 'Account Information',
    'security.brute.force': 'Brute Force Protection',
    'security.warning.title': '⚠️ Security',
    'security.warning.text': 'Remember to protect your folder in production environment by inserting a correct .htaccess!',
    'security.warning.description': 'This will prevent unauthorized access to configuration files and logs.',
    'security.download.htaccess': 'Download .htaccess example',
    'security.reset.title': '🔄 Complete Reset',
    'security.reset.warning': '⚠️ WARNING: This operation will:',
    'security.reset.list.1': 'Generate a new API key',
    'security.reset.list.2': 'Reset the configuration',
    'security.reset.list.3': 'Clear the file list',
    'security.reset.list.4': 'Restore security settings to default values',
    'security.reset.list.5': 'Reset admin password to: changeme123',
    'security.reset.list.6': 'Delete all failed login attempts',
    'security.reset.list.7': 'Remove all active IP blocks',
    'security.reset.irreversible': 'This action is irreversible! You will need to login again.',
    'security.help.attempts': 'Attempts before IP blocking',
    'security.help.block': 'Block time after failed attempts',
    'security.help.session': 'Automatic logout after inactivity',
    'security.help.requirements': 'Requirements: min 8 characters, uppercase, lowercase and numbers',
    'security.help.note': '💡 These settings apply to both admin login and API endpoint',
    'security.nickname': 'Nickname',
    'security.nickname.description': 'Display name in the system',
    'security.nickname.not.configured': 'Not configured',
    'security.email.not.configured': 'Not configured',
    'security.htaccess.note': 'After download, rename the file to .htaccess and place it in the bugobserve-ai-agents folder',
    
    // File management
    'files.add': 'Add row',
    'files.path': 'Path',
    'files.empty': 'Empty',
    'files.remove': 'Remove',
    'files.expand': 'Expand',
    'files.date': 'From date',
    'files.time': 'Time',
    'files.hide': 'Don\'t show',
    'files.force': 'Force date filter',
    'files.delete': 'Delete after reading',
    'files.limit': 'Character limit (0 = unlimited)',
    
    // Explorer
    'explorer.fetch': 'Update structure',
    'explorer.expand': 'Expand all',
    'explorer.collapse': 'Collapse all',
    'explorer.toggle': 'Show/Hide Explorer',
    
    // Toast messages
    'toast.saved': 'Configuration saved',
    'toast.key': 'New key generated',
    'toast.row': 'Row added',
    'toast.tree': 'Structure updated',
    'toast.test': 'Test executed',
    'toast.expand': 'All expanded',
    'toast.collapse': 'All collapsed',
    'toast.explorer.show': 'Explorer shown',
    'toast.explorer.hide': 'Explorer hidden',
    'toast.empty': 'Log emptied successfully',
    'toast.copied': 'Copied to clipboard',
    'toast.copied.short': 'Copied',
    
    // Banners
    'banner.unsaved': '⚠️ Remember to save the configuration',
    'banner.saved': '✅ Configuration saved successfully',
    'banner.empty': '✅ File emptied successfully',
    
    // Notes and descriptions
    'note.usage': 'How to use:',
    'note.drag': 'Drag files from the explorer to the input field in the "Log file names to examine" box to add files to the exposure.',
    'note.extensions': 'The explorer displays log files with various extensions (.log, .txt, .err, .out, .json, .xml, etc.) and common log files without extensions (php_errorlog, access_log, error_log, etc.).',
    'note.important': 'NOTE:',
    'note.email': 'Required for password recovery',
    
    // Confirmations
    'confirm.empty': 'Are you sure you want to completely empty the log:',
    'confirm.logout': 'Are you sure you want to logout?',
    'confirm.reset': '⚠️ WARNING: This will reset EVERYTHING including admin password!\\n\\nPassword will return to: changeme123\\n\\nDo you want to continue?',
    
    // Errors
    'error.path': 'Please enter a log file path first',
    'error.save': 'Save error: ',
    'error.connection': 'Connection error: ',
    'error.password.fields': 'Fill all fields',
    'error.password.match': 'New passwords don\'t match',
    'error.password.length': 'Password must be at least 8 characters',
    
    // Footer
    'footer.copyright': '2025© - BugObserve for AI Agents v2.0 by',
    
    // Login page
    'login.title': 'BugObserve for AI Agents',
    'login.subtitle': 'Administrator Access',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Login',
    'login.button.loading': 'Signing in...',
    'login.error.invalid': 'Invalid credentials',
    'login.error.connection': 'Connection error. Please try again.',
    'login.warning.attempts': 'Warning: {count} attempts remaining before blocking'
  }
};

// Translation function
function t(key, params = {}) {
  const currentLang = localStorage.getItem('vsdbg_language') || 'en';
  let text = translations[currentLang]?.[key] || translations['en'][key] || key;
  
  // Replace placeholders with values
  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });
  
  return text;
}

// Apply translations to the page
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
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
  
  // Update title and aria-label attributes
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = t(key);
    element.setAttribute('aria-label', t(key));
  });
}

// Make applyTranslations globally accessible
window.applyTranslations = applyTranslations;

// Toggle language
function toggleLanguage() {
  const currentLang = localStorage.getItem('vsdbg_language') || 'en';
  const newLang = currentLang === 'en' ? 'it' : 'en';
  localStorage.setItem('vsdbg_language', newLang);
  
  // Save current input values before translation
  const savedValues = {};
  
  // Define default/placeholder values to ignore
  const placeholderValues = {
    '#user-nickname': ['SuperAdmin', ''],
    '#user-email': ['admin@example.com', ''],
    '#current-password': [''],
    '#new-password': [''],
    '#confirm-password': ['']
  };
  
  const inputsToPreserve = [
    '#api-key',
    '#user-nickname', 
    '#user-email',
    '#max-attempts',
    '#block-duration',
    '#session-timeout',
    '#current-password',
    '#new-password',
    '#confirm-password'
  ];
  
  inputsToPreserve.forEach(selector => {
    const element = document.querySelector(selector);
    if (element && element.value) {
      // Check if value is a placeholder that should be ignored
      const placeholders = placeholderValues[selector];
      const isPlaceholder = placeholders && placeholders.includes(element.value);
      
      // Only save if it's not a placeholder value or if no placeholders defined for this field
      if (!isPlaceholder) {
        savedValues[selector] = element.value;
      }
    }
  });
  
  // Also save dynamic log file inputs and checkboxes
  document.querySelectorAll('.log-row').forEach((row, index) => {
    const pathInput = row.querySelector('.path');
    const deleteCheck = row.querySelector('.delete-after');
    const hideCheck = row.querySelector('.hide-log');
    const charLimit = row.querySelector('.char-limit');
    
    // Only save path if it has a real value (not empty)
    if (pathInput && pathInput.value && pathInput.value.trim() !== '') {
      savedValues[`.log-row:nth-child(${index + 1}) .path`] = pathInput.value;
    }
    // Always save checkbox states regardless
    if (deleteCheck) {
      savedValues[`.log-row:nth-child(${index + 1}) .delete-after`] = deleteCheck.checked;
    }
    if (hideCheck) {
      savedValues[`.log-row:nth-child(${index + 1}) .hide-log`] = hideCheck.checked;
    }
    // Only save char limit if not empty or zero
    if (charLimit && charLimit.value && charLimit.value !== '0') {
      savedValues[`.log-row:nth-child(${index + 1}) .char-limit`] = charLimit.value;
    }
  });
  
  // Save API enabled checkbox
  const apiEnabled = document.querySelector('#api-enabled');
  if (apiEnabled) {
    savedValues['#api-enabled'] = apiEnabled.checked;
  }
  
  // Save display values for nickname and email
  const adminNickname = document.querySelector('#admin-nickname');
  const adminEmail = document.querySelector('#admin-email');
  if (adminNickname && !adminNickname.classList.contains('not-configured')) {
    savedValues['#admin-nickname-display'] = adminNickname.textContent;
  }
  if (adminEmail && !adminEmail.classList.contains('not-configured')) {
    savedValues['#admin-email-display'] = adminEmail.textContent;
  }
  
  // Update language button
  const langBtn = document.getElementById('btn-language');
  if (langBtn) {
    const flagText = langBtn.querySelector('.flag-text');
    if (flagText) {
      flagText.textContent = newLang === 'it' ? 'IT' : 'EN';
    }
    langBtn.setAttribute('data-lang', newLang);
  }
  
  applyTranslations();
  
  // Restore saved input values
  Object.keys(savedValues).forEach(selector => {
    // Handle special display values
    if (selector === '#admin-nickname-display') {
      const element = document.querySelector('#admin-nickname');
      if (element) {
        element.textContent = savedValues[selector];
        element.classList.remove('not-configured');
      }
      return;
    }
    if (selector === '#admin-email-display') {
      const element = document.querySelector('#admin-email');
      if (element) {
        element.textContent = savedValues[selector];
        element.classList.remove('not-configured');
      }
      return;
    }
    
    const element = document.querySelector(selector);
    if (element) {
      const value = savedValues[selector];
      
      // Handle checkboxes
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        // For readonly inputs, temporarily remove readonly to set value
        const wasReadonly = element.hasAttribute('readonly');
        if (wasReadonly) {
          element.removeAttribute('readonly');
        }
        element.value = value;
        if (wasReadonly) {
          element.setAttribute('readonly', '');
        }
      }
    }
  });
}

// Initialize language system
function initLanguage() {
  const currentLang = localStorage.getItem('vsdbg_language') || 'en';
  
  // Update language button
  const langBtn = document.getElementById('btn-language');
  if (langBtn) {
    const flagText = langBtn.querySelector('.flag-text');
    if (flagText) {
      flagText.textContent = currentLang === 'it' ? 'IT' : 'EN';
    }
    langBtn.setAttribute('data-lang', currentLang);
    langBtn.addEventListener('click', toggleLanguage);
  }
  
  applyTranslations();
}

// Export for global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, applyTranslations, toggleLanguage, initLanguage };
}