import fs from "node:fs";

// Ensure profile directories exist
fs.mkdirSync("profile", { recursive: true });
if (fs.existsSync("SaptarshiCodes")) {
  fs.mkdirSync("SaptarshiCodes/profile", { recursive: true });
}

// Load stats snapshot if available
let stats = {};
for (const p of ["stats.json", "SaptarshiCodes/stats.json"]) {
  if (fs.existsSync(p)) {
    try {
      stats = JSON.parse(fs.readFileSync(p, "utf8"));
      break;
    } catch {}
  }
}

// ============================================================
// SHARED DESIGN SYSTEM (matches GitHub dark #0d1117 background)
// ============================================================
const DARK = {
  bg: "#0d1117",
  border: "#30363d",
  text0: "#F7F3EA",
  text1: "#AAA8B4",
  text2: "#7D8590",
  lineBg: "#161b22",
  accent: "#F08A5B",
  accentGold: "#FFA116",
  green: "#00E676",
  font: `ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace`,
  sansFont: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
};

const LIGHT = {
  bg: "#FFFFFF",
  border: "#D8DCE5",
  text0: "#1F2328",
  text1: "#57606A",
  text2: "#8C959F",
  lineBg: "#F6F8FA",
  accent: "#E05C3A",
  accentGold: "#D97706",
  green: "#10B981",
  font: `ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace`,
  sansFont: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
};

// Card dimensions for CP cards (widescreen 650x220, matching activity cards)
const W = 650;
const H = 220;

// ============================================================
// SVG SHELL FOR CP CARDS
// ============================================================
function shell(theme, inner) {
  const { bg, border } = theme;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${border}"/>
  ${inner}
</svg>`;
}

// ============================================================
// STAT BLOCK (label + value)
// ============================================================
function statBlock(theme, x, y, label, value, valueColor) {
  const { text0, text1, font } = theme;
  const vc = valueColor || text0;
  return `
  <text x="${x}" y="${y}" fill="${text1}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.5">${label}</text>
  <text x="${x}" y="${y + 20}" fill="${vc}" font-family="${font}" font-size="20" font-weight="700">${value}</text>`;
}

// ============================================================
// PROGRESS BAR
// ============================================================
function progressBar(theme, x, y, w, pct, color) {
  const { lineBg } = theme;
  const filled = Math.min(Math.max(pct, 0), 1) * w;
  return `
  <rect x="${x}" y="${y}" width="${w}" height="5" fill="${lineBg}"/>
  <rect x="${x}" y="${y}" width="${filled.toFixed(1)}" height="5" fill="${color}"/>`;
}

// ============================================================
// DONUT RING
// ============================================================
function donut(cx, cy, r, pct, color, trackColor, strokeW) {
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(Math.max(pct, 0), 1);
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${strokeW}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
          stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}"
          transform="rotate(-90 ${cx} ${cy})"/>`;
}

// ============================================================
// HEADER ROW
// ============================================================
function header(theme, iconSvg, handle, platformLabel, platformColor) {
  const { text0, border, font } = theme;
  const pColor = platformColor || theme.accent;
  return `
  <!-- Icon -->
  <g transform="translate(20, 15)">${iconSvg}</g>
  <!-- Handle -->
  <text x="54" y="34" fill="${text0}" font-family="${font}" font-size="14" font-weight="700">${handle}</text>
  <!-- Platform label -->
  <text x="${W - 20}" y="34" text-anchor="end" fill="${pColor}" font-family="${font}" font-size="9" font-weight="700" letter-spacing="0.6">${platformLabel}</text>
  <!-- Divider -->
  <line x1="20" y1="52" x2="${W - 20}" y2="52" stroke="${border}" stroke-width="0.8"/>`;
}

// ============================================================
// PLATFORM ICONS
// ============================================================
function lcIcon() {
  const path = `M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z`;
  return `<g transform="scale(0.92)"><path d="${path}" fill="#FFA116"/></g>`;
}

function cfIcon() {
  return `<rect x="0" y="8" width="5" height="13" rx="1" fill="#FFC107"/>
  <rect x="8" y="0" width="5" height="21" rx="1" fill="#2196F3"/>
  <rect x="16" y="4" width="5" height="17" rx="1" fill="#F44336"/>`;
}

