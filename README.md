# 🌬️ Where Winds Meet — Discord Bot  
### Game8 Crawler • Autocomplete • Multi‑Language EN/VN • Replit 1‑Click Template

This is a fully‑featured Discord bot for **Where Winds Meet**, built with:

- 🔍 Automatic Game8 crawler (8 categories)
- ⚡ Instant autocomplete (cached 12h)
- 🌍 Multi‑language toggle (EN / VN)
- 📘 Smart embeds (summary + Show More button)
- 🔄 Auto‑restart on crash
- 🌐 Replit keep‑alive server
- 🚀 1‑Click Import to Replit

---

## 📦 Features

### ✔ Game8 Crawler (Auto‑Discovery)
The bot automatically scans Game8 for:

- Mystic Skills  
- Martial Arts  
- Side Quests  
- Bosses  
- Sects  
- NPCs  
- Inner Ways  
- Walkthrough  

No hardcoded URLs — everything is auto‑detected.

---

## 🎮 Commands

### `/wwm mystic <name>`
Get info about a Mystic Skill.

### `/wwm martial <name>`
Get info about a Martial Art.

### `/wwm inner <name>`
Get info about an Inner Way.

### `/wwm walkthrough <name>`
Get walkthrough steps.

### `/wwm lang <en|vn>`
Switch bot language.

---

## 🌍 Multi‑Language Support

The bot supports:

- **English**
- **Tiếng Việt**

Each user has their own saved language preference.

---

## 🚀 Deploy to Replit (1‑Click)

1. Go to: https://replit.com/import/github  
2. Paste your repo URL  
3. Add Secrets:
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
4. Click **Run**

The bot will start automatically.

---

## 🛠 Tech Stack

- Node.js 20  
- Discord.js v14  
- Cheerio (HTML parser)  
- Express (keep‑alive)  
- Replit Nix environment  

---

## 📂 Project Structure
wwm-discord-bot-template/
├─ server.js
├─ package.json
├─ replit.nix
├─ deploy-commands.js
├─ .env.example
├─ src/
│  ├─ index.js
│  ├─ commands/
│  │  └─ wwm.js
│  ├─ scraper/
│  │  ├─ game8.js
│  │  └─ game8Index.js

---

## ❤️ Credits

Created for the **Where Winds Meet** community.  
Crawler powered by Game8.

