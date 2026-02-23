# Required Frameworks and Tools - Status Check

**Project:** Timber Joint Designer (Electron + C++ Engine)  
**Checked on:** 2026-02-23  
**Platform:** Windows

---

## ✅ Installed

### Python
- **Status:** ✅ Installed
- **Version:** 3.13.0
- **Purpose:** May be required by some Node.js native modules during build

### Visual Studio (C++ Build Tools)
- **Status:** ✅ Installed
- **Version:** Visual Studio 18 Professional
- **Location:** `C:\Program Files\Microsoft Visual Studio\18\Professional`
- **Purpose:** MSVC compiler for building C++ engine
- **Note:** Required components should include "Desktop development with C++"

---

## ❌ Not Found in PATH

### Node.js
- **Status:** ❌ Not found in PATH
- **Required Version:** v18+ recommended (for Electron 32.x)
- **Purpose:** JavaScript runtime for Electron app
- **Install from:** https://nodejs.org/
- **Note:** The project has dependencies configured (package.json exists) but Node.js is not accessible

### npm
- **Status:** ❌ Not found in PATH (bundled with Node.js)
- **Required Version:** v9+ recommended
- **Purpose:** Package manager for JavaScript dependencies
- **Note:** Automatically installed with Node.js

### CMake
- **Status:** ❌ Not found in PATH
- **Required Version:** 3.20+ (as specified in engine/CMakeLists.txt)
- **Purpose:** Build system for C++ engine
- **Install from:** https://cmake.org/download/
- **Note:** Essential for building the calculation engine

---

## Installation Priority

### 1. **Node.js** (CRITICAL)
   - Download from: https://nodejs.org/
   - Recommended: LTS version (v20.x or v22.x)
   - After install, restart PowerShell to refresh PATH
   - Verify: `node --version` and `npm --version`

### 2. **CMake** (CRITICAL)
   - Download from: https://cmake.org/download/
   - During installation, select "Add CMake to system PATH"
   - Minimum version: 3.20
   - Verify: `cmake --version`

### 3. **Visual Studio C++ Tools** (Already Installed ✅)
   - Ensure "Desktop development with C++" workload is installed
   - Includes MSVC compiler, Windows SDK, and build tools
   - Open Visual Studio Installer to verify/modify components if needed

---

## Post-Installation Steps

Once all tools are installed:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Configure and build C++ engine
npm run setup:engine

# 3. Start development server
npm run dev
```

---

## Optional Tools

### Git
- **Purpose:** Version control
- **Likely Status:** Installed (project is in a Git repository)
- **Verify:** `git --version`

### PowerShell 7+
- **Purpose:** Modern shell with better cross-platform support
- **Current:** Using Windows PowerShell
- **Upgrade:** Optional, but recommended for better developer experience

---

## Troubleshooting

### Node.js installed but not in PATH
- Add Node.js install directory to system PATH
- Common locations:
  - `C:\Program Files\nodejs`
  - `%APPDATA%\npm` (for global packages)
- Restart PowerShell after PATH changes

### CMake not recognized after install
- Ensure "Add to PATH" was selected during installation
- Manually add CMake bin directory to PATH if needed
- Default location: `C:\Program Files\CMake\bin`

### C++ compiler errors
- Open Visual Studio Installer
- Modify installation → ensure "Desktop development with C++" workload is checked
- Install if missing, then rebuild engine

---

## Verification Commands

After installing missing tools, run:

```powershell
# Check all required tools
node --version        # Should show v18+ 
npm --version         # Should show v9+
cmake --version       # Should show 3.20+
python --version      # Should show 3.x
where.exe cl.exe      # Should find MSVC compiler
```