function ccIcon() {
  const path = `M12 0C8.656 0 5.6 2.219 4.5 5.5H2.25C1.007 5.5 0 6.507 0 7.75v.5C0 9.493 1.007 10.5 2.25 10.5h.287A8.009 8.009 0 0 0 2.5 11a8 8 0 0 0 1.117 4.062c-.07.248-.117.502-.117.771 0 1.489 1.231 2.703 2.75 2.703.388 0 .756-.082 1.09-.227A8.045 8.045 0 0 0 12 19a8.045 8.045 0 0 0 4.66-1.691c.334.145.702.228 1.09.228 1.519 0 2.75-1.214 2.75-2.703 0-.27-.047-.524-.117-.772A8 8 0 0 0 21.5 11a8.016 8.016 0 0 0-.037-.5h.287C22.993 10.5 24 9.493 24 8.25v-.5C24 6.507 22.993 5.5 21.75 5.5H19.5C18.4 2.219 15.344 0 12 0zm0 2a6 6 0 0 1 5.916 5H6.084A6 6 0 0 1 12 2zM4.5 7h15v.25a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V7zm0 2.5h15A6 6 0 0 1 18 11a6 6 0 0 1-12 0 6 6 0 0 1-1.5-1.5zm5.5 3v3h4v-3h-4z`;
  return `<g transform="scale(0.92)"><path d="${path}" fill="#5B4638"/></g>`;
}

function atIcon(theme) {
  const strokeColor = theme.text0;
  return `<polygon points="11,1 21,21 1,21" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="11" y="16.5" text-anchor="middle" fill="${strokeColor}" font-family="monospace" font-size="8" font-weight="700">AC</text>`;
}

// ============================================================
// 0. FULL-WIDTH HERO BANNER  —  1000 × 380 (taller, bolder, clearer hierarchy)
// ============================================================
const ALL_TECH_STACK = [
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "C++",
  "Python",
  "Java",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Tailwind CSS",
  "Git",
  "Linux"
];

