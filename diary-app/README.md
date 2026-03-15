# 📔 Dear Diary — Mood Tracker & Notes
> A full-stack MERN application for personal journaling with mood analytics.

---

## ✨ Features

- **CRUD Diary Entries** — Create, read, update, delete journal entries
- **Mood Selection** — Happy 😊 · Sad 😢 · Excited 🤩 · Stressed 😰 · Neutral 😐
- **Mood Analytics Dashboard** with:
  - Total entries count
  - Most common mood
  - Mood distribution pie chart
  - Weekly mood bar chart (stacked)
  - Mood trend line chart (7 / 14 / 30 days)
  - Mood breakdown table with progress bars
- **Search & Filter** — by keyword or mood
- **Responsive UI** — works on desktop and mobile

---

## 🗂 Project Structure

```
diary-app/
├── backend/               # Node.js + Express API
│   ├── models/
│   │   └── Diary.js       # Mongoose schema
│   ├── routes/
│   │   ├── diary.js       # CRUD endpoints
│   │   └── analytics.js   # Aggregation endpoints
│   ├── server.js          # Express entry point
│   ├── .env.example       # Environment template
│   └── package.json
│
└── frontend/              # React app
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Sidebar.js
        │   ├── MoodBadge.js
        │   └── EntryForm.js
        ├── pages/
        │   ├── DashboardPage.js
        │   ├── DiaryPage.js
        │   └── NewEntryPage.js
        ├── hooks/
        │   └── useToast.js
        ├── utils/
        │   ├── api.js          # Real API calls (axios)
        │   ├── mockApi.js      # Mock API (localStorage)
        │   └── constants.js    # Moods, colors, helpers
        ├── styles/
        │   └── global.css
        ├── App.js
        └── index.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd diary-app
```

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diary-notes
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

For **MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string.

---

### 3. Run the App

#### Option A — Two terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev       # uses nodemon for hot reload
# or: npm start   # production mode
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000)

#### Option B — Single command (with concurrently)

Install `concurrently` at the root:
```bash
npm init -y
npm install concurrently
```

Add to root `package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
  }
}
```

Then run:
```bash
npm run dev
```

---

### 4. Switch from Mock API to Real Backend

The frontend ships with a **localStorage mock API** so you can run it without a backend.

To connect to the real Express API, open each page file and change the import:

```js
// BEFORE (mock)
import { getDiaryEntries, ... } from '../utils/mockApi';

// AFTER (real API)
import { getDiaryEntries, ... } from '../utils/api';
```

The function signatures are identical — it's a drop-in swap.

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/diary` | List entries (supports `?mood=`, `?search=`, `?page=`, `?limit=`) |
| GET    | `/api/diary/:id` | Get single entry |
| POST   | `/api/diary` | Create entry |
| PUT    | `/api/diary/:id` | Update entry |
| DELETE | `/api/diary/:id` | Delete entry |
| GET    | `/api/analytics/dashboard` | Full dashboard data |
| GET    | `/api/analytics/mood-trend?days=30` | Mood trend over N days |
| GET    | `/api/health` | Health check |

### Example: Create Entry

```bash
curl -X POST http://localhost:5000/api/diary \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Great day at work",
    "description": "Finished the project on time!",
    "date": "2025-03-14",
    "mood": "Happy"
  }'
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Fonts | Playfair Display + Lato (Google Fonts) |

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/build/

# Serve build with Express (add to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/build')));
```

---

## 🧪 Testing with Postman

Import this base URL into Postman: `http://localhost:5000/api`

Valid mood values: `Happy`, `Sad`, `Excited`, `Stressed`, `Neutral`

---

## 🔮 Possible Extensions

- User authentication (JWT + bcrypt)
- Rich text editor for notes
- Entry tagging / categories
- Export entries as PDF or CSV
- Push notifications / daily reminders
- AI-powered mood insights
