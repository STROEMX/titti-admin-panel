# 🔥 TITTI Army — Admin Panel

Internal admin panel for managing TITTI Army users, weekly points, holder tiers, wallet snapshots, backups and leaderboard rankings.  
Offline-first, browser-only. No backend.

---

## 🚀 Features

- 🔒 Admin login (sessionStorage)
- 👥 User management
- 📥 CSV wallet snapshot import (text + file)
- 📦 Full user backup & restore (JSON export / import)
- 🧬 Holder tier detection with multipliers
- 📊 Weekly & lifetime point tracking
- 🏆 Auto-generated leaderboard
- 💾 Persistent client-side storage via localStorage
- 🌐 Optional public read-only mode (?mode=public)
- 🖥 Fully client-side (works in JSFiddle, GitHub Pages, or locally)

---

## 🖥 Usage

### 1. Open the app

You can run the panel in any of the following ways:

- Open index.html locally in a browser  
- Run it from JSFiddle  
- Host it via GitHub Pages  

All data is stored locally in the browser.

---

### 2. Admin login

Admin access is protected by a password defined in app.js:

const ADMIN_PASSWORD = "************";

Authentication is stored in sessionStorage (per browser session).

---

### 3. Data persistence & backup

- All user data is stored in localStorage
- Data is private per browser / device
- Use Export Users to create a JSON backup
- Use Import Users to restore or transfer data to another admin

⚠️ Import overwrites the current user list — export first if you want a backup.

---

### 4. Public mode (read-only)

Append the following query parameter to the URL:

?mode=public

This enables a read-only view with admin actions disabled.

---

## 🧠 Notes

- No backend
- No database
- No accounts
- Offline-first after initial load
- Designed for small trusted admin groups
- JSON is the source-of-truth format for full state transfers

## 🧾 Attribution

Built by **STROEM**  
Owned and operated by **Stroem**
Project website: **https://www.titticoin.com**
