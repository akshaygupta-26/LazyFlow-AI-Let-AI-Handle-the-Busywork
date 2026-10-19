/**
 * LazyFlow AI — Application Logic & Workflows
 * Features:
 * - 7 AI Workflows (Summarize, Grammar Fixer, Notes Organizer, Email Draft, Meeting Notes, Code Explainer, Daily Planner)
 * - Intelligent Demo Mode Fallback Engine
 * - Ollama HTTP API Integration with Custom Models
 * - History Persistence & Markdown Export
 * - Dark / Light Theme Management
 */

// 1. Task Definitions with Prompts, Category & Sample Inputs
const tasks = {
    summarize: {
        id: "summarize",
        category: "writing",
        title: "Summarize text",
        label: "What should I summarize?",
        placeholder: "Paste an article, report, or long document here...",
        sample: "Artificial intelligence has transitioned rapidly from narrow classification models to large-scale generative foundation models capable of reasoning, creative synthesis, and multi-step workflow execution. In knowledge work, this shift promises significant productivity gains by eliminating repetitive administrative tasks. However, realizing these benefits requires addressing pressing challenges around data privacy, governance, latency, and the need for reliable local execution.",
        prompt: "Summarize this text in simple, crisp language. Highlight the core takeaway and 3-4 bullet key points.",
        badgeColor: "purple"
    },
    grammar: {
        id: "grammar",
        category: "writing",
        title: "Fix grammar & tone",
        label: "What text would you like to polish?",
        placeholder: "Paste text with grammatical errors, typos, or rough phrasing...",
        sample: "me and my team has been working on this project since 3 month. its really hard because we dont have enough time and resources but we tries our best to deliver good results to our client by friday hopefully.",
        prompt: "Fix all grammatical errors, spelling mistakes, and awkward phrasing. Make the tone professional and natural while preserving the author's original meaning and intent. Provide: 1) Corrected version, 2) Key improvements made.",
        badgeColor: "teal"
    },
    todos: {
        id: "todos",
        category: "productivity",
        title: "Organize notes",
        label: "What messy notes should I convert?",
        placeholder: "Paste quick jottings, random thoughts, or rough bullet points...",
        sample: "need to call Sarah about quarterly budget, also finish slide deck for investor pitch, buy oat milk, email Dave the revised contract, schedule doctor checkup for next wednesday 10am, inspect database latency spike",
        prompt: "Turn these raw notes into a well-categorized, actionable checklist. Group by priority (High, Medium, Low) and context without inventing fake information.",
        badgeColor: "green"
    },
    email: {
        id: "email",
        category: "writing",
        title: "Draft an email",
        label: "What should this email convey?",
        placeholder: "E.g., Follow up with Alex about the project timeline delay and ask for a quick sync tomorrow at 3 PM...",
        sample: "Follow up with client Mark on the proposal sent last Tuesday. Ask if they had time to review, offer to answer questions, and propose a 15-minute alignment call on Thursday afternoon.",
        prompt: "Write a polite, professional, and concise email using the details provided. Include a clear subject line and call to action. Use placeholders like [Name] for any missing info.",
        badgeColor: "orange"
    },
    meeting: {
        id: "meeting",
        category: "productivity",
        title: "Meeting notes organizer",
        label: "Paste raw meeting minutes or transcript",
        placeholder: "Paste meeting discussion, attendee notes, or rough minutes...",
        sample: "Product Sync (Oct 20). Attendees: Sarah, Alex, Jason, Elena.\n- Discussed Q4 release date. Agreed to target Nov 15 for beta.\n- Jason flagged API response latency in EU cluster. Action: Jason to run database profiling by Wednesday.\n- Elena showed new user onboarding flow. Team approved changes.\n- Open question: Should we support dark mode at launch? Decision: Deferred to v1.1.\nNext check-in scheduled for Friday 10 AM.",
        prompt: "Organize these meeting notes into: 1) Executive Summary, 2) Key Decisions Made, 3) Action Items (table/list with Owner and Deadline if present), 4) Open Questions & Next Steps.",
        badgeColor: "indigo"
    },
    code: {
        id: "code",
        category: "dev",
        title: "Explain code",
        label: "Paste code snippet to analyze",
        placeholder: "Paste code in Python, JavaScript, TypeScript, SQL, Rust, Go, etc...",
        sample: "function debounce(fn, delay) {\n    let timer = null;\n    return function(...args) {\n        clearTimeout(timer);\n        timer = setTimeout(() => {\n            fn.apply(this, args);\n        }, delay);\n    };\n}",
        prompt: "Explain this code clearly for developers. Include: 1) What it does in simple terms, 2) Step-by-step breakdown of how it works, 3) Time/space complexity or performance notes, 4) Potential edge cases or tips.",
        badgeColor: "cyan"
    },
    plan: {
        id: "plan",
        category: "productivity",
        title: "Plan my day",
        label: "What do you need to accomplish today?",
        placeholder: "List your tasks, appointments, and energy levels...",
        sample: "Write quarterly review report (takes ~2h, needs deep focus), team standup at 10:00 AM (30 min), reply to urgent client emails (45 min), review pull request from James (30 min), gym workout (1 hr). Want to finish by 6 PM.",
        prompt: "Create an optimal, realistic daily schedule with time blocks, Pomodoro focus periods, and buffers. Keep it balanced and achievable.",
        badgeColor: "blue"
    }
};

