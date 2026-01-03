console.log("JS LOADED");

// ================= AUTH =================
let IS_AUTHENTICATED = sessionStorage.getItem("titti_auth") === "true";
const MODE = new URLSearchParams(window.location.search).get("mode");
const IS_PUBLIC = MODE === "public";

function requireAuth(){
  if (IS_PUBLIC) { alert("Public mode — read only"); return false; }
  if (!IS_AUTHENTICATED) { alert("🔒 Admin access required"); return false; }
  return true;
}

// ================= LOGIN / LOGOUT =================
const ADMIN_PASSWORD = "TITTIARMY2025";

function checkPassword(){
  const input = document.getElementById("passwordInput").value;
  const error = document.getElementById("loginError");

  if (input.trim() === ADMIN_PASSWORD){
    IS_AUTHENTICATED = true;
    sessionStorage.setItem("titti_auth", "true");
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    render();
  } else {
    error.textContent = "❌ Incorrect password";
  }
}

function logout(){
  sessionStorage.removeItem("titti_auth");
  IS_AUTHENTICATED = false;
  location.reload();
}

// ================= DOM BINDS =================
let newRole, newName, newTG, newWallet, csvInput;
let leaderboardEl, userTableBody;

// ================= STORAGE =================
let users = [];
try {
  const raw = localStorage.getItem("titti_users");
  if (raw) users = JSON.parse(raw);
} catch { users = []; }

if (!Array.isArray(users)) users = [];

function saveStorage(){
  localStorage.setItem("titti_users", JSON.stringify(users));
}

// ================= HOLDER TIERS =================
const HOLDER_TIERS = [
  { min: 5000000, mult: 1.80, label: "🔥 5M+" },
  { min: 2500000, mult: 1.50, label: "🔮 2.5M+" },
  { min: 1000000, mult: 1.30, label: "👑 1M+" },
  { min: 500000,  mult: 1.20, label: "🌕 500K+" },
  { min: 350000,  mult: 1.15, label: "💛 350K+" },
  { min: 250000,  mult: 1.10, label: "🛡 250K+" },
  { min: 100000,  mult: 1.00, label: "🎂 100K+" },
  { min: 75000,   mult: 0.75, label: "🍞 75K+" },
  { min: 50000,   mult: 0.55, label: "🔥 50K+" },
  { min: 10000,   mult: 0.40, label: "🍪 10K+" },
  { min: 0,       mult: 0.25, label: "🥚 <10K" }
];

function applyHolderTier(user, balance){
  const tier = HOLDER_TIERS.find(t => balance >= t.min);
  user.tier = tier.label;
  user.mult = tier.mult;
}

// ================= BADGE =================
function badge(type, text){
  return `<span class="badge badge-${type}">${text}</span>`;
}

// ================= CSV SANITIZER =================
function sanitizeCSV(raw){
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return "wallet,balance";

  const out = ["wallet,balance"];

  for (let i = 1; i < lines.length; i++){
    const match = lines[i].match(/^"?([^",]+)"?,\s*"?([\d,]+(\.\d+)?)"?/);
    if (!match) continue;

    const wallet = match[1].toLowerCase().trim();
    const balance = Math.floor(Number(match[2].replace(/,/g, "")));

    if (!wallet || isNaN(balance)) continue;
    out.push(`${wallet},${balance}`);
  }

  return out.join("\n");
}

// ================= CSV APPLY =================
function applyCSV(){
  if (!requireAuth()) return;

  const raw = csvInput.value;
  if (!raw.trim()) return alert("CSV empty");

  const lines = raw.replace(/\r/g,"").split("\n").map(l=>l.trim()).filter(Boolean);
  const snapshot = {};
  const start = lines[0].toLowerCase().includes("wallet") ? 1 : 0;

  for (let i=start;i<lines.length;i++){
    const [wallet,balance] = lines[i].split(",");
    if(!wallet||balance==null) continue;
    snapshot[wallet.toLowerCase().trim()] = Number(balance);
  }

  users.forEach(u=>{
    if(!u.wallet){
      u.tier="-"; u.mult=0; return;
    }
    applyHolderTier(u, snapshot[u.wallet] ?? 0);
  });

  saveStorage();
  render();
}

function applyCSVFile(){
  if (!requireAuth()) return;

  const file = document.getElementById("csvFileInput").files[0];
  if (!file) return alert("No file selected");

  const reader = new FileReader();
  reader.onload = e=>{
    csvInput.value = sanitizeCSV(e.target.result);
    requestAnimationFrame(applyCSV);
  };
  reader.readAsText(file);
}

// ================= USERS =================
function addUser(){
  if (!requireAuth()) return;

  const role = newRole.value.trim();
  const name = newName.value.trim();
  const tg = newTG.value.trim();
  const wallet = newWallet.value.trim().toLowerCase();

  if (!name) return alert("Name required");
  if (wallet && users.some(u=>u.wallet===wallet))
    return alert("Duplicate wallet");

  users.push({
    role,name,tg,wallet,
    weeklyInput:0,
    weeklySaved:0,
    total:0,
    tier:"-",
    mult:0
  });

  newRole.value=newName.value=newTG.value=newWallet.value="";
  saveStorage();
  render();
}