function generateIntroCard(isDark) {
  const theme = isDark ? DARK : LIGHT;
  const { bg, border, text0, text1, text2, lineBg, accent, accentGold, green, font, sansFont } = theme;

  const introW = 1000;
  const introH = 380; // Taller canvas — room for bigger type & breathing space

  // OptionWheel geometry (centred at owCY = 215)
  const owCY   = 215;        // active slot baseline Y
  const owS1   = owCY - 44; // slot ±1
  const owS2   = owCY - 88; // slot ±2
  const owHide = owCY - 130; // hidden sentinel
  const owS1b  = owCY + 44;
  const owS2b  = owCY + 88;
  const owHidB = owCY + 130;
  const owX    = 752;        // wheel X anchor

  const N        = ALL_TECH_STACK.length;
  const stepSec  = 2;
  const totalSec = N * stepSec;
  const stepPct  = 100 / N;
  const holdPct  = stepPct * 0.65;

  let kf = "";
  kf += `        0%, ${holdPct.toFixed(2)}% {\n          transform: translate(${owX}px, ${owCY}px) rotate(0deg);\n          opacity: 1;\n          fill: ${accentGold};\n        }\n`;
  kf += `        ${stepPct.toFixed(2)}%, ${(stepPct+holdPct).toFixed(2)}% {\n          transform: translate(${owX+18}px, ${owS1}px) rotate(7deg);\n          opacity: 0.65;\n          fill: ${text1};\n        }\n`;
  kf += `        ${(stepPct*2).toFixed(2)}%, ${(stepPct*2+holdPct).toFixed(2)}% {\n          transform: translate(${owX+48}px, ${owS2}px) rotate(15deg);\n          opacity: 0.25;\n          fill: ${text2};\n        }\n`;
  kf += `        ${(stepPct*3).toFixed(2)}% {\n          transform: translate(${owX+78}px, ${owHide}px) rotate(22deg);\n          opacity: 0;\n        }\n`;
  kf += `        ${(stepPct*(N-3)).toFixed(2)}% {\n          transform: translate(${owX+78}px, ${owHidB}px) rotate(-22deg);\n          opacity: 0;\n        }\n`;
  kf += `        ${(stepPct*(N-2)).toFixed(2)}%, ${(stepPct*(N-2)+holdPct).toFixed(2)}% {\n          transform: translate(${owX+48}px, ${owS2b}px) rotate(-15deg);\n          opacity: 0.25;\n          fill: ${text2};\n        }\n`;
  kf += `        ${(stepPct*(N-1)).toFixed(2)}%, ${(stepPct*(N-1)+holdPct).toFixed(2)}% {\n          transform: translate(${owX+18}px, ${owS1b}px) rotate(-7deg);\n          opacity: 0.65;\n          fill: ${text1};\n        }\n`;
  kf += `        100% {\n          transform: translate(${owX}px, ${owCY}px) rotate(0deg);\n          opacity: 1;\n          fill: ${accentGold};\n        }\n`;

  const itemsCss = ALL_TECH_STACK.map((_, i) => {
    const delay = -((N - i) % N * stepSec);
    return `.ow-${i} { animation-delay: ${delay}s; }`;
  }).join("\n      ");

  const itemsSvg = ALL_TECH_STACK.map((skill, i) =>
    `<g class="ow-item ow-${i}"><text x="0" y="4">${skill}</text></g>`
  ).join("\n  ");

  const hiddenSelectors = ALL_TECH_STACK.slice(3, N - 2)
    .map((_, idx) => `.ow-${idx + 3}`).join(", ");

  // --- Layout Y positions (left column) ---
  const statusY  = 36;   // status bar baseline
  const divY1    = 54;   // top horizontal rule
  const nameY    = 124;  // H1: name (font-size 64)
  const roleY    = 188;  // H2: role typewriter (font-size 20 — generous space below name)
  const accrY    = 226;  // H3: academic block top
  const bodyY1   = 320;  // body tagline 1
  const bodyY2   = 348;  // body tagline 2
  const divY2    = 370;  // bottom guard / wheel boundary

  return `<svg width="${introW}" height="${introH}" viewBox="0 0 ${introW} ${introH}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      <![CDATA[
      @keyframes blinkCursor {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      @keyframes pulseRadar {
        0% { r: 4; opacity: 0.9; }
        50% { r: 9; opacity: 0.12; }
        100% { r: 4; opacity: 0.9; }
      }
      @keyframes cycleRole1 {
        0%, 29% { opacity: 1; transform: translateY(0); }
        33%, 100% { opacity: 0; transform: translateY(6px); }
      }
      @keyframes cycleRole2 {
        0%, 29% { opacity: 0; transform: translateY(-6px); }
        33%, 62% { opacity: 1; transform: translateY(0); }
        66%, 100% { opacity: 0; transform: translateY(6px); }
      }
      @keyframes cycleRole3 {
        0%, 62% { opacity: 0; transform: translateY(-6px); }
        66%, 95% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(6px); }
      }
      @keyframes shapeGridDrift {
        0% { transform: translate(0px, 0px); }
        100% { transform: translate(36px, -36px); }
      }
      @keyframes cellTwinkleA { 0%, 100% { opacity: 0; } 50% { opacity: 0.45; } }
      @keyframes cellTwinkleB { 0%, 100% { opacity: 0; } 50% { opacity: 0.35; } }
      .shape-grid-drift { animation: shapeGridDrift 20s linear infinite; }
      .twinkle-a { animation: cellTwinkleA 6s ease-in-out infinite; }
      .twinkle-b { animation: cellTwinkleB 8.5s ease-in-out infinite 2s; }

      @keyframes optionWheelMoveRight {
${kf}      }
      .cursor      { animation: blinkCursor 1s infinite; }
      .radar-wave  { animation: pulseRadar 2.2s infinite ease-in-out; }
      .r-1 { animation: cycleRole1 9s infinite; }
      .r-2 { animation: cycleRole2 9s infinite; }
      .r-3 { animation: cycleRole3 9s infinite; }
      .ow-item {
        animation: optionWheelMoveRight ${totalSec}s infinite cubic-bezier(0.25, 1, 0.5, 1);
        transform-origin: 0px 0px;
      }
      .ow-item text {
        font-family: ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
      ${itemsCss}
      @media (prefers-reduced-motion: reduce) {
        .cursor,.radar-wave,.ow-item,.shape-grid-drift,.twinkle-a,.twinkle-b { animation: none !important; }
        .r-1 { opacity: 1 !important; transform: none !important; animation: none !important; }
        .r-2, .r-3 { display: none !important; }
        .ow-0 { transform: translate(${owX}px, ${owCY}px) rotate(0deg) !important; opacity: 1 !important; fill: ${accentGold} !important; }
        .ow-1 { transform: translate(${owX+18}px, ${owS1b}px) rotate(-7deg) !important; opacity: 0.65 !important; fill: ${text1} !important; }
        .ow-2 { transform: translate(${owX+48}px, ${owS2b}px) rotate(-15deg) !important; opacity: 0.25 !important; fill: ${text2} !important; }
        .ow-${N-1} { transform: translate(${owX+18}px, ${owS1}px) rotate(7deg) !important; opacity: 0.65 !important; fill: ${text1} !important; }
        .ow-${N-2} { transform: translate(${owX+48}px, ${owS2}px) rotate(15deg) !important; opacity: 0.25 !important; fill: ${text2} !important; }
        ${hiddenSelectors} { display: none !important; }
      }
      ]]>
    </style>

    <linearGradient id="heroAccent_${isDark?'dark':'light'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${accent}"    stop-opacity="0.95"/>
      <stop offset="50%"  stop-color="${accentGold}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${accent}"    stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="wheelFade_${isDark?'dark':'light'}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="${bg}" stop-opacity="1"/>
      <stop offset="18%"  stop-color="${bg}" stop-opacity="0"/>
      <stop offset="82%"  stop-color="${bg}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="1"/>
    </linearGradient>
    <pattern id="shapeGrid_${isDark?'dark':'light'}" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="${isDark?'#161b22':'#E6EBF2'}" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="1.2" fill="${isDark?'#21262d':'#D0D7DE'}"/>
    </pattern>
    <radialGradient id="gridFadeMask_${isDark?'dark':'light'}" cx="50%" cy="50%" r="65%">
      <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="55%"  stop-color="#FFFFFF" stop-opacity="0.5"/>
      <stop offset="90%"  stop-color="#FFFFFF" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <mask id="shapeGridMask_${isDark?'dark':'light'}">
      <rect width="${introW}" height="${introH}" fill="url(#gridFadeMask_${isDark?'dark':'light'})"/>
    </mask>
  </defs>

  <!-- Background -->
  <rect width="${introW}" height="${introH}" fill="${bg}"/>

  <!-- ShapeGrid drifting layer -->
  <g mask="url(#shapeGridMask_${isDark?'dark':'light'})" pointer-events="none">
    <g class="shape-grid-drift">
      <rect x="-72" y="-72" width="1144" height="524" fill="url(#shapeGrid_${isDark?'dark':'light'})"/>
    </g>
    <rect x="216"  y="90"  width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.18" stroke="${accentGold}" stroke-width="0.8" class="twinkle-a"/>
    <rect x="504"  y="195" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.15" stroke="${accentGold}" stroke-width="0.8" class="twinkle-b"/>
    <rect x="108"  y="250" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.12" stroke="${accentGold}" stroke-width="0.8" class="twinkle-a"/>
    <rect x="756"  y="90"  width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.15" stroke="${accentGold}" stroke-width="0.8" class="twinkle-b"/>
    <rect x="864"  y="300" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.14" stroke="${accentGold}" stroke-width="0.8" class="twinkle-a"/>
  </g>

  <!-- Card border -->
  <rect x="0.5" y="0.5" width="${introW-1}" height="${introH-1}" fill="none" stroke="${border}"/>
  <!-- Top accent line -->
  <line x1="0" y1="1" x2="${introW}" y2="1" stroke="url(#heroAccent_${isDark?'dark':'light'})" stroke-width="3"/>

  <!-- ── STATUS BAR ─────────────────────────── -->
  <g transform="translate(32, ${statusY-8})">
    <circle cx="5" cy="5" r="4"   fill="${green}" class="radar-wave"/>
    <circle cx="5" cy="5" r="3.5" fill="${green}"/>
    <text x="20" y="9" fill="${text1}" font-family="${font}" font-size="9.5" font-weight="700" letter-spacing="0.7">ACTIVE STATUS · BE IT&#39;28 @ JADAVPUR UNIVERSITY</text>
  </g>
  <text x="968" y="${statusY}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="9.5" font-weight="600" letter-spacing="0.5">KOLKATA, INDIA · UTC+5:30</text>
  <line x1="32" y1="${divY1}" x2="968" y2="${divY1}" stroke="${border}" stroke-width="0.8"/>

  <!-- ── H1: NAME (64px — bold & eye-catching) ──── -->
  <text x="32" y="${nameY}"
    fill="${text0}"
    font-family="${sansFont}"
    font-size="64"
    font-weight="800"
    letter-spacing="-0.03em">Saptarshi Manna</text>

  <!-- ── H2: ANIMATED ROLE (20px) ──────────── -->
  <g transform="translate(32, ${roleY})">
    <text x="0" y="0" fill="${text1}" font-family="${font}" font-size="20" font-weight="400">&gt; </text>
    <g transform="translate(28, 0)">
      <g class="r-1">
        <text x="0" y="0" fill="${accent}" font-family="${font}" font-size="20" font-weight="700">Software Developer</text>
        <text x="236" y="0" fill="${accentGold}" font-family="${font}" font-size="20" font-weight="700" class="cursor">|</text>
      </g>
      <g class="r-2">
        <text x="0" y="0" fill="${accent}" font-family="${font}" font-size="20" font-weight="700">Full-Stack Engineer</text>
        <text x="224" y="0" fill="${accentGold}" font-family="${font}" font-size="20" font-weight="700" class="cursor">|</text>
      </g>
      <g class="r-3">
        <text x="0" y="0" fill="${accent}" font-family="${font}" font-size="20" font-weight="700">Competitive Programmer</text>
        <text x="274" y="0" fill="${accentGold}" font-family="${font}" font-size="20" font-weight="700" class="cursor">|</text>
      </g>
    </g>
  </g>

  <!-- ── H3: ACADEMIC CREDENTIALS (20/17px) ── -->
  <g transform="translate(32, ${accrY})">
    <rect x="0" y="0" width="5" height="58" rx="2.5" fill="${accent}"/>
    <text x="20" y="22" fill="${text0}" font-family="${sansFont}" font-size="20" font-weight="700">Bachelor of Engineering · Information Technology</text>
    <text x="20" y="48" fill="${text1}" font-family="${sansFont}" font-size="17" font-weight="500">Jadavpur University, Kolkata · <tspan fill="${accent}" font-family="${font}" font-weight="700">BE IT&#39;28</tspan></text>
  </g>

  <!-- ── BODY COPY (16/15px) ───────────────── -->
  <text x="32" y="${bodyY1}" fill="${text1}" font-family="${sansFont}" font-size="16" font-weight="400">Architecting scalable systems and solving complex algorithmic challenges.</text>
  <text x="32" y="${bodyY2}" fill="${text2}" font-family="${sansFont}" font-size="15" font-weight="400">Active across LeetCode · Codeforces · CodeChef</text><!-- · AtCoder -->

  <!-- ── VERTICAL DIVIDER ────────────────── -->
  <line x1="640" y1="${divY1}" x2="640" y2="${divY2}" stroke="${border}" stroke-width="0.8"/>

  <!-- ── RIGHT: OPTION WHEEL ───────────────── -->
  <text x="664" y="72" fill="${accent}" font-family="${font}" font-size="10" font-weight="700" letter-spacing="0.9">CORE TECH STACK · OPTION WHEEL</text>
  <circle cx="874" cy="69" r="3.5" fill="${accentGold}"/>
  <path d="M 950 ${owS2} A 170 170 0 0 0 950 ${owS2b}" fill="none" stroke="${border}" stroke-width="1" stroke-dasharray="2 3"/>

  <!-- Active slot highlight box centred at owCY -->
  <rect x="664" y="${owCY-22}" width="314" height="44" rx="7" fill="${lineBg}" stroke="${accent}" stroke-width="1.4" stroke-opacity="0.85"/>
  <polygon points="676,${owCY} 684,${owCY-7} 684,${owCY+7}" fill="${accentGold}"/>
  <text x="694" y="${owCY+4}" fill="${accentGold}" font-family="${font}" font-size="9.5" font-weight="700" letter-spacing="0.6">ACTIVE</text>
  <line x1="740" y1="${owCY-14}" x2="740" y2="${owCY+14}" stroke="${border}" stroke-width="1"/>

  ${itemsSvg}

  <!-- Wheel fade mask -->
  <rect x="664" y="${divY1}" width="314" height="${divY2-divY1}" fill="url(#wheelFade_${isDark?'dark':'light'})" pointer-events="none"/>
</svg>`;
}

