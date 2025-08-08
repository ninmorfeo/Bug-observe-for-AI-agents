# Admin Authentication Setup

## First Time Setup

### Default Credentials
- **Username:** admin
- **Password:** changeme123

⚠️ **IMPORTANT:** Change the default password immediately after first login!

### Changing Admin Password

#### Option 1: Command Line (Recommended)
```bash
php set-admin-password.php YourNewSecurePassword
```

#### Option 2: Delete admin.json and use new default
1. Delete `data/admin.json`
2. Login with default credentials
3. The password will be automatically hashed on first login

## Security Features

### Session Management
- 30 minutes session timeout
- Automatic logout on inactivity
- Session validation on all admin endpoints

### Brute Force Protection
- 5 failed login attempts trigger IP block
- 15 minutes block duration for admin login
- Separate from API brute force settings

### Protected Endpoints
All admin endpoints now require authentication:
- `admin.html` - Admin panel
- `save-config.php` - Save configuration
- `load-config.php` - Load configuration  
- `folders.php` - Browse directories

### Public Endpoints
Only the API endpoint remains public (with API key):
- `index.php?api_key=YOUR_KEY` - Log aggregation API

## Troubleshooting

### Locked Out?
If you're locked out due to failed login attempts:
1. Wait 15 minutes for the block to expire
2. Or delete the file: `data/failed_attempts/[your_ip_hash].json`

### Forgot Password?
Run the password reset script:
```bash
php set-admin-password.php NewPassword123
```

### Session Issues?
Clear your browser cookies and cache, then login again.

## Security Recommendations

1. **Use Strong Password**: At least 12 characters with mixed case, numbers, and symbols
2. **HTTPS Only**: Always use HTTPS in production
3. **IP Whitelisting**: Consider adding IP restrictions in .htaccess
4. **Regular Updates**: Keep PHP and dependencies updated
5. **Monitor Access**: Check failed login attempts regularly in `data/failed_attempts/`