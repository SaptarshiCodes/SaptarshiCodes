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
      }
    }

    repositories(
      first: 100
      ownerAffiliations: OWNER
      privacy: PUBLIC
      isFork: false
    ) {
      totalCount
      nodes {
        stargazerCount
      }
    }

    pullRequests(
      first: 1
      states: [OPEN, CLOSED, MERGED]
    ) {
      totalCount
    }

    issues(
      first: 1
      states: [OPEN, CLOSED]
    ) {
      totalCount
    }
  }
}
`;

const now = new Date();

const from = new Date(now);
from.setUTCDate(from.getUTCDate() - 365);

const response = await fetch(
  "https://api.github.com/graphql",
  {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "github-profile-card"
    },

    body: JSON.stringify({
      query,

      variables: {
        login: username,
        from: from.toISOString(),
        to: now.toISOString()
      }
    })
  }
);

if (!response.ok) {
  throw new Error(`GitHub API error: ${response.status}`);
}

const result = await response.json();

if (result.errors) {
  console.error(result.errors);
  throw new Error("GitHub GraphQL API returned an error.");
}

const user = result.data.user;

const contributions =
  user.contributionsCollection
    .contributionCalendar
    .totalContributions;

const repositories =
  user.repositories.totalCount;

const stars = user.repositories.nodes.reduce(
  (total, repo) => total + repo.stargazerCount,
  0
);

const pullRequests =
  user.pullRequests.totalCount;

const issues =
  user.issues.totalCount;

const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number);

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
  height="300"
  viewBox="0 0 900 300"
>

  <!-- Background -->

  <rect
    x="4"
    y="4"
    width="892"
    height="292"
    fill="${background}"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- Header -->

  <text
    x="55"
    y="60"
    font-family="monospace"
    font-size="19"
    font-weight="700"
    fill="${primary}"
  >
    ${displayName} · SIGNAL FIELD
  </text>


  <text
    x="845"
    y="60"
    text-anchor="end"
    font-family="monospace"
    font-size="12"
    font-weight="700"
    fill="${secondary}"
  >
    GITHUB ACTIVITY
  </text>


  <!-- Contributions -->

  <text
    x="55"
    y="140"
    font-family="Arial, Helvetica, sans-serif"
    font-size="64"
    font-weight="700"
    fill="${primary}"
  >
    ${formatNumber(contributions)}
  </text>

  <text
    x="55"
    y="170"
    font-family="monospace"
    font-size="13"
    font-weight="700"
    fill="${secondary}"
  >
    CONTRIBUTIONS · PAST YEAR
  </text>


  <!-- Divider -->

  <line
    x1="330"
    y1="95"
    x2="330"
    y2="205"
    stroke="${border}"
    stroke-width="2"
  />


  <!-- Stars -->

  <text
    x="380"
    y="140"
    font-family="Arial, Helvetica, sans-serif"
    font-size="42"
    font-weight="700"
    fill="${accent}"
  >
    ${formatNumber(stars)}
  </text>

  <text
    x="380"
    y="170"
    font-family="monospace"
    font-size="13"
    font-weight="700"
    fill="${secondary}"
  >
    STARS
  </text>


  <!-- Repositories -->

  <text
    x="540"
    y="140"
    font-family="Arial, Helvetica, sans-serif"
    font-size="42"
    font-weight="700"
    fill="${primary}"
  >
    ${formatNumber(repositories)}
  </text>

  <text
    x="540"
    y="170"
    font-family="monospace"
    font-size="13"
    font-weight="700"
    fill="${secondary}"
  >
    REPOSITORIES
  </text>


  <!-- Pull Requests -->

  <text
    x="710"
    y="140"
    font-family="Arial, Helvetica, sans-serif"
    font-size="42"
    font-weight="700"
    fill="${primary}"
  >
    ${formatNumber(pullRequests)}
  </text>

  <text
    x="710"
    y="170"
    font-family="monospace"
    font-size="13"
    font-weight="700"
    fill="${secondary}"
  >
    PULL REQUESTS
  </text>


  <!-- Footer -->

  <line
    x1="55"
    y1="215"
    x2="845"
    y2="215"
    stroke="${border}"
    stroke-width="2"
  />

  <text
    x="55"
    y="250"
    font-family="monospace"
    font-size="11"
    font-weight="700"
    fill="${secondary}"
  >
    PUBLIC GITHUB ACTIVITY · GENERATED AUTOMATICALLY
  </text>

  <text
    x="845"
    y="250"
    text-anchor="end"
    font-family="monospace"
    font-size="11"
    font-weight="700"
    fill="${muted}"
  >
    NO CALENDAR
  </text>

</svg>
`;
}


const lightSvg = createSvg({
  background: "#ffffff",
  border: "#d1d5db",
  primary: "#111827",
  secondary: "#6b7280",
  muted: "#9ca3af",
  accent: "#e76f32"
});


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
  "profile/signal-field-wide-light.svg",
  lightSvg.trim()
);

fs.writeFileSync(
  "profile/signal-field-wide-dark.svg",
  darkSvg.trim()
);


console.log("Signal Field card generated.");

console.log({
  contributions,
  stars,
  repositories,
  pullRequests,
  issues
});