// ============================================================
// 1. LEETCODE CARD GENERATOR
// ============================================================
function generateLeetcodeCard(isDark) {
  const theme = isDark ? DARK : LIGHT;
  const { text0, text1, text2, lineBg, font } = theme;
  const d = stats.leetcode || {};

  const rating = Math.round(d.rating ?? 1769);
  const contestRank = d.contestRank ? `#${Number(d.contestRank).toLocaleString()}` : "#86,584";
  const globalRank = d.rank ? `#${Number(d.rank).toLocaleString()}` : "#529,846";
  const solved = Math.round(d.solved ?? 302);
  const easy = Math.round(d.easy ?? 121);
  const medium = Math.round(d.medium ?? 148);
  const hard = Math.round(d.hard ?? 33);

  const brand = "#FFA116";
  const easyColor = "#00B8A3";
  const medColor = "#FFC01E";
  const hardColor = "#FF375F";

  const donutPct = rating / 2400;
  const cx = 82, cy = 132, donutR = 50, donutSW = 8.5;

  const barW = 440;
  const easyW = (easy / solved) * barW;
  const medW = (medium / solved) * barW;
  const hardW = barW - easyW - medW;

  const inner = `
  ${header(theme, lcIcon(), "saptarshi_codes", "LEETCODE", brand)}

  <!-- Left: Donut ring (Large Rank Pie Chart) -->
  ${donut(cx, cy, donutR, donutPct, brand, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="20" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="9" font-weight="650" letter-spacing="0.4">RATING</text>
  <text x="${cx}" y="${cy + 27}" text-anchor="middle" fill="${brand}" font-family="${font}" font-size="11" font-weight="700">TOP 16.5%</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 175, 72, "CONTEST RANK", contestRank)}
  ${statBlock(theme, 385, 72, "GLOBAL RANK", globalRank)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 175, 122, "SOLVED PROBLEMS", `${solved}`)}
  <g transform="translate(385, 122)">
    <text x="0" y="0" fill="${text1}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.5">DIFFICULTY BREAKDOWN</text>
    <text x="0" y="20" fill="${easyColor}" font-family="${font}" font-size="12" font-weight="700">${easy} <tspan fill="${text2}" font-size="9" font-weight="500">EASY</tspan></text>
    <text x="80" y="20" fill="${medColor}" font-family="${font}" font-size="12" font-weight="700">${medium} <tspan fill="${text2}" font-size="9" font-weight="500">MED</tspan></text>
    <text x="160" y="20" fill="${hardColor}" font-family="${font}" font-size="12" font-weight="700">${hard} <tspan fill="${text2}" font-size="9" font-weight="500">HARD</tspan></text>
  </g>

  <!-- Segmented Progress Bar -->
  <text x="175" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">SOLVED RATIO: ${Math.round(easy/solved*100)}% EASY · ${Math.round(medium/solved*100)}% MEDIUM · ${Math.round(hard/solved*100)}% HARD</text>
  <g transform="translate(175, 172)">
    <rect x="0" y="0" width="${barW}" height="5" fill="${lineBg}"/>
    <rect x="0" y="0" width="${easyW.toFixed(1)}" height="5" fill="${easyColor}"/>
    <rect x="${easyW.toFixed(1)}" y="0" width="${medW.toFixed(1)}" height="5" fill="${medColor}"/>
    <rect x="${(easyW + medW).toFixed(1)}" y="0" width="${hardW.toFixed(1)}" height="5" fill="${hardColor}"/>
  </g>

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">leetcode.com/u/saptarshi_codes</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">302 PROBLEMS SOLVED</text>`;

  return shell(theme, inner);
}

