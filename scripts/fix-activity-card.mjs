import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
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


  // ----------------------------------------------------------
  // Move "/ 365"
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*\/\s*365[^<]*<\/text>)/g,
    '$1x="250"$2'
  );


  // ----------------------------------------------------------
  // Move "ACTIVE DAYS"
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*ACTIVE DAYS[^<]*<\/text>)/g,
    '$1x="250"$2'
  );


  // ----------------------------------------------------------
  // Move CURRENT STREAK label
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*CURRENT STREAK[^<]*<\/text>)/g,
    '$1x="360"$2'
  );


  // ----------------------------------------------------------
  // Move LONGEST STREAK label
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*LONGEST STREAK[^<]*<\/text>)/g,
    '$1x="505"$2'
  );


  fs.writeFileSync(file, svg);

  console.log(`Fixed: ${file}`);
}

console.log("Activity card formatting finished.");import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
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


  // ----------------------------------------------------------
  // Move "/ 365"
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*\/\s*365[^<]*<\/text>)/g,
    '$1x="250"$2'
  );


  // ----------------------------------------------------------
  // Move "ACTIVE DAYS"
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*ACTIVE DAYS[^<]*<\/text>)/g,
    '$1x="250"$2'
  );


  // ----------------------------------------------------------
  // Move CURRENT STREAK label
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*CURRENT STREAK[^<]*<\/text>)/g,
    '$1x="360"$2'
  );


  // ----------------------------------------------------------
  // Move LONGEST STREAK label
  // ----------------------------------------------------------

  svg = svg.replace(
    /(<text[^>]*?)x="[^"]*"([^>]*>[^<]*LONGEST STREAK[^<]*<\/text>)/g,
    '$1x="505"$2'
  );


  fs.writeFileSync(file, svg);

  console.log(`Fixed: ${file}`);
}

console.log("Activity card formatting finished.");
