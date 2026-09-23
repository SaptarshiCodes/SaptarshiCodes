import fs from "node:fs";

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

if (!username || !token) {
  throw new Error("GITHUB_USERNAME or GITHUB_TOKEN is missing");
}

// ============================================================
// GitHub GraphQL Query
// ============================================================

const query = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
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
// Fetch GitHub Data
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
  throw new Error(JSON.stringify(result.errors, null, 2));
}

const user = result.data?.user;

if (!user) {
  throw new Error(`GitHub user "${username}" not found`);
}

// ============================================================
// Extract Statistics
// ============================================================

const contributions =
  user.contributionsCollection.totalCommitContributions;

const pullRequests =
  user.contributionsCollection.totalPullRequestContributions;

const issues =
  user.contributionsCollection.totalIssueContributions;

const stars = user.repositories.nodes.reduce(
  (total, repo) => total + repo.stargazerCount,
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
  return new Intl.NumberFormat("en-US").format(value);
}

// ============================================================
// Generate SVG
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

  const border = dark
    ? "#303644"
    : "#d8dce5";

  // ==========================================================
  // Statistics
  // ==========================================================

  const stats = [
    {
      value: formatNumber(contributions),
      label: "CONTRIBUTIONS",
      description: "COMMIT ACTIVITY",
    },

    {
      value: formatNumber(stars),
      label: "STARS",
      description: "REPOSITORY STARS",
    },

    {
      value: formatNumber(pullRequests),
      label: "PULL REQUESTS",
      description: "AUTHORED PRs",
    },

    {
      value: formatNumber(issues),
      label: "ISSUES",
      description: "AUTHORED ISSUES",
    },
  ];

  // ==========================================================
  // Positions
  // ==========================================================

  const positions = [
    90,
    390,
    690,
    990,
  ];

  // ==========================================================
  // Statistic SVG
  // ==========================================================

  const statSvg = stats
    .map(
      (stat, index) => `
        <g transform="translate(${positions[index]}, 215)">

          <text
            x="0"
            y="0"
            fill="${foreground}"
            font-family="monospace"
            font-size="72"
            font-weight="700"
          >
            ${escapeXml(stat.value)}
          </text>

          <text
            x="0"
            y="48"
            fill="${foreground}"
            font-family="monospace"
            font-size="19"
            font-weight="700"
            letter-spacing="1"
          >
            ${escapeXml(stat.label)}
          </text>

          <text
            x="0"
            y="78"
            fill="${muted}"
            font-family="monospace"
            font-size="14"
            font-weight="700"
            letter-spacing="0.5"
          >
            ${escapeXml(stat.description)}
          </text>

        </g>
      `
    )
    .join("");

  // ==========================================================
  // SVG
  //
  // ONLY:
  // - Header
  // - Statistics
  // - Vertical separators
  //
  // NO:
  // - Activity Signal
  // - Signal bars
  // - Calendar
  // - "NO CALENDAR"
  // ==========================================================

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1280"
  height="380"
  viewBox="0 0 1280 380"
>

  <!-- ======================================================
       Background
       ====================================================== -->

  <rect
    x="10"
    y="10"
    width="1260"
    height="360"
    fill="${background}"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- ======================================================
       Header
       ====================================================== -->

  <text
    x="70"
    y="65"
    fill="${foreground}"
    font-family="monospace"
    font-size="21"
    font-weight="700"
  >
    ${escapeXml(username)} · SIGNAL FIELD
  </text>

  <text
    x="1210"
    y="65"
    text-anchor="end"
    fill="${muted}"
    font-family="monospace"
    font-size="16"
    font-weight="700"
  >
    GITHUB ACTIVITY
  </text>


  <!-- ======================================================
       Header Divider
       ====================================================== -->

  <line
    x1="70"
    y1="95"
    x2="1210"
    y2="95"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- ======================================================
       Statistics
       ====================================================== -->

  ${statSvg}


  <!-- ======================================================
       Vertical Separators
       ====================================================== -->

  <line
    x1="350"
    y1="145"
    x2="350"
    y2="320"
    stroke="${border}"
    stroke-width="2"
  />

  <line
    x1="650"
    y1="145"
    x2="650"
    y2="320"
    stroke="${border}"
    stroke-width="2"
  />

  <line
    x1="950"
    y1="145"
    x2="950"
    y2="320"
    stroke="${border}"
    stroke-width="2"
  />

</svg>
`;
}

// ============================================================
// Write Files
// ============================================================

fs.mkdirSync("profile", {
  recursive: true,
});

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

console.log("Signal Field generated successfully.");

console.log({
  username,
  contributions,
  stars,
  pullRequests,
  issues,
});