// ============================================================
// 2. CODEFORCES CARD GENERATOR (Without rating graph)
// ============================================================
function generateCodeforcesCard(isDark) {
  const theme = isDark ? DARK : LIGHT;
  const { text0, text1, text2, lineBg, font } = theme;
  const d = stats.codeforces || {};

  const rating = d.rating ?? 1318;
  const maxRating = d.maxRating ?? 1383;
  const rank = (d.rank ?? "pupil").toUpperCase();
  const solved = d.solved ?? 48;
  const contests = 12;

  const pupilColor = "#77C500";
  const brand = "#1F8ACB";

  const tierMin = 1200, tierMax = 1400;
  const tierPct = (rating - tierMin) / (tierMax - tierMin);

  const donutPct = rating / 2000;
  const cx = 82, cy = 132, donutR = 50, donutSW = 8.5;

  const inner = `
  ${header(theme, cfIcon(), "Saptarshi_codes", "CODEFORCES", brand)}

  <!-- Left: Donut ring (Large Rank Pie Chart) -->
  ${donut(cx, cy, donutR, donutPct, pupilColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="20" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="9" font-weight="650" letter-spacing="0.4">RATING</text>
  <text x="${cx}" y="${cy + 27}" text-anchor="middle" fill="${pupilColor}" font-family="${font}" font-size="11" font-weight="700">${rank}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 175, 72, "MAX RATING", `${maxRating}`)}
  ${statBlock(theme, 385, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 175, 122, "RATED CONTESTS", `${contests}`)}
  ${statBlock(theme, 385, 122, "CURRENT RANK", rank, pupilColor)}

  <!-- Tier Progress Bar -->
  <text x="175" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">PUPIL TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 175, 172, 440, tierPct, pupilColor)}

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">codeforces.com/profile/Saptarshi_codes</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">PEAK ${maxRating}</text>`;

  return shell(theme, inner);
}

