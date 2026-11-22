import fs from "node:fs";

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

if (!username || !token) {
  throw new Error("GITHUB_USERNAME or GITHUB_TOKEN is missing");
}

// ============================================================
// GitHub GraphQL
// ============================================================

const query = `
query($login: String!) {
  user(login: $login) {

    contributionsCollection {
      contributionCalendar {
        totalContributions
      }

      totalPullRequestContributions
      totalIssueContributions
    }

    repositories(
      first: 100
      ownerAffiliations: OWNER
      isFork: false
    ) {
      nodes {
        stargazerCount
      }
    }
  }
}
`;

// ============================================================
// Fetch GitHub data
// ============================================================

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",

  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "github-profile-stats",
  },

  body: JSON.stringify({
    query,
    variables: {
      login: username,
    },
  }),
});

if (!response.ok) {
  throw new Error(
    `GitHub API failed: ${response.status} ${response.statusText}`
  );
}

const result = await response.json();

if (result.errors) {
  throw new Error(
    JSON.stringify(result.errors, null, 2)
  );
}

const user = result.data?.user;

if (!user) {
  throw new Error(
    `GitHub user "${username}" not found`
  );
}

// ============================================================
// Statistics
// ============================================================

// Total GitHub contributions in the past year
const contributions =
  user.contributionsCollection.contributionCalendar
    .totalContributions;

// Pull requests
const pullRequests =
  user.contributionsCollection
    .totalPullRequestContributions;

// Issues
const issues =
  user.contributionsCollection
    .totalIssueContributions;

// Repository stars
const stars =
  user.repositories.nodes.reduce(
    (total, repo) =>
      total + repo.stargazerCount,
    0
  );

// ============================================================
// Helpers
// ============================================================

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US")
    .format(value);
}

// ============================================================
// Date range
// ============================================================

const today = new Date();

const endDate = new Date(today);

const startDate = new Date(today);
startDate.setFullYear(
  startDate.getFullYear() - 1
);
startDate.setDate(
  startDate.getDate() + 1
);

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

const dateRange =
  `${formatDate(startDate)} — ${formatDate(endDate)}`;

// ============================================================
// SVG
// ============================================================