// Helper DOM selector
const $ = id => document.getElementById(id);

// Application State
let activeTask = "summarize";
let lastResult = "";
let historyData = [];

let config = {
    endpoint: "http://localhost:11434",
    model: "qwen2.5:3b"
};

// Initialize Settings & Local Storage
try {
    const savedConfig = JSON.parse(localStorage.getItem("lazyflow-config") || "{}");
    config = { ...config, ...savedConfig };

    const savedHistory = JSON.parse(localStorage.getItem("lazyflow-history") || "[]");
    if (Array.isArray(savedHistory)) {
        historyData = savedHistory;
    }
} catch (e) {
    console.warn("Could not load local storage data", e);
}

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------
let toastTimer = null;
function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// ---------------------------------------------------------------------------
// Theme Management (Light / Dark)
// ---------------------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem("lazyflow-theme") || "dark";
    setTheme(savedTheme);

    $("themeToggleBtn").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lazyflow-theme", theme);
    $("themeIcon").textContent = theme === "dark" ? "☀️" : "🌙";
}

// ---------------------------------------------------------------------------
// Task Selection & Filter Tabs
// ---------------------------------------------------------------------------
function selectTask(taskKey) {
    if (!tasks[taskKey]) return;
    activeTask = taskKey;

    document.querySelectorAll(".task-card").forEach(card => {
        card.classList.toggle("selected", card.dataset.task === taskKey);
    });

    const taskObj = tasks[taskKey];
    $("taskTitle").textContent = taskObj.title;
    $("inputLabel").textContent = taskObj.label;
    $("userInput").placeholder = taskObj.placeholder;

    // Reset counts
    updateInputStats();
}

function initCategoryFilters() {
    document.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const filter = tab.dataset.filter;
            document.querySelectorAll(".task-card").forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    card.classList.remove("hidden");
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });

    document.querySelectorAll(".task-card").forEach(card => {
        card.addEventListener("click", () => {
            selectTask(card.dataset.task);
        });
    });
}

// ---------------------------------------------------------------------------
// Character & Word Counter
// ---------------------------------------------------------------------------
function updateInputStats() {
    const val = $("userInput").value;
    const chars = val.length;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;

    $("charCount").textContent = `${chars.toLocaleString()} characters`;
    $("wordCount").textContent = `${words.toLocaleString()} words`;
}

$("userInput").addEventListener("input", updateInputStats);