// ============================================================
// 3. CODECHEF CARD GENERATOR
// ============================================================
function generateCodechefCard(isDark) {
  const theme = isDark ? DARK : LIGHT;
  const { text0, text1, text2, lineBg, font } = theme;
  const d = stats.codechef || {};

  const rating = d.rating ?? 1445;
  const highestRating = d.maxRating ?? 1445;
  const stars = d.stars ?? "2★";
  const globalRank = d.rank ? `#${Number(d.rank).toLocaleString()}` : "#33,837";
  const countryRank = d.countryRank ? `#${Number(d.countryRank).toLocaleString()}` : "#32,161";
  const solved = d.solved ?? 14;

  const tierMin = 1401, tierMax = 1600;
  const tierPct = (rating - tierMin) / (tierMax - tierMin);
  const tierColor = "#6BCFCF";
  const brand = "#5B4638";

  const donutPct = rating / 2000;
  const cx = 82, cy = 132, donutR = 50, donutSW = 8.5;

  const inner = `
  ${header(theme, ccIcon(), "saptarshi010", "CODECHEF", brand)}

  <!-- Left: Donut ring (Large Rank Pie Chart) -->
  ${donut(cx, cy, donutR, donutPct, tierColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="20" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="9" font-weight="650" letter-spacing="0.4">RATING</text>
  <text x="${cx}" y="${cy + 27}" text-anchor="middle" fill="${tierColor}" font-family="${font}" font-size="12" font-weight="700">${stars}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 175, 72, "HIGHEST RATING", `${highestRating}`)}
  ${statBlock(theme, 385, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 175, 122, "GLOBAL RANK", globalRank)}
  ${statBlock(theme, 385, 122, "INDIA RANK", countryRank)}

  <!-- Tier Progress Bar -->
  <text x="175" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">2★ TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 175, 172, 440, tierPct, tierColor)}

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">codechef.com/users/saptarshi010</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">DIVISION 3</text>`;

  return shell(theme, inner);
}

