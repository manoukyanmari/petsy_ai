# Petsy Desktop App - Setup & Building Guide

## 📋 Project Structure

```
petsy-app/
├── main.js                 # Electron main process
├── preload.js             # Secure IPC bridge
├── package.json           # Dependencies & build config
├── src/
│   ├── index.html         # Main UI
│   ├── renderer.js        # UI logic & simulation
│   └── styles.css         # Styling
├── assets/                # Icons and resources
└── README-DEV.md          # This file
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 14+ (includes npm)
- **Python 3.9+** (for backend integration)

### Step 1: Install Node.js
Download from: https://nodejs.org/ (LTS version)

### Step 2: Install Dependencies
```bash
cd petsy-app
npm install
```

This installs:
- `electron` - Desktop application framework
- `electron-builder` - Packaging and installer creation
- `python-shell` - Python subprocess communication

### Step 3: Run in Development Mode
```bash
npm start
```

The Petsy window will open. You can now:
- Click START to run the simulation
- Change pet designs
- Adjust difficulty levels
- See real-time statistics

## 🎨 Building the Installer

### Building for Windows

```bash
npm run build:win
```

This creates:
- `dist/Petsy Setup 1.0.0.exe` - Installer file
- Shortcut automatically added to Start Menu
- Taskbar pinning support included

**Installation process:**
1. User runs `.exe` installer
2. Selects installation folder
3. Creates Start Menu shortcut
4. Can pin to taskbar (right-click shortcut → "Pin to taskbar")

### Building for Mac

```bash
npm run build:mac
```

Creates a DMG installer for macOS.

### Building for Linux

Add to package.json scripts and use `electron-builder`:
```bash
npm run build:linux
```

## 📦 Distribution

After building, the installer is in `dist/`:

```
dist/
├── Petsy Setup 1.0.0.exe    ← Windows installer
├── Petsy-1.0.0.dmg          ← Mac installer
└── petsy_1.0.0_amd64.deb    ← Linux installer
```

**Share these files with users!**

## 🔧 Customization Guide

### Changing App Icon

1. Create icon files:
   - `assets/icon.ico` (Windows)
   - `assets/icon.icns` (Mac)
   - `assets/icon.png` (Linux/general)

2. Update `package.json` build section with icon paths

### Modifying App Name

Edit `package.json`:
```json
{
  "name": "petsy",
  "productName": "Petsy"
}
```

### Changing App Version

Edit `package.json`:
```json
{
  "version": "1.0.1"
}
```

### Customizing Installer

Edit `package.json` under `"nsis"`:
```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "shortcutName": "Petsy"
}
```

## 🔗 Backend Integration (Python)

To connect the Python simulator:

1. **Update `main.js`** to spawn Python process:
```javascript
const { spawn } = require('child_process');
const pythonProcess = spawn('python3', ['../desktop-robot-simulator/simulator.py']);
```

2. **IPC Communication** via preload.js (already set up):
   - Renderer sends commands to main process
   - Main process communicates with Python
   - Results sent back to renderer for display

3. **Socket Server** (alternative):
   - Python runs a socket server on `localhost:5000`
   - Electron connects and sends/receives data
   - Decouples processes for better stability

## 📝 Development Tips

### Debugging
```bash
npm start -- --dev
```

Press `Ctrl+Shift+I` to open DevTools for debugging.

### Hot Reload
Make changes to `src/renderer.js` or `src/styles.css` and refresh (F5).

### Console Logs
Check both:
- Main process logs: Terminal where you ran `npm start`
- Renderer logs: Browser DevTools console

## 🚀 Release Checklist

- [ ] Update version in `package.json`
- [ ] Update app icons in `assets/`
- [ ] Test on Windows/Mac/Linux
- [ ] Run `npm run build`
- [ ] Test installer
- [ ] Create GitHub release
- [ ] Upload installer files
- [ ] Update website/documentation

## 📚 Resources

- Electron Docs: https://www.electronjs.org/docs
- Electron Builder: https://www.electron.build/
- Node.js Docs: https://nodejs.org/docs/

## ❓ Troubleshooting

### App won't start
```bash
npm install --force
npm start
```

### Build fails
```bash
rm -rf node_modules
npm install
npm run build:win
```

### Installer too large
- Compress assets
- Use production builds only
- Remove development dependencies

### Port already in use
Change port in `main.js` IPC handlers

## 📞 Support

For issues, check:
1. Node.js version: `node --version`
2. npm version: `npm --version`
3. Electron logs in console
4. Check GitHub issues for similar problems