// Sample text loader and clear buttons
$("insertSampleBtn").addEventListener("click", () => {
    $("userInput").value = tasks[activeTask].sample;
    updateInputStats();
    showToast(`Loaded sample for "${tasks[activeTask].title}"`);
    $("userInput").focus();
});

$("clearInputBtn").addEventListener("click", () => {
    $("userInput").value = "";
    updateInputStats();
    $("userInput").focus();
});

// ---------------------------------------------------------------------------
// Intelligent Demo Output Engine
// ---------------------------------------------------------------------------
function makeDemoResult(task, input) {
    const trimmed = input.trim();
    const lines = trimmed
        .split(/\n|(?<=[.!?])\s+/)
        .map(line => line.replace(/^[-*•\d.)\s]+/, "").trim())
        .filter(Boolean);

    if (task === "grammar") {
        // Smart grammar & tone simulation
        let corrected = trimmed;
        const improvements = [];

        if (/me and my team/i.test(corrected)) {
            corrected = corrected.replace(/me and my team/gi, "My team and I");
            improvements.push("Replaced 'me and my team' with grammatically proper 'My team and I'.");
        }
        if (/team has been/i.test(corrected) || /team have been/i.test(corrected)) {
            corrected = corrected.replace(/team has been/gi, "team have been");
        }
        if (/since 3 month/i.test(corrected)) {
            corrected = corrected.replace(/since 3 month/gi, "for the past three months");
            improvements.push("Corrected duration phrasing from 'since 3 month' to 'for the past three months'.");
        }
        if (/its really hard/i.test(corrected)) {
            corrected = corrected.replace(/its really hard/gi, "It has been demanding");
            improvements.push("Replaced colloquial 'its really hard' with polished 'It has been demanding'.");
        }
        if (/dont/i.test(corrected)) {
            corrected = corrected.replace(/\bdont\b/gi, "do not");
            improvements.push("Expanded informal contraction 'dont' to 'do not'.");
        }
        if (/we tries our best/i.test(corrected)) {
            corrected = corrected.replace(/we tries our best/gi, "we are striving");
            improvements.push("Fixed subject-verb agreement ('we tries' → 'we are striving').");
        }
        if (/by friday hopefully/i.test(corrected)) {
            corrected = corrected.replace(/by friday hopefully/gi, "by this Friday.");
            improvements.push("Capitalized days of the week ('Friday') and improved sentence ending.");
        }

        // Capitalize first letter of sentences
        corrected = corrected.replace(/(^\s*|\.\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

        return (
            "✦ POLISHED VERSION:\n" +
            "--------------------------------------------------\n" +
            corrected + "\n\n" +
            "✦ KEY IMPROVEMENTS MADE:\n" +
            "--------------------------------------------------\n" +
            (improvements.length > 0
                ? improvements.map((item, idx) => `${idx + 1}. ${item}`).join("\n")
                : "1. Refined sentence punctuation, capitalization, and tone flow.\n2. Polished vocabulary for executive-level clarity.\n3. Preserved core author voice and intent.") +
            "\n\n[Mode: Smart Demo Simulation — Connect Ollama for custom model tone]"
        );
    }

    if (task === "code") {
        // Smart code explanation simulation
        const isJS = /function|const|let|var|=>|console\./.test(trimmed);
        const isPython = /def |import |elif |print\(|class |:\s*$/.test(trimmed);
        const isSQL = /SELECT|FROM|WHERE|JOIN|INSERT|UPDATE/i.test(trimmed);

        const lang = isJS ? "JavaScript" : isPython ? "Python" : isSQL ? "SQL" : "Source Code";

        return (
            `✦ CODE ANALYSIS (${lang})\n` +
            "==================================================\n\n" +
            "1. HIGH-LEVEL OVERVIEW:\n" +
            `This ${lang} snippet implements core application logic. It processes input parameters, controls execution lifecycle, and ensures clean state management.\n\n` +
            "2. STEP-BY-STEP BREAKDOWN:\n" +
            lines.slice(0, 4).map((line, idx) => `• Step ${idx + 1}: Handles "${line.slice(0, 60)}..."`).join("\n") + "\n" +
            "• Returns or propagates the result cleanly to the caller.\n\n" +
            "3. PERFORMANCE & COMPLEXITY:\n" +
            "• Time Complexity: O(1) invocation overhead; overall depends on the inner handler.\n" +
            "• Memory Footprint: Minimal closure / stack allocation.\n\n" +
            "4. BEST PRACTICES & EDGE CASES:\n" +
            "• Always verify boundary conditions and null/undefined arguments.\n" +
            "• If executed in async environments, ensure unhandled promise rejections are caught.\n\n" +
            "[Mode: Smart Demo Simulation — Connect Ollama for deep line-by-line model analysis]"
        );
    }

    if (task === "meeting") {
        return (
            "✦ EXECUTIVE MEETING SUMMARY\n" +
            "==================================================\n\n" +
            "1. OVERVIEW & HIGHLIGHTS:\n" +
            (lines[0] ? `• Main Focus: ${lines[0]}\n` : "• Product and operational progress review.\n") +
            "• Team aligned on quarterly targets and resource commitments.\n\n" +
            "2. KEY DECISIONS MADE:\n" +
            "• Approved core milestones and schedule alignment.\n" +
            "• Deprioritized secondary features to protect launch reliability.\n\n" +
            "3. ACTION ITEMS & OWNERS:\n" +
            lines.slice(1, 4).map((line, i) => `[ ] Action ${i + 1}: ${line} (Status: In Progress)`).join("\n") + "\n\n" +
            "4. NEXT STEPS & SCHEDULE:\n" +
            "• Share minutes with broader stakeholders.\n" +
            "• Next follow-up sync confirmed.\n\n" +
            "[Mode: Smart Demo Simulation — Connect Ollama for real model extraction]"
        );
    }

    if (task === "summarize") {
        return (
            "✦ EXECUTIVE SUMMARY\n" +
            "==================================================\n\n" +
            "TL;DR:\n" +
            (lines[0] || "Key concepts synthesized from your text.") + "\n\n" +
            "CORE TAKEAWAYS:\n" +
            lines.slice(1, 5).map(line => `• ${line}`).join("\n") +
            "\n\n[Mode: Smart Demo Simulation — Connect Ollama for full LLM summarization]"
        );
    }

    if (task === "todos") {
        return (
            "✦ ORGANIZED CHECKLIST & PRIORITIES\n" +
            "==================================================\n\n" +
            "HIGH PRIORITY (Do First):\n" +
            (lines[0] ? `[ ] ⚡ ${lines[0]}\n` : "[ ] ⚡ Critical priority item\n") +
            (lines[1] ? `[ ] ⚡ ${lines[1]}\n` : "") + "\n" +
            "MEDIUM PRIORITY (In Progress):\n" +
            lines.slice(2, 5).map(line => `[ ] 📋 ${line}`).join("\n") + "\n\n" +
            "LOW PRIORITY / FOLLOW-UP:\n" +
            (lines[5] ? `[ ] ☕ ${lines[5]}\n` : "[ ] ☕ Review progress and clear inbox\n") +
            "\n[Mode: Smart Demo Simulation — Connect Ollama for context-aware categorization]"
        );
    }

    if (task === "email") {
        const preview = lines[0] || "following up on our recent conversation";
        return (
            "✦ DRAFT EMAIL\n" +
            "==================================================\n\n" +
            `Subject: Update Regarding ${preview.slice(0, 45)}...\n\n` +
            "Hi [Recipient Name],\n\n" +
            `I hope your week is going smoothly.\n\n` +
            trimmed + "\n\n" +
            "Please feel free to share your thoughts, and let me know if you would like to schedule a quick 15-minute sync to discuss this further.\n\n" +
            "Best regards,\n" +
            "[Your Name]\n" +
            "[Your Role / Contact Info]\n\n" +
            "[Mode: Smart Demo Simulation — Connect Ollama for nuanced LLM email tone]"
        );
    }

    // Default: plan
    return (
        "✦ REALISTIC DAILY SCHEDULE\n" +
        "==================================================\n\n" +
        "🌅 MORNING FOCUS BLOCK (9:00 AM - 12:00 PM)\n" +
        `• 09:00 - 10:30: Deep Work — ${lines[0] || "High-priority strategic task"}\n` +
        "• 10:30 - 10:45: ☕ Coffee & Stretch Break\n" +
        `• 10:45 - 12:00: Secondary Execution — ${lines[1] || "Communications & reviews"}\n\n` +
        "🥪 MIDDAY RECHARGE (12:00 PM - 1:00 PM)\n" +
        "• Lunch away from screens & brisk walk\n\n" +
        "⚡ AFTERNOON COLLABORATION BLOCK (1:00 PM - 4:30 PM)\n" +
        `• 01:00 - 02:30: Focus Session — ${lines[2] || "Follow-up deliverables"}\n` +
        "• 02:30 - 03:00: Buffer for meetings and inbound messages\n" +
        `• 03:00 - 04:30: Project refinement — ${lines[3] || "Wrap up loose ends"}\n\n` +
        "🌆 DAY WRAP-UP (4:30 PM - 5:00 PM)\n" +
        "• Review completed checklist\n" +
        "• Outline tomorrow's top 3 goals\n\n" +
        "[Mode: Smart Demo Simulation — Connect Ollama for customized time blocks]"
    );
}

// ---------------------------------------------------------------------------
// Ollama HTTP API Integration
// ---------------------------------------------------------------------------
async function askOllama(taskKey, input) {
    const endpoint = config.endpoint.replace(/\/+$/, "");
    const model = $("modelSelect").value;
    const taskObj = tasks[taskKey];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
        const response = await fetch(`${endpoint}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: model,
                prompt: `${taskObj.prompt}\n\nContent:\n${input}`,
                stream: false,
                options: {
                    temperature: 0.35
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama HTTP error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response || !data.response.trim()) {
            throw new Error("Ollama returned an empty response.");
        }

        return data.response.trim();
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ---------------------------------------------------------------------------
// Mode & UI State Updates
// ---------------------------------------------------------------------------
function updateMode(isAI) {
    const modeLabel = $("modeLabel");
    modeLabel.classList.toggle("status-connected", isAI);
    modeLabel.classList.toggle("status-demo", !isAI);

    const modeText = modeLabel.querySelector(".status-text");
    if (modeText) {
        modeText.textContent = isAI ? `Local AI (${config.model})` : "Demo mode";
    }

    $("noticeText").textContent = isAI
        ? `Connected to local model "${config.model}". Full AI generation active.`
        : "Demo mode is active. Connect Ollama in Settings to use real local AI.";
}

// ---------------------------------------------------------------------------
// Result Display & History Recording
// ---------------------------------------------------------------------------
function showResult(text, isAI, durationSec = "0.2s") {
    lastResult = text;

    $("resultTitle").textContent = tasks[activeTask].title;
    $("resultBadge").textContent = isAI ? "Local AI Result" : "Demo Mode — Not AI";
    $("resultBadge").classList.toggle("real", isAI);
    $("resultTimeBadge").textContent = durationSec;

    const resultPanel = $("resultPanel");
    resultPanel.classList.remove("hidden");

    // Smooth typewriter simulation for polished feedback
    animateTypewriter(text);

    // Record in History
    addHistoryItem({
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        task: activeTask,
        taskTitle: tasks[activeTask].title,
        input: $("userInput").value.trim(),
        result: text,
        isAI: isAI
    });

    resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function animateTypewriter(fullText) {
    const el = $("resultText");
    el.textContent = "";

    // Fast reveal for usability
    let i = 0;
    const step = Math.max(1, Math.floor(fullText.length / 80));

    function tick() {
        i += step;
        if (i < fullText.length) {
            el.textContent = fullText.slice(0, i) + "▌";
            requestAnimationFrame(tick);
        } else {
            el.textContent = fullText;
        }
    }
    requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Task Execution Handler
// ---------------------------------------------------------------------------
async function runTask() {
    const input = $("userInput").value.trim();

    if (!input) {
        showToast("Please enter or paste some text first.");
        $("userInput").focus();
        return;
    }

    if (input.length > 25000) {
        showToast("Please keep input under 25,000 characters.");
        return;
    }

    const button = $("runBtn");
    const spinner = $("btnSpinner");
    const btnText = $("runBtnText");

    button.disabled = true;
    spinner.classList.remove("hidden");
    btnText.textContent = "Processing...";

    const startTime = performance.now();

    try {
        const answer = await askOllama(activeTask, input);
        const durationSec = ((performance.now() - startTime) / 1000).toFixed(2) + "s";

        updateMode(true);
        showResult(answer, true, durationSec);
        showToast("Local AI generation complete!");

    } catch (err) {
        console.warn("Ollama request failed, falling back to smart demo:", err);

        const durationSec = ((performance.now() - startTime) / 1000).toFixed(2) + "s";
        updateMode(false);

        const demoOutput = makeDemoResult(activeTask, input);
        showResult(demoOutput, false, durationSec);

        showToast("Ollama not running. Generated smart demo output.");
    } finally {
        button.disabled = false;
        spinner.classList.add("hidden");
        btnText.textContent = "✦ Make it easier →";
    }
}

$("runBtn").addEventListener("click", runTask);

// ---------------------------------------------------------------------------
// History Management
// ---------------------------------------------------------------------------
function addHistoryItem(item) {
    historyData.unshift(item);
    if (historyData.length > 20) {
        historyData.pop();
    }
    try {
        localStorage.setItem("lazyflow-history", JSON.stringify(historyData));
    } catch (e) {
        console.warn(e);
    }
    updateHistoryCount();
    renderHistory();
}

function updateHistoryCount() {
    $("historyCount").textContent = historyData.length;
}

function renderHistory() {
    const container = $("historyList");
    if (!historyData.length) {
        container.innerHTML = '<p class="empty-state">No saved generations yet. Run any workflow to save it here!</p>';
        return;
    }

    container.innerHTML = historyData.map((item, idx) => `
        <div class="history-item" data-idx="${idx}">
            <div class="history-item-top">
                <span class="history-item-title">${item.taskTitle}</span>
                <span class="history-item-time">${item.time} · ${item.isAI ? "AI" : "Demo"}</span>
            </div>
            <div class="history-item-preview">${escapeHtml(item.result.slice(0, 100))}...</div>
        </div>
    `).join("");

    container.querySelectorAll(".history-item").forEach(el => {
        el.addEventListener("click", () => {
            const idx = parseInt(el.dataset.idx, 10);
            const item = historyData[idx];
            if (item) {
                selectTask(item.task);
                $("userInput").value = item.input;
                updateInputStats();
                showResult(item.result, item.isAI);
                $("historyDialog").close();
                showToast("Restored from history.");
            }
        });
    });
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

$("historyToggleBtn").addEventListener("click", () => {
    renderHistory();
    $("historyDialog").showModal();
});

$("closeHistory").addEventListener("click", () => $("historyDialog").close());
$("closeHistoryBtn").addEventListener("click", () => $("historyDialog").close());

$("clearHistoryBtn").addEventListener("click", () => {
    historyData = [];
    localStorage.removeItem("lazyflow-history");
    updateHistoryCount();
    renderHistory();
    showToast("History cleared.");
});

// ---------------------------------------------------------------------------
// Copy & Download Actions
// ---------------------------------------------------------------------------
$("copyBtn").addEventListener("click", async () => {
    if (!lastResult) return;
    try {
        await navigator.clipboard.writeText(lastResult);
        showToast("Copied to clipboard!");
    } catch {
        showToast("Please select and copy manually.");
    }
});

$("downloadBtn").addEventListener("click", () => {
    if (!lastResult) return;
    const blob = new Blob([lastResult], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lazyflow-${activeTask}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded as Markdown!");
});

// Command copy button
document.querySelectorAll(".cmd-copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(text);
            const orig = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = orig; }, 1800);
        } catch {
            showToast("Failed to copy command.");
        }
    });
});

// ---------------------------------------------------------------------------
// Settings Modal & Ollama Test
// ---------------------------------------------------------------------------
function openSettings() {
    $("endpointInput").value = config.endpoint;
    $("modelInput").value = config.model;
    $("settingsStatus").textContent = "Not tested yet.";
    $("settingsStatusIcon").textContent = "⚪";
    $("settingsDialog").showModal();
}

$("settingsBtn").addEventListener("click", openSettings);
$("configureBtn").addEventListener("click", openSettings);

$("closeSettings").addEventListener("click", () => $("settingsDialog").close());
$("closeSettingsX").addEventListener("click", () => $("settingsDialog").close());

// Quick model tags
document.querySelectorAll(".quick-tag").forEach(tag => {
    tag.addEventListener("click", () => {
        const model = tag.dataset.model;
        $("modelInput").value = model;
        showToast(`Selected ${model}`);
    });
});

async function testConnection() {
    const endpoint = $("endpointInput").value.trim().replace(/\/+$/, "");
    const model = $("modelInput").value.trim();
    const status = $("settingsStatus");
    const icon = $("settingsStatusIcon");

    if (!endpoint || !model) {
        status.textContent = "Please provide both endpoint URL and model name.";
        icon.textContent = "⚠️";
        return;
    }

    status.textContent = "Testing connection to Ollama...";
    icon.textContent = "⏳";

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const models = (data.models || []).map(m => m.name);

        const installed = models.some(m => m === model || m.startsWith(`${model}:`) || model.startsWith(`${m}:`));

        if (installed) {
            status.textContent = `Success! Ollama is reachable and model "${model}" is installed.`;
            icon.textContent = "🟢";
        } else {
            status.textContent = `Connected, but "${model}" is not installed. Run: ollama pull ${model}`;
            icon.textContent = "🟡";
        }
    } catch (err) {
        status.textContent = `Connection failed. Make sure Ollama is running and CORS allows web access. (OLLAMA_ORIGINS="*" ollama serve)`;
        icon.textContent = "🔴";
    }
}

$("testBtn").addEventListener("click", testConnection);

$("settingsForm").addEventListener("submit", event => {
    event.preventDefault();

    config.endpoint = $("endpointInput").value.trim().replace(/\/+$/, "");
    config.model = $("modelInput").value.trim();

    localStorage.setItem("lazyflow-config", JSON.stringify(config));

    // Update select dropdown if model exists
    const optionExists = [...$("modelSelect").options].some(opt => opt.value === config.model);
    if (!optionExists) {
        const newOpt = document.createElement("option");
        newOpt.value = config.model;
        newOpt.textContent = `${config.model} (Custom)`;
        $("modelSelect").appendChild(newOpt);
    }
    $("modelSelect").value = config.model;

    $("settingsDialog").close();
    showToast("Settings saved successfully.");
});

$("modelSelect").addEventListener("change", () => {
    config.model = $("modelSelect").value;
    $("modelInput").value = config.model;
    localStorage.setItem("lazyflow-config", JSON.stringify(config));
    showToast(`Active model: ${config.model}`);
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initCategoryFilters();
    updateHistoryCount();

    // Populate model selector with saved config
    if (config.model) {
        const optionExists = [...$("modelSelect").options].some(opt => opt.value === config.model);
        if (!optionExists) {
            const newOpt = document.createElement("option");
            newOpt.value = config.model;
            newOpt.textContent = `${config.model} (Custom)`;
            $("modelSelect").appendChild(newOpt);
        }
        $("modelSelect").value = config.model;
    }

    selectTask("summarize");
});