// ============================================================
// 4. ATCODER CARD GENERATOR
// ============================================================
function generateAtCoderCard(isDark) {
  const theme = isDark ? DARK : LIGHT;
  const { text0, text1, text2, lineBg, font } = theme;
  const d = stats.atcoder || {};

  const rating = d.rating ?? 80;
  const maxRating = d.maxRating ?? 80;
  const rank = d.rank ? `#${Number(d.rank).toLocaleString()}` : "#414,821";
  const solved = d.solved ?? 4;
  const contests = 1;
  const tier = "GRAY";

  const tierMin = 0, tierMax = 400;
  const tierPct = (rating - tierMin) / (tierMax - tierMin);
  const tierColor = "#808080";
  const brand = "#00A0E9";

  const donutPct = rating / tierMax;
  const cx = 82, cy = 132, donutR = 50, donutSW = 8.5;

  const inner = `
  ${header(theme, atIcon(theme), "SaptarshiCodes", "ATCODER", brand)}

  <!-- Left: Donut ring (Large Rank Pie Chart) -->
  ${donut(cx, cy, donutR, donutPct, tierColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="20" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="9" font-weight="650" letter-spacing="0.4">RATING</text>
  <text x="${cx}" y="${cy + 27}" text-anchor="middle" fill="${tierColor}" font-family="${font}" font-size="11" font-weight="700">${tier}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 175, 72, "MAX RATING", `${maxRating}`)}
  ${statBlock(theme, 385, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 175, 122, "GLOBAL AC RANK", rank)}
  ${statBlock(theme, 385, 122, "RATED CONTESTS", `${contests}`)}

  <!-- Tier Progress Bar -->
  <text x="175" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">GRAY TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 175, 172, 440, tierPct, tierColor)}

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">atcoder.jp/users/SaptarshiCodes</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">PEAK ${maxRating}</text>`;

  return shell(theme, inner);
}

