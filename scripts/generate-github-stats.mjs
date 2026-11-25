import fs from "node:fs";

const username = process.env.GITHUB_USERNAME || "SaptarshiCodes";
const token = process.env.GITHUB_TOKEN || "";

/** Maps primary language names to Shields.io colors and Simple Icons slugs. */
const LANGUAGE_STYLE_MAP = {
  TypeScript: { color: "3178C6", logo: "typescript" },
  JavaScript: { color: "F7DF1E", logo: "javascript" },
  Python: { color: "3776AB", logo: "python" },
  "C++": { color: "00599C", logo: "cplusplus" },
  C: { color: "A8B9CC", logo: "c" },
  Java: { color: "ED8B00", logo: "openjdk" },
  Rust: { color: "DEA584", logo: "rust" },
  Go: { color: "00ADD8", logo: "go" },
  HTML: { color: "E34F26", logo: "html5" },
  CSS: { color: "1572B6", logo: "css3" },
  Shell: { color: "89E051", logo: "gnubash" },
  Other: { color: "6E7681", logo: "github" },
};

/**
 * Fetches JSON from a URL with appropriate headers and error checking.
 */
async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": "github-profile-stats",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.json();
}

/**
 * Fetches contribution calendar, owned non-fork public repo count, and language bytes
 * directly from GitHub's official GraphQL API using GITHUB_TOKEN.
 */
async function fetchViaGraphQL(login, authToken) {
  const query = `
    query($login: String!, $after: String) {
      user(login: $login) {
        contributionsCollection {
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
        repositories(
          first: 100
          after: $after
          ownerAffiliations: OWNER
          isFork: false
          privacy: PUBLIC
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  let after = null;
  let calendar = null;
  let publicRepos = 0;
  const languageBytes = new Map();
  const languageColors = new Map();

  do {
    const result = await fetchJson("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login, after } }),
    });

    if (result.errors) {
      throw new Error(JSON.stringify(result.errors));
    }

    const user = result.data?.user;
    if (!user) {
      throw new Error(`GitHub user "${login}" not found`);
    }

    if (!calendar) {
      calendar = user.contributionsCollection.contributionCalendar;
      publicRepos = user.repositories.totalCount;
    }

    for (const repo of user.repositories.nodes) {
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        languageBytes.set(name, (languageBytes.get(name) || 0) + edge.size);
        if (edge.node.color) {
          languageColors.set(name, edge.node.color.replace(/^#/, ""));
        }
      }
    }

    const pageInfo = user.repositories.pageInfo;
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (after);

  const days = calendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }));

  return {
    totalContributions: calendar.totalContributions,
    days,
    publicRepos,
    languageBytes,
    languageColors,
  };
}

/**
 * Fallback fetcher for local runs without GITHUB_TOKEN using public REST/calendar endpoints.
 */
async function fetchViaPublicFallback(login) {
  const contribData = await fetchJson(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`
  );

  const ownedRepos = [];
  let page = 1;
  while (true) {
    const batch = await fetchJson(
      `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&type=owner&page=${page}`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    ownedRepos.push(...batch.filter((repo) => !repo.fork));
    if (batch.length < 100) break;
    page += 1;
  }

  const languageBytes = new Map();
  const repoLangMaps = await Promise.all(
    ownedRepos.map((repo) =>
      fetchJson(repo.languages_url, {
        headers: { Accept: "application/vnd.github+json" },
      })
    )
  );

  for (const langMap of repoLangMaps) {
    for (const [name, size] of Object.entries(langMap)) {
      languageBytes.set(name, (languageBytes.get(name) || 0) + size);
    }
  }

  return {
    totalContributions: contribData.total?.lastYear ?? 0,
    days: contribData.contributions.map((d) => ({ date: d.date, count: d.count })),
    publicRepos: ownedRepos.length,
    languageBytes,
    languageColors: new Map(),
  };
}

/**
 * Computes active days, current streak, and longest streak over the trailing 365 UTC days.
 */
function computeCalendarMetrics(days) {
  const todayUtc = new Date().toISOString().slice(0, 10);
  const window365 = days
    .filter((d) => d.date <= todayUtc)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-365);

  let activeDays = 0;
  let longestStreak = 0;
  let running = 0;

  for (const day of window365) {
    if (day.count > 0) {
      activeDays += 1;
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  let currentStreak = 0;
  for (let i = window365.length - 1; i >= 0; i -= 1) {
    if (window365[i].count > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    activeDays,
    windowLength: window365.length || 365,
    currentStreak,
    longestStreak,
  };
}

/**
 * Determines primary programming language, rounded percentage, color, and Shields icon.
 */
function computePrimaryLanguage(languageBytes, languageColors) {
  let totalBytes = 0;
  let topName = "Other";
  let topBytes = 0;

  for (const [name, size] of languageBytes.entries()) {
    totalBytes += size;
    if (size > topBytes) {
      topBytes = size;
      topName = name;
    }
  }

  const percent = totalBytes > 0 ? Math.round((topBytes / totalBytes) * 100) : 0;
  const preset = LANGUAGE_STYLE_MAP[topName];
  const color = preset?.color || languageColors.get(topName) || LANGUAGE_STYLE_MAP.Other.color;
  const logo = preset?.logo || "github";

  return {
    name: topName,
    percent,
    label: `${topName} (${percent}%)`,
    color,
    logo,
  };
}

function formatDays(count) {
  return `${count} ${count === 1 ? "Day" : "Days"}`;
}

async function main() {
  const raw = token
    ? await fetchViaGraphQL(username, token)
    : await fetchViaPublicFallback(username);

  const calendar = computeCalendarMetrics(raw.days);
  const primaryLanguage = computePrimaryLanguage(raw.languageBytes, raw.languageColors);

  const githubStats = {
    username,
    contributions: raw.totalContributions,
    contributionsLabel: `${raw.totalContributions} Past Year`,
    activeDays: calendar.activeDays,
    activeDaysLabel: `${calendar.activeDays} / ${calendar.windowLength}`,
    currentStreak: calendar.currentStreak,
    currentStreakLabel: formatDays(calendar.currentStreak),
    longestStreak: calendar.longestStreak,
    longestStreakLabel: formatDays(calendar.longestStreak),
    publicRepos: raw.publicRepos,
    primaryLanguage: primaryLanguage.name,
    primaryLanguagePercent: primaryLanguage.percent,
    primaryLanguageLabel: primaryLanguage.label,
  };

  const primaryLanguageBadge = {
    schemaVersion: 1,
    label: "Primary Language",
    message: primaryLanguage.label,
    color: primaryLanguage.color,
    namedLogo: primaryLanguage.logo,
    logoColor: "white",
    cacheSeconds: 300,
  };

  fs.mkdirSync("profile", { recursive: true });
  fs.writeFileSync(
    "profile/github-stats.json",
    `${JSON.stringify(githubStats, null, 2)}\n`
  );
  fs.writeFileSync(
    "profile/primary-language-badge.json",
    `${JSON.stringify(primaryLanguageBadge, null, 2)}\n`
  );

  console.log("Generated profile/github-stats.json and profile/primary-language-badge.json:");
  console.log(githubStats);
}

main().catch((err) => {
  console.error("Failed to generate GitHub stats:", err);
  process.exit(1);
});
