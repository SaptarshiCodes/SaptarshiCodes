import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
  "profile/activity-consistency-compact-light.svg",
  "profile/activity-consistency-compact-dark.svg",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} — file does not exist.`);
    continue;
  }

  let svg = fs.readFileSync(file, "utf8");

  /*
   * The original Shinpr wide card places /365 at x=88,
   * which overlaps the large active-days number.
   *
   * Move the supporting text further right.
   */

  svg = svg.replace(
    /<text x="88" y="88"([^>]*)>\/ 365<\/text>/,
    '<text x="255" y="88"$1>/ 365</text>'
  );

  svg = svg.replace(
    /<text x="88" y="118"([^>]*)>ACTIVE DAYS<\/text>/,
    '<text x="255" y="118"$1>ACTIVE DAYS</text>'
  );


  /*
   * Move the divider slightly to the right.
   */

  svg = svg.replace(
    /<path d="M290 66L290 137"/,
    '<path d="M350 66L350 137"'
  );


  /*
   * Move current streak.
   */

  svg = svg.replace(
    /<text x="320" y="105"/,
    '<text x="375" y="105"'
  );

  svg = svg.replace(
    /<text x="320" y="126"/,
    '<text x="375" y="126"'
  );


  /*
   * Move longest streak slightly right.
   */

  svg = svg.replace(
    /<text x="490" y="105"/,
    '<text x="515" y="105"'
  );

  svg = svg.replace(
    /<text x="490" y="126"/,
    '<text x="515" y="126"'
  );


  fs.writeFileSync(file, svg);

  console.log(`Fixed layout: ${file}`);
}import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
  "profile/activity-consistency-compact-light.svg",
  "profile/activity-consistency-compact-dark.svg",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} — file does not exist.`);
    continue;
  }

  let svg = fs.readFileSync(file, "utf8");

  /*
   * The original Shinpr wide card places /365 at x=88,
   * which overlaps the large active-days number.
   *
   * Move the supporting text further right.
   */

  svg = svg.replace(
    /<text x="88" y="88"([^>]*)>\/ 365<\/text>/,
    '<text x="255" y="88"$1>/ 365</text>'
  );

  svg = svg.replace(
    /<text x="88" y="118"([^>]*)>ACTIVE DAYS<\/text>/,
    '<text x="255" y="118"$1>ACTIVE DAYS</text>'
  );


  /*
   * Move the divider slightly to the right.
   */

  svg = svg.replace(
    /<path d="M290 66L290 137"/,
    '<path d="M350 66L350 137"'
  );


  /*
   * Move current streak.
   */

  svg = svg.replace(
    /<text x="320" y="105"/,
    '<text x="375" y="105"'
  );

  svg = svg.replace(
    /<text x="320" y="126"/,
    '<text x="375" y="126"'
  );


  /*
   * Move longest streak slightly right.
   */

  svg = svg.replace(
    /<text x="490" y="105"/,
    '<text x="515" y="105"'
  );

  svg = svg.replace(
    /<text x="490" y="126"/,
    '<text x="515" y="126"'
  );


  fs.writeFileSync(file, svg);

  console.log(`Fixed layout: ${file}`);
}
