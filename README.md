# 🔥 TITTI Army — Admin Panel

Internal admin panel for managing TITTI Army users, weekly points,
holder tiers, CSV wallet snapshots and leaderboard rankings.

---

## 🚀 Features

- 🔒 Admin login (sessionStorage)
- 👥 User management
- 📥 CSV wallet snapshot import (text + file)
- 🧬 Holder tier detection w/ multipliers
- 📊 Weekly & lifetime point tracking
- 🏆 Auto-generated leaderboard
- 💾 Persistent storage via localStorage
- 🌐 Public read-only mode (`?mode=public`)

---

## 🖥 Usage

### 1. Open locally
Just open `index.html` in a browser.

### 2. Admin login
Password is defined in `app.js`:

```js
const ADMIN_PASSWORD = "TITTIARMY2025";
