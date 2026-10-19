# ✦ LazyFlow AI — Let AI Handle the Busywork

> **Do less busywork. Keep your flow.**  
> A lightweight, local-first productivity web app that automates everyday knowledge work—from polishing text and untangling cryptic code to structuring messy notes and planning your day.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Local First](https://img.shields.io/badge/Privacy-100%25%20Local-emerald.svg)](#)
[![Ollama Ready](https://img.shields.io/badge/AI-Ollama%20Compatible-blue.svg)](https://ollama.com/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Vanilla%20JS%20%2F%20HTML%20%2F%20CSS-orange.svg)](#)

---

## 📖 Overview

**LazyFlow AI** is designed to eliminate cognitive friction. Instead of opening multiple bulky tools or pasting private notes into cloud AI services, LazyFlow AI provides clean, focused micro-workflows right in your browser.

It works **100% offline out-of-the-box** using an intelligent demo engine, and seamlessly connects to open-weight models via **Ollama** (`qwen2.5:3b`, `llama3.2:3b`, `deepseek-r1:8b`, `mistral:7b`, etc.) for completely private, on-device intelligence with zero subscription costs.

---

## ✨ Features

- ≋ **Text Summarizer**: Condense long articles, reports, or documentation into concise TL;DRs and actionable takeaways.
- ✍ **Grammar & Tone Fixer**: Eliminate typos, fix awkward phrasing, and elevate tone with a detailed log of improvements.
- ☑ **Notes Organizer**: Transform chaotic brain-dumps and rough jottings into prioritized checklists with clear action flags.
- ✉ **Email Drafter**: Turn bullet ideas into polite, articulate, ready-to-send professional emails.
- 👥 **Meeting Notes Organizer**: Extract executive summaries, key decisions, and action-item ownership matrices from minutes.
- ⟨/⟩ **Code Explainer**: Demystify complex code snippets (JavaScript, Python, SQL, etc.) with plain-English breakdowns and edge-case tips.
- ◷ **Day Planner**: Structure to-dos into realistic focus blocks, Pomodoro intervals, and buffer periods.
- 🦙 **Open-Weight AI Integration**: Connect to any locally running Ollama instance with customizable endpoints and model selection.
- ⚡ **Instant Demo Mode**: Test and explore all workflows immediately without installing or downloading any model.
- 🌙 **Dark & Light Mode**: Fluid, high-contrast theme switching with automatic preference persistence.
- ⏱ **Session History**: Automatically preserves your recent runs in local storage for quick one-click restoration.
- 💾 **Export Options**: Copy directly to clipboard or download formatted outputs as Markdown (`.md`) files.
- 📱 **Fully Responsive**: Sleek glassmorphism design that adapts smoothly across desktop, tablet, and mobile screens.

---

## 🌐 Live Demo

- **Live URL**: `YOUR_DEPLOYED_WEBSITE_URL` *(Add your deployed link here after publishing to GitHub Pages)*
- **GitHub Repository**: `YOUR_GITHUB_REPOSITORY_URL`

---

## 🛠️ Built With

- **HTML5**: Semantic markup with full accessibility standards (`aria-live`, `<dialog>`, semantic headers and sections).
- **CSS3**: Modern custom properties, responsive CSS grid/flexbox, glassmorphism, and dark/light color themes.
- **JavaScript (ES6+)**: Zero-dependency vanilla JavaScript managing DOM state, local storage, typewriter animations, and Ollama HTTP fetch requests.
- **Ollama**: Local REST API integration for open-weight models.
- **Open-Weight Models**: Optimized for `qwen2.5:3b`, `llama3.2:3b`, `deepseek-r1:8b`, and `mistral:7b`.

---

## 🚀 Getting Started

### 1. Clone or Download the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd "LazyFlow AI — Let AI Handle the Busywork"
```

Alternatively, download the ZIP file and extract it to your desired folder.

### 2. Run the Web Application

Because LazyFlow AI connects to local APIs, serve it using a lightweight local web server:

```bash
# Using Python 3:
python3 -m http.server 8000

# Or with Node.js (npx):
npx serve .
```

Open your browser and navigate to:
```
http://localhost:8000
```

> **Note**: You can immediately explore all 7 workflows in **Demo Mode** without installing any AI models!

---

## 🦙 Configure Local AI with Ollama

Connect LazyFlow AI to a locally running Ollama server to unlock real, private model-powered generations with zero latency fees:

### 1. Install Ollama
Download and install Ollama from [https://ollama.com](https://ollama.com/) for macOS, Linux, or Windows.

### 2. Download an Open-Weight Model
Run the following in your terminal to download a fast, lightweight open-weight model:

```bash
ollama pull qwen2.5:3b
```
*(Optional alternatives: `ollama pull llama3.2:3b` or `ollama pull deepseek-r1:8b`)*

### 3. Start Ollama with Browser Access (CORS)
To allow web browsers to send requests to Ollama's local port (`11434`), start Ollama with permitted origins:

**macOS / Linux:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

**Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

### 4. Verify in Settings
1. Click the **⚙ (Settings)** button in the top right corner of LazyFlow AI.
2. Ensure the endpoint is set to `http://localhost:11434` and the model is `qwen2.5:3b`.
3. Click **Test Connection**. Once verified, click **Save Settings**.
4. The status badge will switch from **Demo mode** to **Local AI (qwen2.5:3b)**.

---

## 📁 Project Structure

```
LazyFlow-AI/
├── index.html        # Semantic HTML5 markup, workflow panels, modal dialogs
├── style.css         # Complete design system, dark/light themes, animations
├── script.js         # Workflow configurations, demo engine, history & Ollama API logic
└── README.md         # Documentation, architecture guide, and setup instructions
```

---

## 💡 How I Built It

I built LazyFlow AI using vanilla **HTML, CSS, and JavaScript** to keep the footprint minimal, fast-loading, and completely framework-agnostic. 

- **State & Workflow Registry**: A centralized JavaScript object defines the prompt templates, categories, labels, and pre-packaged sample inputs for every task.
- **Intelligent Demo Engine**: A rule-based parser detects common grammar mistakes, extracts action items from meeting notes, formats email structures, and outlines code logic so users get realistic value before configuring a model.
- **Direct Fetch API**: Asynchronously communicates with Ollama's `/api/generate` and `/api/tags` endpoints with built-in abort timeouts and graceful fallback handling.
- **Local Storage Persistence**: Safely saves active configuration, color theme, and recent session history right in the browser.

---

## 🌍 Why Open Innovation Matters

Open innovation democratizes technology. With open-weight foundation models like Qwen 2.5, Llama 3.2, and DeepSeek, students, developers, and independent creators can build privacy-respecting, production-grade AI tools without being gated behind expensive monthly subscriptions or opaque cloud privacy policies.

LazyFlow AI demonstrates that open technologies and modern vanilla web standards can produce snappy, secure, and beautiful desktop utilities.

---

## 🤖 My Agent Session

AI-assisted pair programming helped accelerate the development lifecycle:
- Brainstorming responsive UI patterns and intuitive micro-workflows.
- Structuring clean CSS variables for seamless dark/light theme switching.
- Building the simulated smart demo engine and regex parsing logic.
- Hardening CORS error diagnostics and timeout management for Ollama integration.

---

## 🏆 Hacktoberfest Submission

- **Event**: Hacktoberfest Open-Source AI Challenge
- **Category**: Week 3 — *Slow and Steady*
- **What I Built**: A local-first productivity studio that automates everyday busywork (summaries, grammar fixes, note extraction, code explanations, meeting notes, emails, and daily planning) using open-weight AI models.
- **Why It Fits**: Promotes local, accessible open-source AI experimentation with zero vendor lock-in and 100% data privacy.

---

## 🔮 Future Improvements

- [ ] Support for direct streaming tokens (`stream: true`) via Server-Sent Events (SSE).
- [ ] Add custom user-defined workflow templates and prompt engineering editor.
- [ ] Voice-to-text input using the Web Speech API or local Whisper models.
- [ ] PDF and document upload parsing for instant summarization.
- [ ] Keyboard shortcuts (`Cmd/Ctrl + Enter` to run, `Esc` to close modals).

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewWorkflow`).
3. Commit your changes (`git commit -m 'Add new workflow'`).
4. Push to the branch (`git push origin feature/NewWorkflow`).
5. Open a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  <b>LazyFlow AI</b> — <i>Spend less time on busywork and more time on what matters.</i>
</p>