function createCard({ dark }) {

  const background = dark
    ? "#12151d"
    : "#ffffff";

  const foreground = dark
    ? "#f5f5f5"
    : "#202124";

  const muted = dark
    ? "#aab0c0"
    : "#6b7280";

  const divider = dark
    ? "#303644"
    : "#d8dce5";

  const accent = dark
    ? "#ff8068"
    : "#e66b55";

  const gridLine = dark ? "#1a202c" : "#E6EBF2";
  const gridDot = dark ? "#2e384d" : "#D0D7DE";
  const themeKey = dark ? "dark" : "light";

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1280"
  height="300"
  viewBox="0 0 1280 300"
>
  <defs>
    <style>
      <![CDATA[
      @keyframes shapeGridDrift {
        0% { transform: translate(0px, 0px); }
        100% { transform: translate(36px, -36px); }
      }
      @keyframes cellTwinkleA {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.45; }
      }
      @keyframes cellTwinkleB {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.35; }
      }
      .shape-grid-drift {
        animation: shapeGridDrift 20s linear infinite;
      }
      .twinkle-a {
        animation: cellTwinkleA 6s ease-in-out infinite;
      }
      .twinkle-b {
        animation: cellTwinkleB 8.5s ease-in-out infinite 2s;
      }
      @media (prefers-reduced-motion: reduce) {
        .shape-grid-drift, .twinkle-a, .twinkle-b { animation: none !important; }
      }
      ]]>
    </style>
    <pattern id="sigGrid_${themeKey}" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="${gridLine}" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="1.2" fill="${gridDot}"/>
    </pattern>
    <radialGradient id="sigGridMaskGrad_${themeKey}" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05"/>
    </radialGradient>
    <mask id="sigGridMask_${themeKey}">
      <rect width="1280" height="300" fill="url(#sigGridMaskGrad_${themeKey})"/>
    </mask>
  </defs>

  <!-- ======================================================
       Background
       ====================================================== -->

  <rect
    x="0"
    y="0"
    width="1280"
    height="300"
    fill="${background}"
  />

  <!-- React Bits <ShapeGrid /> Background Layer -->
  <g mask="url(#sigGridMask_${themeKey})" pointer-events="none">
    <g class="shape-grid-drift">
      <rect x="-72" y="-72" width="1424" height="444" fill="url(#sigGrid_${themeKey})"/>
    </g>
    <rect x="468" y="72" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="0.8" class="twinkle-a"/>
    <rect x="864" y="180" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.14" stroke="${accent}" stroke-width="0.8" class="twinkle-b"/>
    <rect x="180" y="216" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-width="0.8" class="twinkle-a"/>
    <rect x="1116" y="108" width="35" height="35" rx="3" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-width="0.8" class="twinkle-b"/>
  </g>


  <!-- ======================================================
       Header
       ====================================================== -->

  <text
    x="65"
    y="42"
    fill="${foreground}"
    font-family="monospace"
    font-size="21"
    font-weight="700"
  >
    ${escapeXml(username)} · GITHUB ACTIVITY
  </text>


  <!-- Date -->

  <text
    x="1215"
    y="42"
    text-anchor="end"
    fill="${muted}"
    font-family="monospace"
    font-size="17"
    font-weight="500"
  >
    ${dateRange}
  </text>


  <!-- ======================================================
       Main Contribution Number
       ====================================================== -->

  <text
    x="65"
    y="190"
    fill="${foreground}"
    font-family="monospace"
    font-size="96"
    font-weight="700"
  >
    ${escapeXml(formatNumber(contributions))}
  </text>


  <!-- ======================================================
       Contribution Label Accent
       ====================================================== -->

  <rect
    x="65"
    y="232"
    width="40"
    height="4"
    fill="${accent}"
  />


  <text
    x="122"
    y="238"
    fill="${foreground}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
    letter-spacing="0.3"
  >
    CONTRIBUTIONS
  </text>


  <text
    x="292"
    y="238"
    fill="${foreground}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
  >
    ·
  </text>


  <text
    x="316"
    y="238"
    fill="${foreground}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
  >
    PAST YEAR
  </text>


  <!-- ======================================================
       Stars
       ====================================================== -->

  <line
    x1="570"
    y1="113"
    x2="745"
    y2="113"
    stroke="${divider}"
    stroke-width="2"
  />


  <text
    x="570"
    y="184"
    fill="${foreground}"
    font-family="monospace"
    font-size="48"
    font-weight="500"
  >
    ${escapeXml(formatNumber(stars))}
  </text>


  <text
    x="570"
    y="226"
    fill="${muted}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
  >
    STARS
  </text>


  <!-- ======================================================
       Pull Requests
       ====================================================== -->

  <line
    x1="785"
    y1="113"
    x2="960"
    y2="113"
    stroke="${divider}"
    stroke-width="2"
  />


  <text
    x="785"
    y="184"
    fill="${foreground}"
    font-family="monospace"
    font-size="48"
    font-weight="500"
  >
    ${escapeXml(formatNumber(pullRequests))}
  </text>


  <text
    x="785"
    y="226"
    fill="${muted}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
  >
    PULL REQUESTS
  </text>


  <!-- ======================================================
       Issues
       ====================================================== -->

  <line
    x1="1000"
    y1="113"
    x2="1175"
    y2="113"
    stroke="${divider}"
    stroke-width="2"
  />


  <text
    x="1000"
    y="184"
    fill="${foreground}"
    font-family="monospace"
    font-size="48"
    font-weight="500"
  >
    ${escapeXml(formatNumber(issues))}
  </text>


  <text
    x="1000"
    y="226"
    fill="${muted}"
    font-family="monospace"
    font-size="19"
    font-weight="700"
  >
    ISSUES
  </text>

</svg>
`;
}

// ============================================================
// Write SVG files
// ============================================================

fs.mkdirSync(
  "profile",
  { recursive: true }
);

fs.writeFileSync(
  "profile/signal-field-v2-wide-light.svg",
  createCard({
    dark: false,
  })
);

fs.writeFileSync(
  "profile/signal-field-v2-wide-dark.svg",
  createCard({
    dark: true,
  })
);

// ============================================================
// Log
// ============================================================

console.log(
  "Signal Field generated successfully."
);

console.log({
  username,
  contributions,
  stars,
  pullRequests,
  issues,
  dateRange,
});
