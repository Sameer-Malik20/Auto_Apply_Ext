# 🤖 Auto_Apply_Ext (Apply Workspace) — Autonomous AI Job Application Extension

> **Save your profile once. Detect any job application page. Generate tailored answers with AI. Review & Auto-Fill in seconds.**  
> *100% Local-First. Zero External Server. No Subscription. Bring Your Own Gemini Key.*

[![Chrome Extension](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![AI Powered](https://img.shields.io/badge/Gemini-2.5%20%2F%201.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local--First-green.svg)](#-privacy--security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**Auto_Apply_Ext** is an intelligent, privacy-preserving Google Chrome extension (Manifest V3) that eliminates the repetitive grind of online job applications. It analyzes Job Descriptions (JDs), inspects web forms across major Applicant Tracking Systems (ATS), dynamically synthesizes tailored answers using Google's Gemini models, and auto-fills fields while keeping you in full review control before final submission.

---

## 🚀 Key Features

### 🧠 1. Candidate Profile Intelligence & Neural Memory
* **Resume Learning:** Upload your resume (PDF, DOCX, or paste raw text) — the extension uses Gemini to automatically structure your skills, employment history, education, and contact details.
* **Persistent Local Profile:** Saves candidate baseline information safely inside `chrome.storage.local`.
* **Adaptive Form Memory:** Remembers custom answers you have given to unique employer questions. Lets you view, edit, ignore, or restore remembered answers directly in the profile settings.

### 📝 2. Universal ATS & Dynamic Form Filler
* **Supported ATS Platforms:**
  * ✅ **Greenhouse** (Direct & Embedded forms)
  * ✅ **Lever**
  * ✅ **Ashby HQ**
  * ✅ **LinkedIn Easy Apply** (Session-aware modal handling)
  * ✅ **Workday**
  * ✅ **iCIMS**
  * ✅ **Jobvite**
  * ✅ **Circle / Phenom People**
  * ✅ **Dice**
  * ✅ **Generic Career Portals** (`/careers`, `/jobs`, `/apply`)
* **Dynamic Content Script Injection:** Automatically detects forms, maps complex fields, handles dropdowns/select option fuzzy-matching, and auto-recovers if a page re-renders.

### ⚡ 3. Dual AI Routing (Direct Gemini & VPS Proxy)
* **Direct Google Gemini API:** Uses your personal, free Google AI Studio key (`gemini-2.5-flash`, `gemini-1.5-flash` with dynamic fallback).
* **Built-in VPS Reverse Proxy Mode:** One-click toggle (`⚡ Use VPS Proxy: 161.97.80.178:8081`) to bypass CORS restrictions or regional availability issues seamlessly.
* **Model Auto-Discovery:** Automatically queries `models.list` at runtime to choose the fastest and most capable available model.

### 🤖 4. AI-Powered Writing & Analysis Tools
* **Tailored Answer Synthesis:** Crafts thoughtful responses to custom essay questions (e.g. *"Why do you want to work here?"*, *"Describe a technical challenge you overcame"*) aligned with the specific job description and your background.
* **JD Summarizer & Noise Cleaner:** Condenses multi-page job descriptions into scannable bullets and removes corporate boilerplate/cookie noise.
* **Inline AI Search Tools:** Instant ✨ Summarize and 🧹 Clean buttons on search result cards.

### 🔍 5. Multi-Source Job Search Engine
Search across **16+ job boards** concurrently without leaving the browser extension:
* **Keyless Boards (Always Active):**
  * Remotive (Global remote tech)
  * Arbeitnow (Remote & hybrid)
  * The Muse (Comprehensive US roles)
  * Remote OK (High-volume tech listings)
  * Jobicy (Structured remote roles)
  * Working Nomads (Curated remote)
  * Hacker News *Who's Hiring* (Monthly engineering threads)
  * We Work Remotely
  * remote.co
  * Indeed (RSS feed aggregator)
  * Hackajob (Tech UK/EU jobs via JSON-LD)
* **Session-Based Source:**
  * **LinkedIn Jobs:** Uses your active browser login session via the Voyager API — no developer key needed!
* **Keyed Integrations (BYOK):**
  * Adzuna, USAJOBS (US Federal listings), Reed (UK), Jooble.
* **Custom RSS Feeds:** Add your own state workforce boards or company RSS feeds.
* **Search Filters:** Salary dual-slider (annual/hourly), remote toggle, region filters, and "Hide unknown salary" option.

### 📥 6. Scraped Job Importer
* Quickly import bulk job lists directly from markdown or scraped text into your pipeline tracker with automatic deduplication and contract-type detection.

### 📊 7. Application Pipeline & Analytics
* **Kanban / List Status Tracker:** Track your applications from *Saved*, *Applied*, *Interviewing*, to *Offered* or *Archived*.
* **Response Rate Analytics:** See which job sources deliver the highest callback rate.
* **Salary Correlation:** Analyze which compensation bands yield the best interview conversions.
* **Time-to-First-Response:** Automatically tracks recruiter response time.
* **CSV Import & Export:** Backup, migrate, or export your job search data anytime.

### ✨ 8. AI Interview Preparation
* Generates role-specific behavioral and technical interview questions based on the JD and your resume.
* Provides structured answer scaffolding and lets you save draft interview answers locally.

### 🔒 9. Privacy & Security by Design
* **100% Local-First:** Your resume, API keys, and application history **never leave your device**. No external database or tracker.
* **Consent Gated:** Explicit opt-in required before saving profile data.
* **Sensitive Data Protection:** Demographic fields (race, veteran status, disability) are strictly opt-in and **never** transmitted to LLM prompts.
* **One-Click Data Purge:** Complete control to export or permanently erase all stored data with a single click.

---

## 🛠️ Project Structure

```
Auto_Apply_Ext/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── popup/                     # Extension popup interface
│   ├── popup.html             # Popup layout and tabs
│   ├── popup.css              # Modern dark/light responsive styling
│   ├── popup.js               # Main popup orchestration
│   ├── ai/                    # AI settings, API key, & VPS proxy controls
│   ├── ats/                   # ATS helpers and field matchers
│   ├── forms/                 # Form preview, tailored answers, and memory UI
│   ├── search/                # Multi-source job search UI & filters
│   ├── tracker/               # Pipeline tracker & scraped job importer
│   └── ux/                    # Onboarding, profile, consent, and interview prep
├── content/                   # Content scripts injected into web pages
│   ├── content.js             # Content script entry & runtime listener
│   ├── ats-detector.js        # ATS detection engine (Greenhouse, Lever, Ashby, etc.)
│   ├── form-filler.js         # DOM injection & field auto-population
│   ├── job-processor.js       # JD scraping and text extraction
│   └── utils.js               # Content script helpers
├── background/                # Service workers & background orchestration
│   ├── service-worker.js      # Background worker entry point
│   ├── message-router.js      # Dispatcher for popup & content messages
│   └── modules/handlers/      # Domain handlers (answers, state, jobs, oauth)
├── lib/                       # Core logic libraries
│   ├── gemini.js              # Gemini API client, proxy router & model selector
│   ├── form-filler.js         # Form field resolver & heuristics
│   ├── jd-parser.js           # Job description parser
│   ├── resume-parser.js       # Resume parser & data structurer
│   ├── job-search.js          # Unified search registry across 16+ boards
│   ├── scraped-parser.js      # Parser for scraped job postings
│   ├── tracker.js             # Pipeline storage & analytics engine
│   └── oauth.js               # LinkedIn & Google OIDC profile import
├── data/
│   └── field-map.json         # Normalized field dictionary for ATS inputs
├── tests/                     # Automated test suites (Node.js test runner)
│   ├── gemini-api.test.mjs
│   ├── dynamic-filler.test.mjs
│   ├── scraped-parser.test.mjs
│   └── ... (126 unit tests)
└── icons/                     # Extension icons (16, 32, 48, 128px)
```

---

## 📦 Installation & Setup

### Option 1: Load in Chrome (Quick Start)
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Sameer-Malik20/Auto_Apply_Ext.git
   ```
2. **Open Chrome Extensions:**
   * In Google Chrome, navigate to `chrome://extensions/`
   * Enable **Developer mode** (toggle in the top-right corner).
3. **Load Unpacked:**
   * Click **Load unpacked** in the top-left corner.
   * Select the `Auto_Apply_Ext` folder.
4. **Configure your AI Key:**
   * Click the extension icon in your browser toolbar.
   * Go to **Settings** → Paste your free [Google Gemini API Key](https://aistudio.google.com/app/apikey) (or switch on *⚡ Use VPS Proxy*).
5. **Add Your Resume:**
   * Go to **Profile** → Upload your Resume (PDF/DOCX) or paste text.
6. **Apply in Seconds:**
   * Visit any job application page (Greenhouse, Lever, Ashby, LinkedIn, etc.).
   * Open the extension popup, click **Review Answers**, verify, and hit **Fill Form**!

---

## 🧪 Development & Testing

The extension comes with a full automated test suite containing **126 tests** covering form filling, ATS detection, Gemini integration, and multi-source job search.

```bash
# Install dependencies
npm install

# Run all automated tests (126 tests)
npm run test

# Run code linter
npm run lint

# Build extension distribution package
npm run build
```

---

## 🔒 Privacy & Security

* **Zero Tracking:** No telemetry, tracking pixels, or third-party analytical cookies.
* **Local Storage:** Everything is stored inside Chrome's sandboxed storage (`chrome.storage.local`).
* **Direct Network Calls:** Network requests only occur when you explicitly initiate an AI action (using your own Gemini API key) or search job boards.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

Developed by [Sameer Malik](https://github.com/Sameer-Malik20).