// ============================================================
// MAIN GENERATION
// ============================================================
function main() {
  console.log("Generating animated full-width hero cards...");
  const introDark = generateIntroCard(true);
  const introLight = generateIntroCard(false);
  fs.writeFileSync("profile/intro-card-dark.svg", introDark);
  fs.writeFileSync("profile/intro-card-light.svg", introLight);
  if (fs.existsSync("SaptarshiCodes/profile")) {
    fs.writeFileSync("SaptarshiCodes/profile/intro-card-dark.svg", introDark);
    fs.writeFileSync("SaptarshiCodes/profile/intro-card-light.svg", introLight);
  }

  console.log("Generating LeetCode cards (#0d1117)...");
  const lcDark = generateLeetcodeCard(true);
  const lcLight = generateLeetcodeCard(false);
  fs.writeFileSync("profile/cp-leetcode-dark.svg", lcDark);
  fs.writeFileSync("profile/cp-leetcode-light.svg", lcLight);
  if (fs.existsSync("SaptarshiCodes/profile")) {
    fs.writeFileSync("SaptarshiCodes/profile/cp-leetcode-dark.svg", lcDark);
    fs.writeFileSync("SaptarshiCodes/profile/cp-leetcode-light.svg", lcLight);
  }

  console.log("Generating Codeforces cards (#0d1117, no rating graph)...");
  const cfDark = generateCodeforcesCard(true);
  const cfLight = generateCodeforcesCard(false);
  fs.writeFileSync("profile/cp-codeforces-dark.svg", cfDark);
  fs.writeFileSync("profile/cp-codeforces-light.svg", cfLight);
  if (fs.existsSync("SaptarshiCodes/profile")) {
    fs.writeFileSync("SaptarshiCodes/profile/cp-codeforces-dark.svg", cfDark);
    fs.writeFileSync("SaptarshiCodes/profile/cp-codeforces-light.svg", cfLight);
  }

  console.log("Generating CodeChef cards (#0d1117)...");
  const ccDark = generateCodechefCard(true);
  const ccLight = generateCodechefCard(false);
  fs.writeFileSync("profile/cp-codechef-dark.svg", ccDark);
  fs.writeFileSync("profile/cp-codechef-light.svg", ccLight);
  if (fs.existsSync("SaptarshiCodes/profile")) {
    fs.writeFileSync("SaptarshiCodes/profile/cp-codechef-dark.svg", ccDark);
    fs.writeFileSync("SaptarshiCodes/profile/cp-codechef-light.svg", ccLight);
  }

  /*
  console.log("Generating AtCoder cards (#0d1117, consistent layout)...");
  const atDark = generateAtCoderCard(true);
  const atLight = generateAtCoderCard(false);
  fs.writeFileSync("profile/cp-atcoder-dark.svg", atDark);
  fs.writeFileSync("profile/cp-atcoder-light.svg", atLight);
  if (fs.existsSync("SaptarshiCodes/profile")) {
    fs.writeFileSync("SaptarshiCodes/profile/cp-atcoder-dark.svg", atDark);
    fs.writeFileSync("SaptarshiCodes/profile/cp-atcoder-light.svg", atLight);
  }
  */

  console.log("All cards generated successfully!");
}

main();
