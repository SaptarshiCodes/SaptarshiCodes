import fs from "node:fs";

const filesToProcess = [
  {
    path: "profile/signal-field-v2-wide-dark.svg",
    w: 1280,
    h: 300,
    isDark: true,
    accent: "#ff8068",
    twinkles: [
      { x: 468, y: 72, k: "a" },
      { x: 864, y: 180, k: "b" },
      { x: 180, y: 216, k: "a" },
      { x: 1116, y: 108, k: "b" }
    ]
  },
  {
    path: "profile/signal-field-v2-wide-light.svg",
    w: 1280,
    h: 300,
    isDark: false,
    accent: "#e66b55",
    twinkles: [
      { x: 468, y: 72, k: "a" },
      { x: 864, y: 180, k: "b" },
      { x: 180, y: 216, k: "a" },
      { x: 1116, y: 108, k: "b" }
    ]
  },
  {
    path: "profile/signal-field-wide-dark.svg",
    w: 1280,
    h: 300,
    isDark: true,
    accent: "#ff8068",
    twinkles: [
      { x: 468, y: 72, k: "a" },
      { x: 864, y: 180, k: "b" },
      { x: 180, y: 216, k: "a" },
      { x: 1116, y: 108, k: "b" }
    ]
  },
  {
    path: "profile/signal-field-wide-light.svg",
    w: 1280,
    h: 300,
    isDark: false,
    accent: "#e66b55",
    twinkles: [
      { x: 468, y: 72, k: "a" },
      { x: 864, y: 180, k: "b" },
      { x: 180, y: 216, k: "a" },
      { x: 1116, y: 108, k: "b" }
    ]
  },
  {
    path: "profile/activity-consistency-wide-dark.svg",
    w: 640,
    h: 360,
    isDark: true,
    accent: "#F08A5B",
    twinkles: [
      { x: 432, y: 72, k: "a" },
      { x: 144, y: 288, k: "b" },
      { x: 360, y: 144, k: "a" }
    ]
  },
  {
    path: "profile/activity-consistency-wide-light.svg",
    w: 640,
    h: 360,
    isDark: false,
    accent: "#C54B32",
    twinkles: [
      { x: 432, y: 72, k: "a" },
      { x: 144, y: 288, k: "b" },
      { x: 360, y: 144, k: "a" }
    ]
  },
  {
    path: "profile/activity-consistency-compact-dark.svg",
    w: 320,
    h: 528,
    isDark: true,
    accent: "#F08A5B",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 72, y: 252, k: "b" }
    ]
  },
  {
    path: "profile/activity-consistency-compact-light.svg",
    w: 320,
    h: 528,
    isDark: false,
    accent: "#C54B32",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 72, y: 252, k: "b" }
    ]
  },
  {
    path: "profile/language-composition-wide-dark.svg",
    w: 640,
    h: 360,
    isDark: true,
    accent: "#BAC37C",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 504, y: 216, k: "b" },
      { x: 108, y: 252, k: "a" }
    ]
  },
  {
    path: "profile/language-composition-wide-light.svg",
    w: 640,
    h: 360,
    isDark: false,
    accent: "#59622D",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 504, y: 216, k: "b" },
      { x: 108, y: 252, k: "a" }
    ]
  },
  {
    path: "profile/language-composition-compact-dark.svg",
    w: 320,
    h: 528,
    isDark: true,
    accent: "#BAC37C",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 72, y: 360, k: "b" }
    ]
  },
  {
    path: "profile/language-composition-compact-light.svg",
    w: 320,
    h: 528,
    isDark: false,
    accent: "#59622D",
    twinkles: [
      { x: 216, y: 72, k: "a" },
      { x: 72, y: 360, k: "b" }
    ]
  }
];

for (const item of filesToProcess) {
  if (!fs.existsSync(item.path)) {
    console.log(`Skipping non-existent file: ${item.path}`);
    continue;
  }

  let svg = fs.readFileSync(item.path, "utf8");

  // Check if shape-grid is already injected
  if (svg.includes("shape-grid-drift")) {
    console.log(`Already has ShapeGrid: ${item.path}`);
    continue;
  }

  const slug = item.path.replace(/[^a-zA-Z0-9]/g, "_");
  const patternId = `sgPattern_${slug}`;
  const maskId = `sgMask_${slug}`;
  const gridLineColor = item.isDark ? "#1a202c" : "#E6EBF2";
  const gridDotColor = item.isDark ? "#2e384d" : "#D0D7DE";

  const defsContent = `
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
    <!-- React Bits ShapeGrid Pattern & Mask -->
    <pattern id="${patternId}" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="${gridLineColor}" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="1.2" fill="${gridDotColor}"/>
    </pattern>
    <radialGradient id="grad_${maskId}" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05"/>
    </radialGradient>
    <mask id="${maskId}">
      <rect width="${item.w}" height="${item.h}" fill="url(#grad_${maskId})"/>
    </mask>
  </defs>`;

  const twinkleSvg = item.twinkles
    .map(t => {
      const cls = t.k === "a" ? "twinkle-a" : "twinkle-b";
      const op = t.k === "a" ? "0.18" : "0.14";
      return `<rect x="${t.x}" y="${t.y}" width="35" height="35" rx="3" fill="${item.accent}" fill-opacity="${op}" stroke="${item.accent}" stroke-width="0.8" class="${cls}"/>`;
    })
    .join("\n    ");

  const bgLayer = `
  <!-- React Bits <ShapeGrid /> Background Layer -->
  <g mask="url(#${maskId})" pointer-events="none">
    <g class="shape-grid-drift">
      <rect x="-72" y="-72" width="${item.w + 144}" height="${item.h + 144}" fill="url(#${patternId})"/>
    </g>
    ${twinkleSvg}
  </g>`;

  // Insert <defs> before first <rect
  if (svg.includes("<defs>")) {
    svg = svg.replace("</defs>", `${defsContent}\n  </defs>`);
  } else {
    // Insert <defs> right after <svg ...>
    svg = svg.replace(/(<svg[^>]*>)/i, `$1\n${defsContent}`);
  }

  // Insert bgLayer right after the first background <rect ... fill="..." ...>
  // or after `<rect width="..." height="..." fill="..."`
  let replaced = false;
  svg = svg.replace(/(<rect\s+[^>]*?fill="(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)"[^>]*?>)/i, match => {
    if (!replaced) {
      replaced = true;
      return `${match}\n${bgLayer}`;
    }
    return match;
  });

  if (!replaced) {
    // fallback: insert after <defs>...</defs>
    svg = svg.replace("</defs>", `</defs>\n${bgLayer}`);
  }

  fs.writeFileSync(item.path, svg);
  console.log(`Successfully injected ShapeGrid into: ${item.path}`);
}

console.log("All activity cards injected successfully!");