// ================= WEEK =================
function saveWeek(){
  if (!requireAuth()) return;
  users.forEach(u=>{
    u.weeklySaved += u.weeklyInput;
    u.total += u.weeklyInput;
    u.weeklyInput = 0;
  });
  saveStorage();
  render();
}

function resetWeekly(){
  if (!requireAuth()) return;
  if (!confirm("⚠️ Reset ALL weekly values?")) return;

  users.forEach(u=>{
    u.weeklyInput = 0;
    u.weeklySaved = 0;
  });
  saveStorage();
  render();
}

function clearAll(){
  if (!requireAuth()) return;
  if (!confirm("🧨 DELETE ALL DATA?")) return;

  users = [];
  saveStorage();
  render();
}

// ================= EXPORT / IMPORT =================
function exportUsers(){
  if (!requireAuth()) return;

  const data = JSON.stringify(users, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "titti-users-export.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importUsersFile(){
  if (!requireAuth()) return;

  const file = document.getElementById("usersImportInput").files[0];
  if (!file) return alert("No file selected");

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        return alert("Invalid file format");
      }
      users = imported;
      saveStorage();
      render();
    } catch {
      alert("Failed to import file");
    }
  };

  reader.readAsText(file);
}

// ================= RANK =================
function rank(p){
  if(p>=300) return "👑👵 ROYAL OVEN ELITE";
  if(p>=200) return "👵🔥 GRANDMA’S CHOSEN";
  if(p>=120) return "⚡🍪 COOKIE COMMANDER";
  if(p>=80)  return "🛡 SLIPPER GUARDIAN";
  if(p>=50)  return "👑 MEME KNIGHT";
  if(p>=30)  return "🔥 HEAT BRINGER";
  if(p>=20)  return "🫓 OVEN RAIDER";
  if(p>=10)  return "🍪 DOUGH ROLLER";
  return "🥄 COOKIE SCOUT";
}

// ================= LEADERBOARD =================
function leaderboard(){
  if (!leaderboardEl) return;

  const sorted = [...users].filter(u=>u.total>0).sort((a,b)=>b.total-a.total);
  const groups = {};

  sorted.forEach(u=>{
    const r = rank(u.total);
    if(!groups[r]) groups[r]=[];
    groups[r].push(u);
  });

  let out = "🔥 TITTI ARMY — LEADERBOARD\n\n";
  Object.keys(groups).forEach(r=>{
    out += `${r}\n`;
    groups[r].forEach(u=>{
      if(u.tg) out += `${u.tg} — ${u.total}\n`;
    });
    out += "\n";
  });

  leaderboardEl.textContent = out.trim();
}

// ================= 🔒 SAFETY HOOK =================
function forceLeaderboardRefresh(){
  if (!leaderboardEl) return;
  leaderboard();
}

// ================= RENDER =================
function render(){
  if (!userTableBody) return;
  userTableBody.innerHTML = "";

  users.sort((a,b)=>b.total-a.total);

  users.forEach((u,i)=>{
    const walletCell = `<input
      placeholder="⚠ Wallet missing"
      value="${u.wallet || ""}"
      onchange="users[${i}].wallet=this.value.toLowerCase();saveStorage();render()"
    >`;

    const payout = u.wallet
      ? badge("gold", `💰 $${(u.weeklySaved * u.mult).toFixed(2)}`)
      : badge("pending","⏳ Payment pending");

    userTableBody.innerHTML += `
<tr>
  <td><input value="${u.role}" onchange="users[${i}].role=this.value;saveStorage()"></td>
  <td><input value="${u.name}" onchange="users[${i}].name=this.value;saveStorage()"></td>
  <td><input value="${u.tg}" onchange="users[${i}].tg=this.value;saveStorage()"></td>
  <td>${walletCell}</td>
  <td><input type="number" value="${u.weeklyInput}"
    onchange="users[${i}].weeklyInput=+this.value;saveStorage();render()"></td>
  <td>${u.weeklySaved}</td>
  <td>${u.total}</td>
  <td>${rank(u.total)}</td>
  <td>${u.tier}</td>
  <td>${u.mult.toFixed(2)}</td>
  <td>${payout}</td>
  <td><button onclick="removeUser(${i})">❌</button></td>
</tr>`;
  });

  leaderboard();
}

// ================= EXPOSE =================
window.checkPassword = checkPassword;
window.logout = logout;
window.addUser = addUser;
window.saveWeek = saveWeek;
window.resetWeekly = resetWeekly;
window.clearAll = clearAll;
window.exportUsers = exportUsers;
window.importUsersFile = importUsersFile;
window.applyCSV = applyCSV;
window.applyCSVFile = applyCSVFile;
window.removeUser = i=>{
  users.splice(i,1);
  saveStorage();
  render();
};

// ================= BOOT =================
document.addEventListener("DOMContentLoaded",()=>{
  newRole=document.getElementById("newRole");
  newName=document.getElementById("newName");
  newTG=document.getElementById("newTG");
  newWallet=document.getElementById("newWallet");
  csvInput=document.getElementById("csvInput");
  leaderboardEl=document.getElementById("leaderboard");
  userTableBody=document.querySelector("#userTable tbody");

  if (IS_AUTHENTICATED && !IS_PUBLIC){
    document.getElementById("loginBox").style.display="none";
    document.getElementById("adminPanel").style.display="block";
    render();
  }

  // ✅ exakt återställning av gammalt leaderboard-beteende
  forceLeaderboardRefresh();
});
