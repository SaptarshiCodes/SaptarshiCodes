import fs from "node:fs";

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

if (!username || !token) {
  throw new Error("GITHUB_USERNAME and GITHUB_TOKEN are required.");
}

const query = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

const now = new Date();

const from = new Date(now);
from.setUTCDate(from.getUTCDate() - 365);

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "github-profile-stats"
  },
  body: JSON.stringify({
    query,
    variables: {
      login: username,
      from: from.toISOString(),
      to: now.toISOString()
    }
  })
});

if (!response.ok) {
  throw new Error(`GitHub API error: ${response.status}`);
}

const result = await response.json();

if (result.errors) {
  console.error(result.errors);
  throw new Error("GitHub GraphQL API returned an error.");
}

const calendar =
  result.data.user.contributionsCollection.contributionCalendar;

const days = calendar.weeks
  .flatMap((week) => week.contributionDays)
  .sort((a, b) => a.date.localeCompare(b.date));

const totalContributions = calendar.totalContributions;

const activeDays = days.filter(
  (day) => day.contributionCount > 0
).length;

// Current streak
let currentStreak = 0;

for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) {
    currentStreak++;
  } else {
    break;
  }
}

// Longest streak
let longestStreak = 0;
let runningStreak = 0;

for (const day of days) {
  if (day.contributionCount > 0) {
    runningStreak++;
    longestStreak = Math.max(longestStreak, runningStreak);
  } else {
    runningStreak = 0;
  }
}

const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number);

const formatDate = (date) =>
  date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    })
    .toUpperCase();

const startDate = formatDate(from);
const endDate = formatDate(now);

const displayName = username.toUpperCase();

function createSvg({
  background,
  border,
  primary,
  secondary,
  muted,
  accent
}) {
  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="900"
  height="330"
  viewBox="0 0 900 330"
>

  <!-- Background -->

  <rect
    x="4"
    y="4"
    width="892"
    height="322"
    fill="${background}"
    stroke="${border}"
    stroke-width="2"
  />

  <!-- Header -->

  <text
    x="60"
    y="65"
    font-family="monospace"
    font-size="18"
    font-weight="700"
    fill="${primary}"
  >
    ${displayName} · ACTIVITY / CONSISTENCY
  </text>

  <!-- Date -->

  <text
    x="840"
    y="65"
    text-anchor="end"
    font-family="monospace"
    font-size="13"
    font-weight="700"
    fill="${secondary}"
  >
    ${startDate} — ${endDate}
  </text>


  <!-- Vertical divider -->

  <line
    x1="585"
    y1="105"
    x2="585"
    y2="205"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- ACTIVE DAYS -->

  <text
    x="60"
    y="170"
    font-family="Arial, Helvetica, sans-serif"
    font-size="82"
    font-weight="700"
    fill="${primary}"
  >
    ${activeDays}
  </text>

  <text
    x="365"
    y="135"
    font-family="monospace"
    font-size="32"
    font-weight="700"
    fill="${secondary}"
  >
    / 365
  </text>

  <text
    x="365"
    y="175"
    font-family="monospace"
    font-size="15"
    font-weight="700"
    fill="${secondary}"
  >
    ACTIVE DAYS
  </text>


  <!-- CURRENT STREAK -->

  <text
    x="665"
    y="165"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="72"
    font-weight="700"
    fill="${accent}"
  >
    ${currentStreak}
  </text>

  <text
    x="665"
    y="200"
    text-anchor="middle"
    font-family="monospace"
    font-size="12"
    font-weight="700"
    fill="${secondary}"
  >
    CURRENT STREAK · DAYS
  </text>


  <!-- LONGEST STREAK -->

  <text
    x="805"
    y="165"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="72"
    font-weight="700"
    fill="${primary}"
  >
    ${longestStreak}
  </text>

  <text
    x="805"
    y="200"
    text-anchor="middle"
    font-family="monospace"
    font-size="12"
    font-weight="700"
    fill="${secondary}"
  >
    LONGEST STREAK · DAYS
  </text>


  <!-- Contributions -->

  <text
    x="60"
    y="250"
    font-family="monospace"
    font-size="17"
    font-weight="700"
    fill="${primary}"
  >
    ${formatNumber(totalContributions)} CONTRIBUTIONS · PAST YEAR
  </text>


  <!-- Divider -->

  <line
    x1="60"
    y1="275"
    x2="840"
    y2="275"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- Footer -->

  <text
    x="60"
    y="305"
    font-family="monospace"
    font-size="11"
    font-weight="700"
    fill="${secondary}"
  >
    ACTIVE DAYS AND STREAKS · DERIVED FROM DAILY COUNTS
  </text>

  <text
    x="840"
    y="305"
    text-anchor="end"
    font-family="monospace"
    font-size="11"
    font-weight="700"
    fill="${muted}"
  >
    365 UTC DAYS
  </text>

</svg>
`;
}


// Light theme

const lightSvg = createSvg({
  background: "#ffffff",
  border: "#d1d5db",
  primary: "#111827",
  secondary: "#6b7280",
  muted: "#9ca3af",
  accent: "#e76f32"
});


// Dark theme

const darkSvg = createSvg({
  background: "#11141c",
  border: "#303746",
  primary: "#f5f1e8",
  secondary: "#aeb8cc",
  muted: "#8994aa",
  accent: "#ff8a5b"
});


fs.mkdirSync("profile", {
  recursive: true
});

fs.writeFileSync(
  "profile/activity-consistency-wide-light.svg",
  lightSvg.trim()
);

fs.writeFileSync(
  "profile/activity-consistency-wide-dark.svg",
  darkSvg.trim()
);

console.log("Activity consistency cards generated.");

console.log({
  username,
  activeDays,
  currentStreak,
  longestStreak,
  totalContributions
});
