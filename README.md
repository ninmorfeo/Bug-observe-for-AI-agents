# BugObserve for AI Agents 🤖

![Version](https://img.shields.io/badge/Version-2.0.1-blue.svg)
![Requires PHP](https://img.shields.io/badge/Requires%20PHP-7.0%2B-purple.svg)
![Tested up to PHP](https://img.shields.io/badge/Tested%20up%20to%20PHP-8.2-green.svg)
![License](https://img.shields.io/badge/license-MIT-red.svg)

## 🔐 Default Login Credentials

```
URL: http://your-domain/bugobserve-ai-agents/admin.html
Username: admin
Password: changeme123
```

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## 📸 Screenshots

### Admin Interface
![Admin Interface](./docs/images/admin-interface.png)
*Main admin panel with log file management and API configuration*

### Security Settings
![Security Settings](./docs/images/settings-panel.png)
*Comprehensive security configuration panel*

### File Explorer
![File Explorer](./docs/images/file-explorer.png)
*Interactive file tree with drag-and-drop functionality*

### API Response Example
![API Response](./docs/images/api-response.png)
*Clean JSON output structure (v2.0.1+)*

**Offrimi un caffè ☕**  
<a href="https://www.paypal.com/donate/?business=eyeart.agency@gmail.com&no_recurring=0&currency_code=EUR&item_name=Support+BugObserve+for+AI+Agents+Development">
  <img src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png" alt="Donate with PayPal" width="200">
</a>

## Version 2.0.1 - Enhanced Edition

A powerful debugging and log monitoring tool designed specifically for AI agents and automated development workflows. This latest version includes significant improvements to user experience, security, and functionality.

## 🎯 Purpose

BugObserve for AI Agents is designed to streamline the debugging process for AI-assisted development by providing:
- Real-time log file monitoring across multiple sources
- Intelligent log aggregation and filtering
- Clean API endpoints for programmatic access
- Visual file explorer with drag-and-drop functionality

## ✨ Key Features

### 📊 Multi-Log Management
- Monitor multiple log files simultaneously
- Drag-and-drop interface for easy log file selection
- Automatic log rotation support
- Delete-after-read option for temporary logs
- Character limit per log file for large files

### 🔍 Advanced Filtering
- Date and time-based filtering
- Hide specific logs from output
- Force date filtering for precision control
- Real-time log updates

### 🌳 Visual File Explorer
- Interactive folder tree navigation
- Drag-and-drop file selection
- Expandable/collapsible directory structure
- Quick file path copying

### 🔐 Enterprise Security Features (NEW v2.0)
- **Admin Authentication**: Secure login system with session management
- **Password Management**: In-panel password change with strength indicator
- **Brute Force Protection**: Configurable IP blocking after failed attempts
- **Rate Limiting**: 60 requests/minute per IP to prevent abuse
- **CSRF Protection**: Token-based form submission security
- **Session Timeout**: Configurable auto-logout after inactivity
- **API Key Hashing**: Bcrypt encryption for stored credentials
- **Path Traversal Prevention**: Secure file access validation

### 🔑 Secure API Access
- Generate unique API keys with one click
- Enable/disable API access on demand
- Direct endpoint URLs for quick testing
- Pretty-print JSON output option
- Unified security settings for API and admin
- Log file clearing functionality with admin authentication

### 🧹 Log Management Tools
- **Empty Log Files**: Clear individual log files with one click
- **Session-based Authentication**: Admin operations use secure session auth
- **Visual Feedback**: Success banners and toast notifications
- **Safety Confirmations**: Prevent accidental data loss

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design
- Smooth animations and transitions
- Intuitive drag-and-drop row reordering
- Visual feedback for all interactions
- Improved notification system with banners and toasts
- Clean API output with simplified JSON structure

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/ninmorfeo/Bug-observe-for-AI-agents.git
```

2. Place the folder in your web server directory

3. Navigate to `login.html` in your browser

4. Login with default credentials (admin/changeme123)

5. **IMMEDIATELY change the default password** for security

6. Configure your log files and API settings in the admin panel

## 📝 Configuration

### Basic Setup
1. **Enable API**: Toggle the API switch to activate endpoint access
2. **Generate API Key**: Click "Generate New API Key" for secure access
3. **Add Log Files**: Drag files from the explorer or manually add paths
4. **Save Configuration**: Click "Save configuration" to persist settings

### API Endpoints

Once configured, access your logs via:
```
http://your-domain/bugobserve-ai-agents/index.php?api_key=YOUR_KEY
```

For formatted output:
```
http://your-domain/bugobserve-ai-agents/index.php?api_key=YOUR_KEY&pretty=1
```

⚠️ **Security Note**: The API endpoint returns simplified JSON structure (v2.0.1+) with only essential fields: `path`, `size`, `content_log`, and `truncated` (when applicable).

## 🔧 Advanced Options

### Per-File Settings
- **From Date/Time**: Filter logs from specific timestamp
- **Hide Log**: Exclude from aggregated output
- **Force Date Filter**: Strictly enforce date filtering
- **Delete After Read**: Automatically remove log after reading
- **Character Limit**: Limit output to last N characters for large files
- **Empty Log**: Clear log file contents with admin authentication

### Bulk Operations
- **Expand/Collapse All**: Quick tree navigation
- **Test Endpoint**: Preview API output directly in admin panel
- **Reset Completo**: Returns ALL settings to defaults (including admin password!)

## 🔒 Security Configuration

### Default Admin Credentials
- **Username**: admin
- **Password**: changeme123
- ⚠️ **IMPORTANT**: Change password immediately after first login!

### Security Settings (Configurable from Admin Panel)
- **Max Login Attempts**: 3-100 (default: 10)
- **IP Block Duration**: 60-86400 seconds (default: 300)
- **Session Timeout**: 5-1440 minutes (default: 30)

### Password Reset Options

1. **From Admin Panel**: Use the password change form in "Sicurezza e Account" section
2. **From Command Line**: 
```bash
php set-admin-password.php YourNewSecurePassword
```
3. **Factory Reset**: Click "Reset Completo" button (returns password to `changeme123`)

### Protected Endpoints (Require Admin Session)
- `admin.html` - Admin interface
- `save-config.php` - Configuration saving
- `load-config.php` - Configuration loading
- `folders.php` - File explorer
- `empty-log.php` - Log file clearing
- `test-endpoint.php` - API testing
- `change-password.php` - Password management
- `reset-admin.php` - Admin reset

### Public Endpoints
- `index.php?api_key=YOUR_KEY` - Main API access (requires valid API key)
- `login.html` - Login page
- `auth.php` - Authentication handler

## 🛠️ Technical Details

### Requirements
- PHP 7.0 or higher (PHP 8.x recommended)
- Web server (Apache, Nginx, etc.)
- Modern browser with JavaScript enabled
- HTTPS recommended for production use
- Write permissions for `data/` directory

### File Structure
```
bugobserve-ai-agents/
├── admin.html              # Admin interface
├── login.html              # Login page
├── app.js                  # Core application logic
├── style.css               # Styling and themes
├── index.php               # Public API endpoint
├── test-endpoint.php       # Admin test endpoint
├── auth.php                # Authentication handler
├── change-password.php     # Password management
├── empty-log.php           # Log file clearing
├── folders.php             # File explorer backend
├── load-config.php         # Configuration loader
├── save-config.php         # Configuration saver
├── reset-admin.php         # Admin password reset
├── set-admin-password.php  # CLI password tool
├── csrf-token.php          # CSRF token generator
├── htaccess-example.txt    # Apache security example
├── package.json            # Node.js dependencies (optional)
├── ADMIN_SETUP.md          # Admin setup guide
├── docs/
│   ├── README.md           # Documentation guidelines
│   └── images/             # Screenshots and visual docs
├── includes/
│   ├── session-check.php         # Session validation
│   ├── rate-limiter.php          # Rate limiting
│   └── brute-force-protection.php # IP blocking
└── data/
    ├── config.json           # Main configuration
    ├── admin.json            # Admin credentials
    └── failed_attempts/      # Brute force tracking
```

## 🤝 AI Agent Integration

This tool is optimized for use with AI coding assistants like:
- Claude (Anthropic)
- GPT-4 (OpenAI)
- GitHub Copilot
- Cursor
- Other AI development tools

### Integration Example
```javascript
// Fetch logs from your AI agent
const response = await fetch('http://your-domain/bugobserve-ai-agents/index.php?api_key=YOUR_KEY');
const logs = await response.json();

// Process simplified log structure (v2.0.1+)
logs.forEach(entry => {
    console.log(`File: ${entry.path}`);
    console.log(`Size: ${entry.size} bytes`);
    if (entry.truncated) console.log('(Content was truncated)');
    console.log(`Content:\n${entry.content_log}`);
});
```

## 📈 Version History

### v2.0.1 (Current)
**✨ New Features:**
- Empty log file functionality with admin authentication
- Enhanced notification system with success banners
- Simplified API output with clean JSON structure
- Test endpoint with session-based authentication
- Improved form styling for all input types

**🐛 Bug Fixes:**
- Fixed API key masking issues with test functionality
- Resolved notification glitches during save operations
- Corrected file path normalization for log operations
- Fixed browser caching issues with configuration updates
- Improved change detection for unsaved modifications

**🔧 Improvements:**
- Better error handling and user feedback
- Enhanced security with session-based admin operations
- Cleaner API responses without debug information
- Improved CSS consistency across form elements
- Better path handling for cross-platform compatibility

### v2.0
- Complete standalone rewrite
- Modern UI with theme support
- Enhanced drag-and-drop functionality
- Improved API security
- Better performance and reliability

### v1.0
- Initial WordPress plugin version
- Basic log monitoring
- Simple API endpoints

## 🔒 Security

### Data Security
- **API keys**: Stored as bcrypt hashes in `config.json`
- **Admin credentials**: Encrypted in `admin.json`
- **No external dependencies**: All data stays on your server
- **Local storage only**: No tracking or external connections

### Protection Features
- **Brute force protection**: Configurable IP blocking
- **Rate limiting**: Prevents API abuse
- **Session management**: Secure admin authentication
- **Path traversal prevention**: Secure file access validation
- **Input sanitization**: All inputs validated and escaped
- **CSRF protection**: Token-based form security (optional)

## 🐛 Bug Reports & Features

Found a bug or have a feature request? Please open an issue on GitHub:
https://github.com/ninmorfeo/Bug-observe-for-AI-agents/issues

## 📄 License

This project is open-source and available under the MIT License.

## 👨‍💻 Author

**ninmorfeo**
- GitHub: [@ninmorfeo](https://github.com/ninmorfeo)

## 🙏 Acknowledgments

Special thanks to the AI development community for feedback and suggestions that shaped this tool.

---

**Note**: This is a standalone version. For WordPress integration, see [Debug-VScode-Wordpress-for-AI](https://github.com/ninmorfeo/Debug-VScode-Wordpress-for-AI)