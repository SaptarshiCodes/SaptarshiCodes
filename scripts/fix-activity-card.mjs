import fs from "node:fs";

const files = [
  "profile/activity-consistency-wide-light.svg",
  "profile/activity-consistency-wide-dark.svg",
];

function modifyTextElement(svg, text, changes) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `<text\\b([^>]*)>\\s*${escapedText}\\s*<\\/text>`,
    "g"
  );

  return svg.replace(regex, (match, attributes) => {
    let attrs = attributes;

    if (changes.x !== undefined) {
      if (/\bx="/.test(attrs)) {
        attrs = attrs.replace(/\bx="[^"]*"/, `x="${changes.x}"`);
      } else {
        attrs += ` x="${changes.x}"`;
      }
    }

    if (changes.y !== undefined) {
      if (/\by="/.test(attrs)) {
        attrs = attrs.replace(/\by="[^"]*"/, `y="${changes.y}"`);
      } else {
        attrs += ` y="${changes.y}"`;
      }
    }

    if (changes.fontSize !== undefined) {
      if (/font-size="/.test(attrs)) {
        attrs = attrs.replace(
          /font-size="[^"]*"/,
          `font-size="${changes.fontSize}"`
        );
      } else {
        attrs += ` font-size="${changes.fontSize}"`;
      }
    }

    return `<text${attrs}>${text}</text>`;
  });
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping missing file: ${file}`);
    continue;
  }

  console.log(`Processing ${file}`);

  let svg = fs.readFileSync(file, "utf8");

  // ------------------------------------------
  // / 365
  // ------------------------------------------

  svg = modifyTextElement(svg, "/ 365", {
    x: 255,
    y: 88,
  });

  // ------------------------------------------
  // ACTIVE DAYS
  // ------------------------------------------

  svg = modifyTextElement(svg, "ACTIVE DAYS", {
    x: 255,
    y: 118,
  });

  // ------------------------------------------
  // CURRENT STREAK
  // ------------------------------------------

  svg = modifyTextElement(svg, "CURRENT STREAK · DAYS", {
    x: 365,
    y: 126,
  });

  // ------------------------------------------
  // LONGEST STREAK
  // ------------------------------------------

  svg = modifyTextElement(svg, "LONGEST STREAK · DAYS", {
    x: 505,
    y: 126,
  });

  fs.writeFileSync(file, svg);

  console.log(`Successfully updated ${file}`);
}

console.log("Activity card formatting completed.");
