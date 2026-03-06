import { useState, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const LANGUAGES = {
  "Web Development": [
    { id: "html",       label: "HTML",       icon: "🌐" },
    { id: "css",        label: "CSS",        icon: "🎨" },
    { id: "javascript", label: "JavaScript", icon: "⚡" },
    { id: "typescript", label: "TypeScript", icon: "🔷" },
    { id: "php",        label: "PHP",        icon: "🐘" },
    { id: "sql",        label: "SQL",        icon: "🗄️" },
    { id: "graphql",    label: "GraphQL",    icon: "◈"  },
    { id: "sass",       label: "Sass/SCSS",  icon: "💅" },
    { id: "react",      label: "React",      icon: "⚛️" },
    { id: "nodejs",     label: "Node.js",    icon: "🟢" },
  ],
  "Programming Languages": [
    { id: "python",  label: "Python",  icon: "🐍" },
    { id: "java",    label: "Java",    icon: "☕" },
    { id: "c",       label: "C",       icon: "⚙️" },
    { id: "cpp",     label: "C++",     icon: "➕" },
    { id: "csharp",  label: "C#",      icon: "🎯" },
    { id: "rust",    label: "Rust",    icon: "🦀" },
    { id: "go",      label: "Go",      icon: "🐹" },
    { id: "kotlin",  label: "Kotlin",  icon: "🟣" },
    { id: "swift",   label: "Swift",   icon: "🦅" },
    { id: "ruby",    label: "Ruby",    icon: "💎" },
    { id: "r",       label: "R",       icon: "📊" },
    { id: "dart",    label: "Dart",    icon: "🎯" },
    { id: "bash",    label: "Bash",    icon: "💻" },
  ],
};

const MODES = [
  {
    id: "theory", label: "Theory Mode", icon: "📚",
    desc: "Concept MCQs & fill-in-the-blank questions to test your knowledge",
    types: ["mcq", "word_bank"],
    gradient: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
    accent: "#ec4899", border: "#f9a8d4",
  },
  {
    id: "code", label: "Code Mode", icon: "💻",
    desc: "Output prediction, syntax selection & typed answers from real code",
    types: ["output", "syntax", "typed_fill"],
    gradient: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    accent: "#8b5cf6", border: "#c4b5fd",
  },
  {
    id: "mixed", label: "Mixed Mode", icon: "🔀",
    desc: "All question types combined for the ultimate coding challenge",
    types: ["mcq", "word_bank", "output", "syntax", "typed_fill"],
    gradient: "linear-gradient(135deg,#fff7ed,#fef3c7)",
    accent: "#f59e0b", border: "#fcd34d",
  },
];

const COUNTS = [5, 10, 15, 20, 30];

const DIFFICULTIES = [
  { id: "beginner",     label: "Beginner",     icon: "🌱", color: "#10b981", bg: "#f0fdf4", border: "#6ee7b7" },
  { id: "intermediate", label: "Intermediate", icon: "🔥", color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" },
  { id: "advanced",     label: "Advanced",     icon: "⚡", color: "#ef4444", bg: "#fff1f2", border: "#fca5a5" },
  { id: "mixed",        label: "Mixed",        icon: "🎲", color: "#8b5cf6", bg: "#f5f3ff", border: "#c4b5fd" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #fdf4f8;
    --bg2:         #f9e8f3;
    --surface:     rgba(255,255,255,0.78);
    --surface2:    rgba(255,255,255,0.55);
    --border:      rgba(244,114,182,0.28);
    --border2:     rgba(236,72,153,0.38);
    --pink:        #ec4899;
    --pink-light:  #f472b6;
    --pink-deep:   #be185d;
    --pink-pale:   #fce7f3;
    --lavender:    #a78bfa;
    --lav-light:   #ede9fe;
    --green:       #10b981;
    --red:         #ef4444;
    --amber:       #f59e0b;
    --text:        #1f1535;
    --text-mid:    #6b6a7a;
    --text-dim:    #a89fb5;
    --font:        'Sora', sans-serif;
    --radius-sm:   10px;
    --radius-md:   16px;
    --radius-lg:   22px;
    --radius-xl:   30px;
    --shadow-sm:   0 2px 10px rgba(236,72,153,0.06);
    --shadow-md:   0 6px 24px rgba(236,72,153,0.10);
    --shadow-lg:   0 16px 48px rgba(236,72,153,0.14);
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 90% -10%, rgba(244,114,182,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 10% 100%, rgba(167,139,250,0.10) 0%, transparent 55%);
    background-attachment: fixed;
    color: var(--text);
    font-family: var(--font);
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(244,114,182,0.35); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--pink-light); }

  /* ── Transitions ── */
  .screen-enter {
    animation: sIn 0.44s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes sIn {
    from { opacity:0; transform:translateY(20px) scale(0.985); }
    to   { opacity:1; transform:translateY(0)    scale(1); }
  }

  .screen-exit {
    animation: sOut 0.26s ease forwards;
  }
  @keyframes sOut {
    to { opacity:0; transform:translateY(-14px) scale(0.98); }
  }

  /* ── Glass ── */
  .glass {
    background: var(--surface);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
  }

  .card-lift {
    transition: transform 0.26s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.26s ease,
                border-color 0.2s ease;
  }
  .card-lift:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border2);
  }

  /* ── Buttons ── */
  .btn {
    transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.18s ease;
    cursor: pointer;
  }
  .btn:active { transform: scale(0.96) !important; }

  /* ── Stagger ── */
  .stagger { opacity: 0; animation: stUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes stUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Shimmer ── */
  .shimmer {
    background: linear-gradient(90deg, #fce7f3 25%, #fff0f8 50%, #fce7f3 75%);
    background-size: 200% 100%;
    animation: shimAnim 1.6s infinite;
  }
  @keyframes shimAnim { from{background-position:200% 0} to{background-position:-200% 0} }

  /* ── Progress bar ── */
  .progress-fill { transition: width 0.55s cubic-bezier(0.34,1.56,0.64,1); }

  /* ── Input ── */
  .s-input {
    background: rgba(255,255,255,0.88);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    padding: 11px 16px;
    font-family: var(--font);
    font-size: 14px;
    color: var(--text);
    outline: none;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .s-input:focus {
    border-color: var(--pink-light);
    box-shadow: 0 0 0 3px rgba(244,114,182,0.14);
  }
  .s-input::placeholder { color: var(--text-dim); }

  /* ── Code block ── */
  .code-block {
    font-family: 'Courier New', monospace;
    background: #1a1025;
    color: #f0c4e4;
    border: 1px solid rgba(167,139,250,0.2);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    font-size: 13px;
    line-height: 1.75;
    overflow-x: auto;
    white-space: pre;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.18);
  }

  /* ── Option buttons ── */
  .option-btn {
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .option-btn:hover:not(:disabled) { transform: translateX(5px); }

  /* ── Type badge ── */
  .type-badge {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 20px;
    display: inline-flex; align-items: center;
  }

  /* ── Divider ── */
  .divider {
    display: flex; align-items: center; gap: 10px;
    color: var(--text-dim); font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase;
    font-weight: 700; margin-bottom: 14px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg,transparent,rgba(244,114,182,0.25),transparent);
  }

  /* ── Result row ── */
  .result-row { animation: rIn 0.38s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes rIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Loading spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Dot loader ── */
  .dot-b { animation: dotB 1.4s ease-in-out infinite; }
  @keyframes dotB {
    0%,80%,100% { transform:scale(0.55); opacity:0.35; }
    40%          { transform:scale(1);    opacity:1; }
  }

  /* ── Skip shake ── */
  .skip-shake { animation: skSh 0.3s ease; }
  @keyframes skSh {
    0%,100% { transform:translateX(0); }
    30%     { transform:translateX(-4px); }
    70%     { transform:translateX(4px); }
  }

  /* ── Pill float ── */
  @keyframes pillFloat {
    0%,100% { transform: translateY(0px) rotate(-1.2deg); }
    50%      { transform: translateY(-10px) rotate(1.2deg); }
  }

  /* ── Petals ── */
  .petal {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    animation: petalFall linear infinite;
    user-select: none;
  }
  @keyframes petalFall {
    0%   { transform: translateY(-30px) rotate(0deg)
  .cta-btn {
    background: linear-gradient(135deg, #ec4899, #f472b6);
    color: #fff;
    border: none;
    font-family: var(--font);
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 6px 20px rgba(236,72,153,0.26);
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(236,72,153,0.36);
  }
  .cta-btn:active { transform: scale(0.96) !important; }

  /* ══════════════════════════════
     RESPONSIVE — Tablet & Mobile
     ══════════════════════════════ */

  /* Tablet ≤ 768px */
  @media (max-width: 768px) {
    /* Top bar */
    .topbar-crumb { display: none !important; }

    /* Floating pills container shrinks */
    .pills-container { height: 130px !important; max-width: 100% !important; }

    /* Mode cards: stack icon above text on small screens */
    .mode-card-inner { flex-direction: column !important; align-items: flex-start !important; }
    .mode-icon-box { width: 48px !important; height: 48px !important; font-size: 22px !important; }

    /* Quiz nav buttons: smaller padding */
    .quiz-nav-btn { padding: 11px 14px !important; font-size: 12px !important; }

    /* Results stats: tighter gap */
    .results-stats { gap: 20px !important; }
  }

  /* Mobile ≤ 480px */
  @media (max-width: 480px) {
    /* Header: tighten padding */
    header { padding: 0 16px !important; }

    /* Language grid: 2 columns */
    .lang-grid { grid-template-columns: repeat(2, 1fr) !important; }

    /* Count buttons: 3 per row */
    .count-row { gap: 7px !important; }
    .count-btn  { width: 54px !important; height: 48px !important; font-size: 16px !important; }

    /* Floating pills: hide on very small screens to avoid overflow */
    .pills-container { display: none !important; }

    /* Welcome: compress vertical spacing */
    .welcome-wrap { padding: 40px 18px !important; }

    /* Screen padding */
    .screen-pad { padding-left: 16px !important; padding-right: 16px !important; }

    /* Mode card: reduce padding */
    .mode-card { padding: 18px 16px !important; }

    /* Quiz card */
    .quiz-card { padding: 20px 16px !important; border-radius: 20px !important; }

    /* Quiz nav: make "Next" full width on its own row */
    .quiz-nav { flex-wrap: wrap !important; }
    .quiz-nav-next { width: 100% !important; }

    /* Question font size */
    .q-text { font-size: 14px !important; }

    /* Option text */
    .opt-text { font-size: 13px !important; }

    /* Results score font */
    .score-pct { font-size: 56px !important; }

    /* Result rows padding */
    .result-row { padding: 14px 14px !important; }

    /* Top bar: hide language pill on mobile */
    .topbar-lang { display: none !important; }
  }

`;

function injectStyles() {
  if (document.getElementById("cd-styles")) return;
  const el = document.createElement("style");
  el.id = "cd-styles";
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

function badge(type) {
  return {
    mcq:        { label: "MCQ",        bg: "#fce7f3", color: "#be185d", border: "#f9a8d4" },
    word_bank:  { label: "Fill Blank", bg: "#f5f3ff", color: "#6d28d9", border: "#c4b5fd" },
    output:     { label: "Output",     bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
    syntax:     { label: "Syntax",     bg: "#f0fdf4", color: "#047857", border: "#6ee7b7" },
    typed_fill: { label: "Type It",    bg: "#fff1f2", color: "#be123c", border: "#fca5a5" },
  }[type] || { label: type, bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchQuestions({ language, mode, difficulty, count }) {
  const modeObj = MODES.find(m => m.id === mode);
  const types = modeObj.types;
  const specs = {
    mcq:        "Concept question, 4 options (type:'mcq'). Fields: question, options[4], answer(0-3), explanation.",
    word_bank:  "Fill-in-blank with ___ placeholder, 4 chip options (type:'word_bank'). Fields: question, options[4], answer(0-3), explanation.",
    output:     "Code snippet → what's the output? 4 options (type:'output'). Fields: question, code_snippet, options[4], answer(0-3), explanation.",
    syntax:     "Pick the correct syntax, 4 options (type:'syntax'). Fields: question, options[4], answer(0-3), explanation.",
    typed_fill: "User types a 1-4 word answer (type:'typed_fill'). Fields: question, answer(string, 1-4 words), explanation.",
  };
  const diffLabel = difficulty === "mixed" ? "a balanced mix of beginner, intermediate, and advanced" : difficulty;
  const res = await fetch(GROK_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROK_API_KEY}` },
    body: JSON.stringify({
      model: "grok-3-latest",
      max_tokens: 4000,
      temperature: 0.96,
      messages: [
        { role: "system", content: "You are a programming quiz generator. Return ONLY a valid JSON array — no markdown, no backticks, no extra text." },
        { role: "user",   content: `Generate ${count} unique ${language} questions at ${diffLabel} difficulty. Distribute evenly across types: ${types.join(", ")}.\n\nType specs:\n${types.map(t => specs[t]).join("\n")}\n\nRules: no repeated questions, code_snippet must be real runnable ${language} code (3-8 lines), typed_fill answer = 1-4 words, all answers technically accurate, explanation ≤ 2 sentences.\n\nReturn ONLY a JSON array.` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ screen, onBack, config }) {
  const showBack = !["welcome","loading","quiz","results","error"].includes(screen);
  const crumbs = { language: "Language", mode: "Mode", config: "Configure" };
  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      height:60,
      background:"rgba(253,244,248,0.9)",
      backdropFilter:"blur(16px)",
      borderBottom:"1px solid rgba(244,114,182,0.18)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 28px",
      boxShadow:"0 1px 16px rgba(236,72,153,0.05)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontFamily:"var(--font)", fontWeight:800, fontSize:17, color:"var(--pink-deep)", letterSpacing:"-0.02em" }}>
          CodeDojo
        </span>
        {crumbs[screen] && (
          <>
            <span className="topbar-crumb" style={{ color:"rgba(244,114,182,0.4)", fontSize:14 }}>›</span>
            <span className="topbar-crumb" style={{ color:"var(--text-mid)", fontSize:13, fontWeight:500 }}>{crumbs[screen]}</span>
          </>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {config.language && screen !== "language" && (
          <span style={{
            fontSize:11, fontWeight:700, color:"var(--pink)",
            background:"rgba(236,72,153,0.08)",
            border:"1px solid rgba(244,114,182,0.28)",
            padding:"3px 11px", borderRadius:20, letterSpacing:"0.02em",
          }} className="topbar-lang">
            {config.language}
          </span>
        )}
        {showBack && (
          <button onClick={onBack} className="btn" style={{
            background:"rgba(255,255,255,0.85)",
            border:"1px solid var(--border)",
            color:"var(--text-mid)",
            padding:"6px 16px", borderRadius:20,
            fontSize:12, fontWeight:600,
            boxShadow:"var(--shadow-sm)",
          }}>
            ← Back
          </button>
        )}
      </div>
    </header>
  );
}

// ─── WELCOME ──────────────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-wrap" style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"60px 24px", position:"relative", zIndex:1, textAlign:"center",
    }}>
      {/* Logo mark */}
      <div style={{
        width:80, height:80, borderRadius:24,
        background:"linear-gradient(135deg,#f9a8d4,#ec4899)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:36, marginBottom:28,
        boxShadow:"0 8px 28px rgba(236,72,153,0.22)",
      }}>
        ⚔️
      </div>

      <h1 style={{
        fontFamily:"var(--font)", fontSize:"clamp(42px,6vw,72px)",
        fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.08,
        marginBottom:14, color:"var(--text)",
      }}>
        Code<span style={{ color:"var(--pink)" }}>Dojo</span>
      </h1>

      <p style={{
        color:"var(--text-mid)", fontSize:"clamp(14px,1.8vw,16px)",
        maxWidth:420, lineHeight:1.72, marginBottom:36, fontWeight:400,
      }}>
        AI-generated programming challenges across every language and framework. Practice smarter.
      </p>

      {/* Floating stat pills */}
      <div className="pills-container" style={{ position:"relative", width:"100%", maxWidth:500, height:110, marginBottom:36 }}>
        {[
          { label:"23 Languages",     color:"var(--pink)",     top:"4%",  left:"1%",  right:undefined, delay:"0s",   dur:"4.2s" },
          { label:"3 Modes",          color:"var(--lavender)", top:"2%",  left:undefined, right:"1%",  delay:"0.7s", dur:"5.0s" },
          { label:"5 Question Types", color:"var(--amber)",    top:"58%", left:"5%",  right:undefined, delay:"1.2s", dur:"4.6s" },
          { label:"AI-Powered",       color:"var(--green)",    top:"55%", left:undefined, right:"5%",  delay:"0.4s", dur:"5.4s" },
        ].map((t) => (
          <span key={t.label} style={{
            position:"absolute",
            top:t.top,
            ...(t.left !== undefined ? { left:t.left } : {}),
            ...(t.right !== undefined ? { right:t.right } : {}),
            background:"rgba(255,255,255,0.88)",
            border:"1px solid var(--border)",
            borderRadius:20, padding:"7px 16px",
            fontSize:12, fontWeight:600, color:"var(--text-mid)",
            boxShadow:"var(--shadow-md)",
            display:"inline-flex", alignItems:"center", gap:7,
            animation:`pillFloat ${t.dur} ease-in-out ${t.delay} infinite`,
            whiteSpace:"nowrap",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:t.color, display:"inline-block", flexShrink:0 }} />
            {t.label}
          </span>
        ))}
      </div>

      <button onClick={onStart} className="cta-btn" style={{ padding:"15px 52px", borderRadius:50, fontSize:15 }}>
        Start Practicing →
      </button>

      <p style={{ marginTop:16, color:"var(--text-dim)", fontSize:11, fontWeight:500, letterSpacing:"0.04em" }}>
        POWERED BY GROK AI
      </p>
    </div>
  );
}

// ─── LANGUAGE ────────────────────────────────────────────────────────────────
function LanguageScreen({ onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = Object.entries(LANGUAGES).reduce((acc, [cat, langs]) => {
    const f = langs.filter(l => l.label.toLowerCase().includes(search.toLowerCase()));
    if (f.length) acc[cat] = f;
    return acc;
  }, {});

  return (
    <div className="screen-enter" className="screen-pad" style={{ maxWidth:840, margin:"0 auto", padding:"80px 24px 60px", position:"relative", zIndex:1 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"var(--font)", fontSize:26, fontWeight:800, color:"var(--text)", marginBottom:5 }}>
          Select a Language
        </h2>
        <p style={{ color:"var(--text-mid)", fontSize:14 }}>What are you practicing today?</p>
      </div>

      <div style={{ maxWidth:300, marginBottom:26 }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--text-dim)" }}>🔍</span>
          <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="s-input" style={{ paddingLeft:38 }} />
        </div>
      </div>

      {Object.entries(filtered).map(([cat, langs]) => (
        <div key={cat} style={{ marginBottom:28 }}>
          <div className="divider">{cat}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:9 }} className="lang-grid">
            {langs.map((lang, i) => (
              <button key={lang.id} onClick={() => onSelect(lang.label)}
                className="glass card-lift btn stagger"
                style={{
                  animationDelay:`${i*0.03}s`,
                  borderRadius:"var(--radius-md)",
                  padding:"13px 15px",
                  display:"flex", alignItems:"center", gap:10,
                  textAlign:"left", border:"1px solid var(--border)",
                }}>
                <span style={{ fontSize:20 }}>{lang.icon}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MODE ─────────────────────────────────────────────────────────────────────
function ModeScreen({ onSelect }) {
  return (
    <div className="screen-enter" className="screen-pad" style={{ maxWidth:680, margin:"0 auto", padding:"80px 24px 60px", position:"relative", zIndex:1 }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"var(--font)", fontSize:26, fontWeight:800, color:"var(--text)", marginBottom:5 }}>
          Choose a Mode
        </h2>
        <p style={{ color:"var(--text-mid)", fontSize:14 }}>How do you want to be challenged?</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {MODES.map((mode, i) => (
          <button key={mode.id} onClick={() => onSelect(mode.id)}
            className="mode-card card-lift btn stagger"
            style={{
              animationDelay:`${i*0.09}s`,
              background: mode.gradient,
              border:`1.5px solid ${mode.border}`,
              borderRadius:"var(--radius-lg)",
              padding:"24px 26px",
              display:"flex", alignItems:"center", gap:18,
              textAlign:"left", width:"100%",
              boxShadow:"var(--shadow-sm)",
            }}>
            {/* Icon box */}
            <div className="mode-icon-box" style={{
              width:60, height:60, borderRadius:16,
              background:"rgba(255,255,255,0.7)",
              border:`1px solid ${mode.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, flexShrink:0,
            }}>
              {mode.icon}
            </div>

            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontFamily:"var(--font)", fontSize:17, fontWeight:800, color:mode.accent, marginBottom:4 }}>
                {mode.label}
              </div>
              <div style={{ color:"var(--text-mid)", fontSize:13, lineHeight:1.55, marginBottom:10 }}>
                {mode.desc}
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {mode.types.map(t => {
                  const b = badge(t);
                  return (
                    <span key={t} className="type-badge" style={{ background:b.bg, color:b.color, border:`1px solid ${b.border}` }}>
                      {b.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <span style={{ color:mode.accent, fontSize:18, opacity:0.45, flexShrink:0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
function ConfigScreen({ language, mode, onStart }) {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("intermediate");
  const modeObj = MODES.find(m => m.id === mode);

  return (
    <div className="screen-enter" className="screen-pad" style={{ maxWidth:560, margin:"0 auto", padding:"80px 24px 60px", position:"relative", zIndex:1 }}>
      <div style={{ marginBottom:26 }}>
        <h2 style={{ fontFamily:"var(--font)", fontSize:26, fontWeight:800, color:"var(--text)", marginBottom:8 }}>
          Configure Quiz
        </h2>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, fontWeight:700, color:"var(--pink)", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(244,114,182,0.28)", padding:"3px 11px", borderRadius:20 }}>{language}</span>
          <span style={{ fontSize:11, fontWeight:700, color:modeObj?.accent, background:`${modeObj?.accent}12`, border:`1px solid ${modeObj?.border}`, padding:"3px 11px", borderRadius:20 }}>{modeObj?.label}</span>
        </div>
      </div>

      {/* Count */}
      <div style={{ marginBottom:28 }}>
        <div className="divider">Number of Questions</div>
        <div className="count-row" style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
          {COUNTS.map(n => (
            <button key={n} onClick={() => setCount(n)} className="btn count-btn" style={{
              width:62, height:54,
              borderRadius:"var(--radius-md)",
              background: count===n ? "linear-gradient(135deg,#ec4899,#f472b6)" : "rgba(255,255,255,0.82)",
              border:`1.5px solid ${count===n ? "transparent" : "var(--border)"}`,
              color: count===n ? "#fff" : "var(--text-mid)",
              fontSize:19, fontWeight:800,
              boxShadow: count===n ? "0 5px 18px rgba(236,72,153,0.26)" : "var(--shadow-sm)",
              transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              transform: count===n ? "scale(1.07)" : "scale(1)",
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom:40 }}>
        <div className="divider">Difficulty</div>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)} className="btn" style={{
              background: difficulty===d.id ? d.bg : "rgba(255,255,255,0.72)",
              border:`1.5px solid ${difficulty===d.id ? d.border : "var(--border)"}`,
              borderRadius:"var(--radius-md)",
              padding:"13px 18px",
              display:"flex", alignItems:"center", gap:13,
              transition:"all 0.2s ease",
              boxShadow: difficulty===d.id ? `0 3px 14px ${d.color}1e` : "none",
            }}>
              <span style={{ fontSize:20 }}>{d.icon}</span>
              <span style={{ fontSize:14, fontWeight:700, color: difficulty===d.id ? d.color : "var(--text-mid)", transition:"color 0.2s" }}>
                {d.label}
              </span>
              {difficulty===d.id && (
                <span style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:d.color, boxShadow:`0 0 7px ${d.color}` }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onStart({ count, difficulty })} className="cta-btn" style={{ width:"100%", padding:"17px", borderRadius:50, fontSize:15, letterSpacing:"0.01em" }}>
        Let's Go →
      </button>
    </div>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
function LoadingScreen({ language, count }) {
  const msgs = [
    "Generating your questions…",
    "Crafting the perfect challenge…",
    "Calibrating difficulty…",
    "Almost there…",
  ];
  const [mi, setMi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMi(m => (m+1) % msgs.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="screen-enter" style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:26, padding:24, textAlign:"center", position:"relative", zIndex:1,
    }}>
      <div style={{
        width:70, height:70, borderRadius:"50%",
        border:"3px solid rgba(244,114,182,0.25)",
        borderTopColor:"var(--pink)",
        animation:"spin 0.85s linear infinite",
        boxShadow:"0 0 24px rgba(236,72,153,0.12)",
      }} />

      <div>
        <div style={{ fontFamily:"var(--font)", fontSize:18, fontWeight:700, color:"var(--pink-deep)", marginBottom:6 }}>
          {msgs[mi]}
        </div>
        <div style={{ color:"var(--text-mid)", fontSize:13 }}>
          Building {count} {language} questions
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%", maxWidth:340 }}>
        {[75, 60, 85, 50].map((w, i) => (
          <div key={i} className="shimmer" style={{ height:11, borderRadius:6, width:`${w}%`, opacity:0.75 }} />
        ))}
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} className="dot-b" style={{ width:8, height:8, borderRadius:"50%", background:"var(--pink-light)", animationDelay:`${i*0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizScreen({ questions, onFinish }) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [skipped, setSkipped]   = useState(new Set());
  const [cardKey, setCardKey]   = useState(0);
  const [doShake, setDoShake]   = useState(false);

  const q       = questions[current];
  const total   = questions.length;
  const answered = Object.keys(answers).length;
  const b        = badge(q.type);
  const hasAns   = answers[current] !== undefined;

  function go(idx) { setCardKey(k => k+1); setCurrent(idx); }

  function handleAnswer(val) {
    setAnswers(a => ({ ...a, [current]: val }));
    setSkipped(s => { const n = new Set(s); n.delete(current); return n; });
  }

  function handleSkip() {
    if (!answers[current]) {
      setSkipped(s => new Set([...s, current]));
      setDoShake(true);
      setTimeout(() => setDoShake(false), 320);
    }
    if (current < total-1) go(current+1);
    else onFinish(answers, skipped);
  }

  return (
    <div className="screen-pad" style={{ maxWidth:660, margin:"0 auto", padding:"76px 22px 88px", position:"relative", zIndex:1 }}>

      {/* ── Progress ── */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--text-mid)" }}>
            {current+1} / {total}
          </span>
          <div style={{ display:"flex", gap:10 }}>
            <span style={{ fontSize:12, color:"var(--green)", fontWeight:600 }}>✓ {answered}</span>
            {skipped.size > 0 && <span style={{ fontSize:12, color:"var(--amber)", fontWeight:600 }}>⟳ {skipped.size}</span>}
          </div>
        </div>

        {/* Bar */}
        <div style={{ height:5, background:"rgba(244,114,182,0.15)", borderRadius:3, overflow:"hidden" }}>
          <div className="progress-fill" style={{ height:"100%", width:`${((current+1)/total)*100}%`, background:"linear-gradient(90deg,#f9a8d4,#ec4899)", borderRadius:3 }} />
        </div>

        {/* Dot nav */}
        <div style={{ display:"flex", gap:5, marginTop:10, flexWrap:"wrap" }}>
          {questions.map((_,i) => (
            <button key={i} onClick={() => go(i)} style={{
              width:8, height:8, borderRadius:"50%", border:"none",
              cursor:"pointer", padding:0,
              background: i===current ? "var(--pink)"
                : answers[i]!==undefined ? "var(--green)"
                : skipped.has(i) ? "var(--amber)"
                : "rgba(244,114,182,0.22)",
              transition:"all 0.18s ease",
              transform: i===current ? "scale(1.6)" : "scale(1)",
            }} />
          ))}
        </div>
      </div>

      {/* ── Question Card ── */}
      <div key={cardKey} className="quiz-card screen-enter glass" style={{ borderRadius:"var(--radius-xl)", padding:"28px 26px", marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span className="type-badge" style={{ background:b.bg, color:b.color, border:`1px solid ${b.border}` }}>
            {b.label}
          </span>
          <span style={{ fontSize:11, color:"var(--text-dim)", fontWeight:600 }}>Q{current+1}</span>
        </div>

        <p className="q-text" style={{ fontSize:16, fontWeight:600, color:"var(--text)", lineHeight:1.65, marginBottom: q.code_snippet ? 16 : 22 }}>
          {q.question}
        </p>

        {q.code_snippet && (
          <div className="code-block" style={{ marginBottom:20 }}>{q.code_snippet}</div>
        )}

        <AnswerArea q={q} current={answers[current]} onAnswer={handleAnswer} />
      </div>

      {/* ── Nav ── */}
      <div className="quiz-nav" style={{ display:"flex", gap:9 }}>
        <button onClick={() => current>0 && go(current-1)} disabled={current===0} className="btn quiz-nav-btn"
          style={{
            background:"rgba(255,255,255,0.88)", border:"1.5px solid var(--border)",
            color: current===0 ? "var(--text-dim)" : "var(--text-mid)",
            padding:"13px 20px", borderRadius:50,
            fontSize:13, fontWeight:600,
            opacity: current===0 ? 0.4 : 1,
            cursor: current===0 ? "not-allowed" : "pointer",
            boxShadow:"var(--shadow-sm)",
          }}>
          ← Prev
        </button>

        <button onClick={handleSkip} className={`btn quiz-nav-btn ${doShake ? "skip-shake" : ""}`}
          style={{
            background:"rgba(255,255,255,0.88)", border:"1.5px solid var(--border)",
            color:"var(--amber)", padding:"13px 20px", borderRadius:50,
            fontSize:13, fontWeight:600, boxShadow:"var(--shadow-sm)",
          }}>
          Skip
        </button>

        <button onClick={() => { if(current<total-1) go(current+1); else onFinish(answers,skipped); }}
          className="btn quiz-nav-next"
          style={{
            flex:1,
            background: hasAns ? "linear-gradient(135deg,#ec4899,#f472b6)" : "rgba(255,255,255,0.72)",
            border:`1.5px solid ${hasAns ? "transparent" : "var(--border)"}`,
            color: hasAns ? "#fff" : "var(--text-dim)",
            padding:"13px 20px", borderRadius:50,
            fontSize:13, fontWeight:700,
            boxShadow: hasAns ? "0 5px 18px rgba(236,72,153,0.26)" : "none",
            transition:"all 0.22s ease",
          }}>
          {current===total-1 ? "Finish Quiz" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function AnswerArea({ q, current: currentAns, onAnswer }) {
  const [typed, setTyped] = useState(currentAns || "");
  useEffect(() => setTyped(currentAns || ""), [q]);

  if (q.type === "typed_fill") {
    return (
      <div>
        <input type="text" className="s-input" placeholder="Type your answer (1–4 words)…"
          value={typed} onChange={e => { setTyped(e.target.value); onAnswer(e.target.value); }} />
        <p style={{ marginTop:7, fontSize:11, color:"var(--text-dim)" }}>1–4 words</p>
      </div>
    );
  }

  const letters = ["A","B","C","D"];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      {q.options?.map((opt, i) => {
        const sel = currentAns === i;
        return (
          <button key={i} onClick={() => onAnswer(i)} className="option-btn btn"
            style={{
              background: sel ? "rgba(236,72,153,0.07)" : "rgba(255,255,255,0.62)",
              border:`1.5px solid ${sel ? "var(--pink-light)" : "var(--border)"}`,
              borderRadius:"var(--radius-md)",
              padding:"12px 15px",
              display:"flex", alignItems:"flex-start", gap:12,
              textAlign:"left",
              boxShadow: sel ? "0 3px 14px rgba(236,72,153,0.10)" : "none",
              transition:"all 0.18s ease",
            }}>
            <span style={{
              width:28, height:28, borderRadius:9, flexShrink:0,
              background: sel ? "linear-gradient(135deg,#ec4899,#f472b6)" : "rgba(244,114,182,0.15)",
              color: sel ? "#fff" : "var(--pink)",
              fontSize:11, fontWeight:800,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.18s ease",
            }}>
              {letters[i]}
            </span>
            <span className="opt-text" style={{
              color: sel ? "var(--text)" : "var(--text-mid)",
              fontSize:13.5, lineHeight:1.55, paddingTop:4,
              fontFamily:["syntax","output"].includes(q.type) ? "Courier New,monospace" : "var(--font)",
            }}>
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
function ResultsScreen({ questions, answers, skipped, onRestart }) {
  const total = questions.length;
  let correct = 0;
  questions.forEach((q, i) => {
    const ua = answers[i];
    if (ua === undefined) return;
    if (q.type === "typed_fill") {
      if (typeof ua === "string" && ua.trim().toLowerCase() === q.answer?.toString().toLowerCase()) correct++;
    } else {
      if (ua === q.answer) correct++;
    }
  });

  const skippedCount = skipped.size;
  const pct = Math.round((correct / total) * 100);
  const grade =
    pct>=85 ? { label:"Excellent!",    color:"#10b981", bg:"#f0fdf4", border:"#6ee7b7" }
    : pct>=70 ? { label:"Great Work!",  color:"var(--pink)", bg:"var(--pink-pale)", border:"rgba(244,114,182,0.38)" }
    : pct>=50 ? { label:"Keep Going!",  color:"var(--amber)", bg:"#fffbeb", border:"#fcd34d" }
    :           { label:"Keep Practicing", color:"#ef4444", bg:"#fff1f2", border:"#fca5a5" };

  return (
    <div className="screen-enter" className="screen-pad" style={{ maxWidth:660, margin:"0 auto", padding:"78px 22px 80px", position:"relative", zIndex:1 }}>

      {/* Score card */}
      <div style={{
        background: grade.bg,
        border:`1.5px solid ${grade.border}`,
        borderRadius:"var(--radius-xl)",
        padding:"36px 30px",
        textAlign:"center",
        marginBottom:20,
        boxShadow:`0 10px 36px ${grade.color}14`,
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${grade.color},transparent)` }} />

        <div className="score-pct" style={{ fontFamily:"var(--font)", fontSize:72, fontWeight:800, color:grade.color, lineHeight:1, marginBottom:6, letterSpacing:"-0.04em" }}>
          {pct}%
        </div>
        <div style={{ fontFamily:"var(--font)", fontSize:17, fontWeight:700, color:grade.color, marginBottom:22 }}>
          {grade.label}
        </div>

        <div className="results-stats" style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
          {[
            { label:"Correct",  val:correct,                    color:"#10b981" },
            { label:"Wrong",    val:total-skippedCount-correct, color:"#ef4444" },
            { label:"Skipped",  val:skippedCount,               color:"var(--amber)" },
            { label:"Total",    val:total,                      color:"var(--text-mid)" },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font)", fontSize:28, fontWeight:800, color:s.color, letterSpacing:"-0.03em" }}>{s.val}</div>
              <div style={{ fontSize:11, color:"var(--text-dim)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onRestart} className="cta-btn" style={{ width:"100%", padding:"16px", borderRadius:50, fontSize:14, marginBottom:28 }}>
        Practice Again →
      </button>

      {/* Review */}
      <div className="divider" style={{ marginBottom:16 }}>Question Review</div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {questions.map((q, i) => {
          const ua = answers[i];
          const wasSkipped = skipped.has(i) || ua === undefined;
          let isCorrect = false;
          if (!wasSkipped) {
            if (q.type === "typed_fill") isCorrect = typeof ua==="string" && ua.trim().toLowerCase()===q.answer?.toString().toLowerCase();
            else isCorrect = ua === q.answer;
          }

          const rowBg     = wasSkipped ? "rgba(255,255,255,0.65)" : isCorrect ? "#f0fdf4" : "#fff1f2";
          const rowBorder = wasSkipped ? "var(--border)"          : isCorrect ? "#6ee7b7" : "#fca5a5";
          const b         = badge(q.type);

          return (
            <div key={i} className="result-row" style={{
              animationDelay:`${i*0.04}s`,
              background:rowBg, border:`1.5px solid ${rowBorder}`,
              borderRadius:"var(--radius-lg)", padding:"18px 20px",
              boxShadow:"0 2px 10px rgba(0,0,0,0.03)",
            }}>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
                    <span style={{ fontSize:11, color:"var(--text-dim)", fontWeight:700 }}>Q{i+1}</span>
                    <span className="type-badge" style={{ background:b.bg, color:b.color, border:`1px solid ${b.border}` }}>{b.label}</span>
                  </div>
                  <p style={{ fontSize:14, color:"var(--text)", lineHeight:1.55, fontWeight:500 }}>{q.question}</p>
                </div>
                <span style={{ fontSize:20, flexShrink:0 }}>{wasSkipped ? "—" : isCorrect ? "✅" : "❌"}</span>
              </div>

              {q.code_snippet && <div className="code-block" style={{ marginBottom:10, fontSize:12 }}>{q.code_snippet}</div>}

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {/* User answer */}
                {!wasSkipped && (
                  <div style={{
                    display:"flex", alignItems:"flex-start", gap:9,
                    padding:"9px 13px", borderRadius:10,
                    background: isCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.07)",
                    border:`1px solid ${isCorrect ? "#6ee7b7" : "#fca5a5"}`,
                  }}>
                    <span style={{ fontSize:10, fontWeight:700, color: isCorrect ? "#10b981" : "#ef4444", flexShrink:0, paddingTop:1, letterSpacing:"0.05em" }}>
                      {isCorrect ? "YOUR ANSWER ✓" : "YOUR ANSWER ✗"}
                    </span>
                    <span style={{ fontSize:13, color: isCorrect ? "#10b981" : "#ef4444", fontFamily:["syntax","output"].includes(q.type)?"Courier New":"var(--font)" }}>
                      {q.type==="typed_fill" ? ua : q.options?.[ua]}
                    </span>
                  </div>
                )}

                {/* Correct answer (only if wrong or skipped) */}
                {(!isCorrect || wasSkipped) && (
                  <div style={{
                    display:"flex", alignItems:"flex-start", gap:9,
                    padding:"9px 13px", borderRadius:10,
                    background:"rgba(16,185,129,0.07)",
                    border:"1px solid #6ee7b7",
                  }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#10b981", flexShrink:0, paddingTop:1, letterSpacing:"0.05em" }}>CORRECT ANSWER</span>
                    <span style={{ fontSize:13, color:"#10b981", fontFamily:["syntax","output"].includes(q.type)?"Courier New":"var(--font)" }}>
                      {q.type==="typed_fill" ? q.answer : q.options?.[q.answer]}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div style={{
                    fontSize:12, color:"var(--text-mid)", lineHeight:1.6,
                    padding:"8px 13px", borderRadius:10,
                    background:"rgba(255,255,255,0.75)", border:"1px solid var(--border)",
                  }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ERROR ────────────────────────────────────────────────────────────────────
function ErrorScreen({ error, onRetry }) {
  return (
    <div className="screen-enter" style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:24, textAlign:"center", zIndex:1, position:"relative", gap:18,
    }}>
      <div style={{ width:64, height:64, borderRadius:20, background:"#fff1f2", border:"1.5px solid #fca5a5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow:"0 4px 16px rgba(239,68,68,0.12)" }}>⚠️</div>
      <div>
        <p style={{ fontFamily:"var(--font)", fontSize:18, fontWeight:700, color:"#ef4444", marginBottom:8 }}>Something went wrong</p>
        <p style={{ fontSize:12, color:"var(--text-mid)", maxWidth:380, lineHeight:1.65, background:"rgba(255,255,255,0.8)", padding:"10px 16px", borderRadius:12, border:"1px solid var(--border)" }}>{error}</p>
      </div>
      <button onClick={onRetry} className="cta-btn" style={{ padding:"12px 32px", borderRadius:50, fontSize:13 }}>
        ← Try Again
      </button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();

  const [screen, setScreen]     = useState("welcome");
  const [config, setConfig]     = useState({ language:"", mode:"", count:10, difficulty:"intermediate" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [skipped, setSkipped]   = useState(new Set());
  const [error, setError]       = useState(null);

  const FLOW = ["welcome","language","mode","config"];
  function goBack() { const i = FLOW.indexOf(screen); if (i>0) setScreen(FLOW[i-1]); }

  async function startQuiz({ count, difficulty }) {
    const cfg = { ...config, count, difficulty };
    setConfig(cfg); setScreen("loading"); setError(null);
    try {
      const qs = await fetchQuestions(cfg);
      setQuestions(qs); setAnswers({}); setSkipped(new Set()); setScreen("quiz");
    } catch(e) {
      setError(e.message); setScreen("error");
    }
  }

  function restart() {
    setScreen("welcome");
    setConfig({ language:"", mode:"", count:10, difficulty:"intermediate" });
    setQuestions([]); setAnswers({}); setSkipped(new Set()); setError(null);
  }

  const showBar = !["welcome","loading","quiz","results","error"].includes(screen);

  return (
    <div style={{ position:"relative", minHeight:"100vh" }}>
      {showBar && <TopBar screen={screen} onBack={goBack} config={config} />}

      {screen==="welcome"  && <WelcomeScreen onStart={() => setScreen("language")} />}
      {screen==="language" && <LanguageScreen onSelect={lang => { setConfig(c=>({...c,language:lang})); setScreen("mode"); }} />}
      {screen==="mode"     && <ModeScreen onSelect={mode => { setConfig(c=>({...c,mode})); setScreen("config"); }} />}
      {screen==="config"   && <ConfigScreen language={config.language} mode={config.mode} onStart={startQuiz} />}
      {screen==="loading"  && <LoadingScreen language={config.language} count={config.count} />}
      {screen==="quiz"     && questions.length>0 && <QuizScreen questions={questions} onFinish={(a,s)=>{ setAnswers(a); setSkipped(s); setScreen("results"); }} />}
      {screen==="results"  && <ResultsScreen questions={questions} answers={answers} skipped={skipped} config={config} onRestart={restart} />}
      {screen==="error"    && <ErrorScreen error={error} onRetry={() => setScreen("config")} />}
    </div>
  );
}
