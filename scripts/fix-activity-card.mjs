import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
  "profile/activity-consistency-compact-light.svg",
  "profile/activity-consistency-compact-dark.svg",
  "profile/language-composition-wide-light.svg",
  "profile/language-composition-wide-dark.svg",
  "profile/language-composition-compact-light.svg",
  "profile/language-composition-compact-dark.svg",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    continue;
  }

  let svg = fs.readFileSync(file, "utf8");

  /*
   * ==========================================================
   * ACTIVITY CONSISTENCY CARD
   *
   * The Shinpr card uses fixed SVG coordinates.
   * We modify only the top statistics.
   * The contribution calendar is untouched.
   * ==========================================================
   */

  if (file.includes("activity-consistency")) {
    // ----------------------------------------------------------
    // Move "/ 365"
    // ----------------------------------------------------------
    svg = svg.replace(
      /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*\/\s*365[^<]*<\/text>)/g,
      '$1x="155"$2'
    );

    // ----------------------------------------------------------
    // Move "ACTIVE DAYS"
    // ----------------------------------------------------------
    svg = svg.replace(
      /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*ACTIVE DAYS[^<]*<\/text>)/g,
      '$1x="155"$2'
    );

    // ----------------------------------------------------------
    // Move CURRENT STREAK label
    // ----------------------------------------------------------
    svg = svg.replace(
      /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*CURRENT STREAK[^<]*<\/text>)/g,
      '$1x="320"$2'
    );

    // ----------------------------------------------------------
    // Move LONGEST STREAK label
    // ----------------------------------------------------------
    svg = svg.replace(
      /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*LONGEST STREAK[^<]*<\/text>)/g,
      '$1x="490"$2'
    );
  }

  /*
   * ==========================================================
   * GITHUB DARK THEME MATCHING (#0d1117)
   * ==========================================================
   */
  if (file.includes("-dark.svg")) {
    // Background: #151821 / #12151d -> #0d1117 (GitHub canvas default)
    svg = svg.replace(/#151821/gi, "#0d1117");
    svg = svg.replace(/#12151d/gi, "#0d1117");

    // Border: #303543 / #303644 -> #30363d (GitHub default border)
    svg = svg.replace(/#303543/gi, "#30363d");
    svg = svg.replace(/#303644/gi, "#30363d");

    // Empty contribution cells / track: #262A35 / #1b202b -> #161b22 (GitHub canvas subtle)
    svg = svg.replace(/#262A35/gi, "#161b22");
    svg = svg.replace(/#1b202b/gi, "#161b22");
  }

  fs.writeFileSync(file, svg);

  console.log(`Processed: ${file}`);
}

console.log("Card formatting and GitHub theme styling finished.");
