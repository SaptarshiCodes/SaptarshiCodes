import fs from "node:fs";

// Ensure profile directories exist
fs.mkdirSync("profile", { recursive: true });
fs.mkdirSync("SaptarshiCodes/profile", { recursive: true });

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
// SHARED DESIGN SYSTEM (matches activity cards with #12151d bg)
// ============================================================
const DARK = {
  bg: "#12151d",           // Requested background color
  border: "#303543",       // Subtle border
  text0: "#F7F3EA",        // Primary text
  text1: "#AAA8B4",        // Muted labels
  text2: "#7D8590",        // Secondary muted
  lineBg: "#1e222e",       // Row / bar container background
  accent: "#F08A5B",       // Warm orange accent
  font: `ui-monospace,SFMono-Regular,Consolas,Liberation Mono,monospace`,
};

const LIGHT = {
  bg: "#FFFFFF",
  border: "#D8DCE5",
  text0: "#1F2328",
  text1: "#6B7280",
  text2: "#8C959F",
  lineBg: "#F0F2F4",
  accent: "#E05C3A",
  font: `ui-monospace,SFMono-Regular,Consolas,Liberation Mono,monospace`,
};

// Card dimensions
const W = 500;
const H = 220;

// ============================================================
// SVG SHELL
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
// PLATFORM ICONS (Inlined SVG)
// ============================================================

// LeetCode official Simple Icons path
function lcIcon() {
  const path = `M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z`;
  return `<g transform="scale(0.92)"><path d="${path}" fill="#FFA116"/></g>`;
}

// Codeforces 3-bar logo
function cfIcon() {
  return `<rect x="0" y="8" width="5" height="13" rx="1" fill="#FFC107"/>
  <rect x="8" y="0" width="5" height="21" rx="1" fill="#2196F3"/>
  <rect x="16" y="4" width="5" height="17" rx="1" fill="#F44336"/>`;
}

// CodeChef official Simple Icons path
function ccIcon() {
  const path = `M12 0C8.656 0 5.6 2.219 4.5 5.5H2.25C1.007 5.5 0 6.507 0 7.75v.5C0 9.493 1.007 10.5 2.25 10.5h.287A8.009 8.009 0 0 0 2.5 11a8 8 0 0 0 1.117 4.062c-.07.248-.117.502-.117.771 0 1.489 1.231 2.703 2.75 2.703.388 0 .756-.082 1.09-.227A8.045 8.045 0 0 0 12 19a8.045 8.045 0 0 0 4.66-1.691c.334.145.702.228 1.09.228 1.519 0 2.75-1.214 2.75-2.703 0-.27-.047-.524-.117-.772A8 8 0 0 0 21.5 11a8.016 8.016 0 0 0-.037-.5h.287C22.993 10.5 24 9.493 24 8.25v-.5C24 6.507 22.993 5.5 21.75 5.5H19.5C18.4 2.219 15.344 0 12 0zm0 2a6 6 0 0 1 5.916 5H6.084A6 6 0 0 1 12 2zM4.5 7h15v.25a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V7zm0 2.5h15A6 6 0 0 1 18 11a6 6 0 0 1-12 0 6 6 0 0 1-1.5-1.5zm5.5 3v3h4v-3h-4z`;
  return `<g transform="scale(0.92)"><path d="${path}" fill="#5B4638"/></g>`;
}

