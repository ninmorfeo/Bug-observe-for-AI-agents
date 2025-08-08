# BugObserve for AI Agents 🤖

![Version](https://img.shields.io/badge/Version-2.0-blue.svg)
![Requires PHP](https://img.shields.io/badge/Requires%20PHP-7.0%2B-purple.svg)
![Tested up to PHP](https://img.shields.io/badge/Tested%20up%20to%20PHP-8.2-green.svg)
![License](https://img.shields.io/badge/license-MIT-red.svg)

**Offrimi un caffè ☕**  
<a href="https://www.paypal.com/donate/?business=eyeart.agency@gmail.com&no_recurring=0&currency_code=EUR&item_name=Support+BugObserve+for+AI+Agents+Development">
  <img src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png" alt="Donate with PayPal" width="200">
</a>

## Version 2.0 - Standalone Edition

A powerful debugging and log monitoring tool designed specifically for AI agents and automated development workflows. This standalone version provides a clean, intuitive interface for managing and monitoring multiple log files in real-time.

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

### 🔑 Secure API Access
- Generate unique API keys
- Enable/disable API access on demand
- Direct endpoint URLs for quick testing
- Pretty-print JSON output option

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design
- Smooth animations and transitions
- Intuitive drag-and-drop row reordering
- Visual feedback for all interactions

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/ninmorfeo/Bug-observe-for-AI-agents.git
```

2. Place the folder in your web server directory

3. Navigate to `admin.html` in your browser

4. Configure your log files and API settings

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

## 🔧 Advanced Options

### Per-File Settings
- **From Date/Time**: Filter logs from specific timestamp
- **Hide Log**: Exclude from aggregated output
- **Force Date Filter**: Strictly enforce date filtering
- **Delete After Read**: Automatically remove log after reading

### Bulk Operations
- **Expand/Collapse All**: Quick tree navigation
- **Reset**: Return all settings to defaults
- **Test Endpoint**: Preview API output directly

## 🛠️ Technical Details

### Requirements
- PHP 7.0 or higher
- Web server (Apache, Nginx, etc.)
- Modern browser with JavaScript enabled

### File Structure
```
bugobserve-ai-agents/
├── admin.html          # Admin interface
├── app.js             # Core application logic
├── style.css          # Styling and themes
├── index.php          # API endpoint
├── folders.php        # File explorer backend
├── load-config.php    # Configuration loader
├── save-config.php    # Configuration saver
└── data/
    └── config.json    # Stored configuration
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

// Process logs in your AI workflow
logs.forEach(entry => {
    console.log(`[${entry.timestamp}] ${entry.message}`);
});
```

## 📈 Version History

### v2.0 (Current)
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

- API keys are stored locally in `config.json`
- No external dependencies or tracking
- Secure file access controls
- Input sanitization and validation

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