// AtCoder stylized triangle logo
function atIcon(theme) {
  const strokeColor = theme.text0;
  return `<polygon points="11,1 21,21 1,21" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="11" y="16.5" text-anchor="middle" fill="${strokeColor}" font-family="monospace" font-size="8" font-weight="700">AC</text>`;
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

  // Donut: rating vs 2400 (guardian ceiling)
  const donutPct = rating / 2400;
  const cx = 60, cy = 136, donutR = 36, donutSW = 6;

  // Segmented solved bar
  const barW = 340;
  const easyW = (easy / solved) * barW;
  const medW = (medium / solved) * barW;
  const hardW = barW - easyW - medW;

  const inner = `
  ${header(theme, lcIcon(), "saptarshi_codes", "LEETCODE", brand)}

  <!-- Left: Donut ring -->
  ${donut(cx, cy, donutR, donutPct, brand, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="17" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="8" font-weight="650">RATING</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" fill="${brand}" font-family="${font}" font-size="9" font-weight="700">TOP 16.5%</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 135, 72, "CONTEST RANK", contestRank)}
  ${statBlock(theme, 310, 72, "GLOBAL RANK", globalRank)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 135, 122, "SOLVED PROBLEMS", `${solved}`)}
  <g transform="translate(310, 122)">
    <text x="0" y="0" fill="${text1}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.5">DIFFICULTY BREAKDOWN</text>
    <text x="0" y="20" fill="${easyColor}" font-family="${font}" font-size="12" font-weight="700">${easy} <tspan fill="${text2}" font-size="9" font-weight="500">EASY</tspan></text>
    <text x="65" y="20" fill="${medColor}" font-family="${font}" font-size="12" font-weight="700">${medium} <tspan fill="${text2}" font-size="9" font-weight="500">MED</tspan></text>
    <text x="125" y="20" fill="${hardColor}" font-family="${font}" font-size="12" font-weight="700">${hard} <tspan fill="${text2}" font-size="9" font-weight="500">HARD</tspan></text>
  </g>

  <!-- Segmented Progress Bar -->
  <text x="135" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">SOLVED RATIO: ${(easy/solved*100).toFixed(0)}% EASY · ${(medium/solved*100).toFixed(0)}% MEDIUM · ${(hard/solved*100).toFixed(0)}% HARD</text>
  <g transform="translate(135, 172)">
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

  // Tier progress: Pupil is 1200-1399
  const tierMin = 1200, tierMax = 1400;
  const tierPct = (rating - tierMin) / (tierMax - tierMin);

  // Donut: rating vs 2000
  const donutPct = rating / 2000;
  const cx = 60, cy = 136, donutR = 36, donutSW = 6;

  const inner = `
  ${header(theme, cfIcon(), "Saptarshi_codes", "CODEFORCES", brand)}

  <!-- Left: Donut ring -->
  ${donut(cx, cy, donutR, donutPct, pupilColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="17" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="8" font-weight="650">RATING</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" fill="${pupilColor}" font-family="${font}" font-size="9" font-weight="700">${rank}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 135, 72, "MAX RATING", `${maxRating}`)}
  ${statBlock(theme, 310, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 135, 122, "RATED CONTESTS", `${contests}`)}
  ${statBlock(theme, 310, 122, "CURRENT RANK", rank, pupilColor)}

  <!-- Tier Progress Bar -->
  <text x="135" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">PUPIL TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 135, 172, 340, tierPct, pupilColor)}

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
  const cx = 60, cy = 136, donutR = 36, donutSW = 6;

  const inner = `
  ${header(theme, ccIcon(), "saptarshi010", "CODECHEF", brand)}

  <!-- Left: Donut ring -->
  ${donut(cx, cy, donutR, donutPct, tierColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="17" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="8" font-weight="650">RATING</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" fill="${tierColor}" font-family="${font}" font-size="11" font-weight="700">${stars}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 135, 72, "HIGHEST RATING", `${highestRating}`)}
  ${statBlock(theme, 310, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 135, 122, "GLOBAL RANK", globalRank)}
  ${statBlock(theme, 310, 122, "INDIA RANK", countryRank)}

  <!-- Tier Progress Bar -->
  <text x="135" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">2★ TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 135, 172, 340, tierPct, tierColor)}

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">codechef.com/users/saptarshi010</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">DIVISION 3</text>`;

  return shell(theme, inner);
}

// ============================================================
// 4. ATCODER CARD GENERATOR (Consistent with other cards)
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
  const cx = 60, cy = 136, donutR = 36, donutSW = 6;

  const inner = `
  ${header(theme, atIcon(theme), "SaptarshiCodes", "ATCODER", brand)}

  <!-- Left: Donut ring -->
  ${donut(cx, cy, donutR, donutPct, tierColor, lineBg, donutSW)}
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="${text0}" font-family="${font}" font-size="17" font-weight="700">${rating}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${text1}" font-family="${font}" font-size="8" font-weight="650">RATING</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" fill="${tierColor}" font-family="${font}" font-size="9" font-weight="700">${tier}</text>

  <!-- Right stats Row 1 -->
  ${statBlock(theme, 135, 72, "MAX RATING", `${maxRating}`)}
  ${statBlock(theme, 310, 72, "PROBLEMS SOLVED", `${solved}`)}

  <!-- Right stats Row 2 -->
  ${statBlock(theme, 135, 122, "GLOBAL AC RANK", rank)}
  ${statBlock(theme, 310, 122, "RATED CONTESTS", `${contests}`)}

  <!-- Tier Progress Bar -->
  <text x="135" y="166" fill="${text2}" font-family="${font}" font-size="8" font-weight="650" letter-spacing="0.4">GRAY TIER PROGRESS  ${Math.round(tierPct * 100)}%  (${tierMin}-${tierMax})</text>
  ${progressBar(theme, 135, 172, 340, tierPct, tierColor)}

  <!-- Footer -->
  <text x="20" y="${H - 12}" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">atcoder.jp/users/SaptarshiCodes</text>
  <text x="${W - 20}" y="${H - 12}" text-anchor="end" fill="${text2}" font-family="${font}" font-size="8" font-weight="600">PEAK ${maxRating}</text>`;

  return shell(theme, inner);
}

// ============================================================
// MAIN GENERATION
// ============================================================
function main() {
  console.log("Generating LeetCode cards (#12151d)...");
  const lcDark = generateLeetcodeCard(true);
  const lcLight = generateLeetcodeCard(false);
  fs.writeFileSync("profile/cp-leetcode-dark.svg", lcDark);
  fs.writeFileSync("profile/cp-leetcode-light.svg", lcLight);
  fs.writeFileSync("SaptarshiCodes/profile/cp-leetcode-dark.svg", lcDark);
  fs.writeFileSync("SaptarshiCodes/profile/cp-leetcode-light.svg", lcLight);

  console.log("Generating Codeforces cards (#12151d, no rating graph)...");
  const cfDark = generateCodeforcesCard(true);
  const cfLight = generateCodeforcesCard(false);
  fs.writeFileSync("profile/cp-codeforces-dark.svg", cfDark);
  fs.writeFileSync("profile/cp-codeforces-light.svg", cfLight);
  fs.writeFileSync("SaptarshiCodes/profile/cp-codeforces-dark.svg", cfDark);
  fs.writeFileSync("SaptarshiCodes/profile/cp-codeforces-light.svg", cfLight);

  console.log("Generating CodeChef cards (#12151d)...");
  const ccDark = generateCodechefCard(true);
  const ccLight = generateCodechefCard(false);
  fs.writeFileSync("profile/cp-codechef-dark.svg", ccDark);
  fs.writeFileSync("profile/cp-codechef-light.svg", ccLight);
  fs.writeFileSync("SaptarshiCodes/profile/cp-codechef-dark.svg", ccDark);
  fs.writeFileSync("SaptarshiCodes/profile/cp-codechef-light.svg", ccLight);

  console.log("Generating AtCoder cards (#12151d, consistent layout)...");
  const atDark = generateAtCoderCard(true);
  const atLight = generateAtCoderCard(false);
  fs.writeFileSync("profile/cp-atcoder-dark.svg", atDark);
  fs.writeFileSync("profile/cp-atcoder-light.svg", atLight);
  fs.writeFileSync("SaptarshiCodes/profile/cp-atcoder-dark.svg", atDark);
  fs.writeFileSync("SaptarshiCodes/profile/cp-atcoder-light.svg", atLight);

  console.log("All 4 CP cards generated successfully!");
}

main();
