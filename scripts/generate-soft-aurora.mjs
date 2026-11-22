import fs from "node:fs";

fs.mkdirSync("profile", { recursive: true });

/**
 * Key geometry insight:
 *   - Canvas H=220, W=1000
 *   - Threads centered at midY=185 (near-bottom)
 *   - Wave amplitude: crests at midY-38=147, troughs at midY+38=223 (clipped by canvas bottom, fine)
 *   - Largest blur stdDeviation=14 → 3σ=42px
 *   - Topmost glow: crest(147) - 3σ(42) = 105px from y=0 → NO clip artifact at top ✓
 *   - NO masks used at all — masks + mix-blend-mode are unreliable in GitHub SVG rendering
 *   - Top dissipation: purely via gaussian natural falloff (opacity reaches 0 well before y=0)
 *   - Bottom dissipation: threads go below canvas edge naturally (troughs at y=223 > H=220)
 *   - The SVG has a transparent background (no rect fill)
 */

function generateSoftAuroraSvg(isDark) {
  const W = 1000;
  const H = 220;
  const midY = 165; // threads sit in lower 85% of canvas

  // Colors tuned for GitHub dark (#0d1117) background
  const coreWhite      = "#f1f5f9";
  const electricBlue   = "#60a5fa";
  const neonCyan       = "#22d3ee";
  const indigoViolet   = "#818cf8";
  const deepViolet     = "#6d28d9";
  const vibrantMagenta = "#e879f9";
  const softMagenta    = "#c084fc";
  const tealGreen      = "#2dd4bf";
  const cobaltDeep     = "#3730a3";
  const midnightBlue   = "#1e1b4b";

  // Opacity layers
  const opCore = isDark ? "0.88" : "0.68";
  const opMid  = isDark ? "0.58" : "0.42";
  const opHalo = isDark ? "0.26" : "0.16";
  const opWash = isDark ? "0.12" : "0.07";
  const op3    = isDark ? "0.62" : "0.46";

  // Amplitude ±38px around midY=185
  // Crests at y=147, troughs at y=223 (below canvas, clipped cleanly)
  const amp = 38;

  function makeRibbon1() {
    let d = `M -500 ${midY}`;
    for (let x = -500; x < 3500; x += 1000) {
      d += ` C ${x+100} ${midY-18}, ${x+180} ${midY-amp}, ${x+280} ${midY-amp}`;
      d += ` C ${x+370} ${midY-amp}, ${x+400} ${midY+amp-4}, ${x+480} ${midY+amp-4}`;
      d += ` C ${x+565} ${midY+amp-4}, ${x+630} ${midY-8}, ${x+720} ${midY-8}`;
      d += ` C ${x+790} ${midY-8}, ${x+830} ${midY+10}, ${x+890} ${midY+10}`;
      d += ` C ${x+938} ${midY+10}, ${x+915} ${midY+20}, ${x+1000} ${midY}`;
    }
    return d;
  }

  function makeRibbon2() {
    let d = `M -500 ${midY+6}`;
    for (let x = -500; x < 3500; x += 1000) {
      d += ` C ${x+115} ${midY-10}, ${x+195} ${midY-26}, ${x+288} ${midY-26}`;
      d += ` C ${x+365} ${midY-26}, ${x+395} ${midY+amp+10}, ${x+475} ${midY+amp+10}`;
      d += ` C ${x+558} ${midY+amp+10}, ${x+638} ${midY},    ${x+728} ${midY}`;
      d += ` C ${x+798} ${midY},    ${x+840} ${midY+16}, ${x+900} ${midY+16}`;
      d += ` C ${x+950} ${midY+16}, ${x+920} ${midY+24}, ${x+1000} ${midY+6}`;
    }
    return d;
  }

  function makeRibbon3() {
    let d = `M -500 ${midY-4}`;
    for (let x = -500; x < 3500; x += 1000) {
      d += ` C ${x+92}  ${midY-22}, ${x+175} ${midY-30}, ${x+265} ${midY-30}`;
      d += ` C ${x+345} ${midY-30}, ${x+395} ${midY+22}, ${x+475} ${midY+22}`;
      d += ` C ${x+555} ${midY+22}, ${x+605} ${midY-25}, ${x+685} ${midY-25}`;
      d += ` C ${x+765} ${midY-25}, ${x+835} ${midY+28}, ${x+905} ${midY+28}`;
      d += ` C ${x+950} ${midY+28}, ${x+940} ${midY+12}, ${x+1000} ${midY-4}`;
    }
    return d;
  }

  const path1 = makeRibbon1();
  const path2 = makeRibbon2();
  const path3 = makeRibbon3();

  // Blur IDs scoped to dark/light so both SVGs can coexist
  const sfx = isDark ? "d" : "l";

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      <![CDATA[
      @keyframes softFlow1 { 0%{transform:translateX(0px)} 100%{transform:translateX(-1000px)} }
      @keyframes softFlow2 { 0%{transform:translateX(-1000px)} 100%{transform:translateX(0px)} }
      @keyframes softFlow3 { 0%,100%{transform:translateX(-500px)} 50%{transform:translateX(0px)} }
      @keyframes softBreathe { 0%,100%{opacity:.85} 50%{opacity:1} }
      .fl1{animation:softFlow1 11s linear infinite}
      .fl2{animation:softFlow2 15s linear infinite}
      .fl3{animation:softFlow3 19s ease-in-out infinite}
      .breathe{animation:softBreathe 4.5s ease-in-out infinite}
      @media(prefers-reduced-motion:reduce){.fl1,.fl2,.fl3,.breathe{animation:none!important}}
      ]]>
    </style>

    <!-- Blur filters: stdDeviation ≤14 so 3σ=42px. Crests at y=147. 147-42=105 > 0. No clip. -->
    <filter id="spine_${sfx}"   x="-5%" y="-600%" width="110%" height="1200%"><feGaussianBlur stdDeviation="1.2"/></filter>
    <filter id="core_${sfx}"    x="-5%" y="-600%" width="110%" height="1200%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="silk_${sfx}"    x="-5%" y="-600%" width="110%" height="1200%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="halo_${sfx}"    x="-5%" y="-600%" width="110%" height="1200%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="ambient_${sfx}" x="-5%" y="-600%" width="110%" height="1200%"><feGaussianBlur stdDeviation="14"/></filter>

    <!-- Thread 1: Magenta → Indigo → White → Cyan → Magenta -->
    <linearGradient id="g1_${sfx}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
      <stop offset="12%"  stop-color="${indigoViolet}"   stop-opacity="${opMid}"/>
      <stop offset="24%"  stop-color="${coreWhite}"      stop-opacity="${opCore}"/>
      <stop offset="30%"  stop-color="${electricBlue}"   stop-opacity="${opCore}"/>
      <stop offset="38%"  stop-color="${neonCyan}"       stop-opacity="${opMid}"/>
      <stop offset="50%"  stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
      <stop offset="60%"  stop-color="${indigoViolet}"   stop-opacity="${opCore}"/>
      <stop offset="72%"  stop-color="${deepViolet}"     stop-opacity="${opMid}"/>
      <stop offset="86%"  stop-color="${indigoViolet}"   stop-opacity="${opMid}"/>
      <stop offset="100%" stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
    </linearGradient>
    <linearGradient id="g1c_${sfx}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
      <stop offset="16%"  stop-color="${indigoViolet}"   stop-opacity="${opCore}"/>
      <stop offset="26%"  stop-color="${coreWhite}"      stop-opacity="${opCore}"/>
      <stop offset="34%"  stop-color="${electricBlue}"   stop-opacity="${opCore}"/>
      <stop offset="44%"  stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
      <stop offset="58%"  stop-color="${indigoViolet}"   stop-opacity="${opCore}"/>
      <stop offset="74%"  stop-color="${deepViolet}"     stop-opacity="${opMid}"/>
      <stop offset="88%"  stop-color="${indigoViolet}"   stop-opacity="${opMid}"/>
      <stop offset="100%" stop-color="${vibrantMagenta}" stop-opacity="${opMid}"/>
    </linearGradient>

    <!-- Thread 2: Deep cobalt/violet undertone -->
    <linearGradient id="g2_${sfx}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${softMagenta}"  stop-opacity="${opHalo}"/>
      <stop offset="20%"  stop-color="${deepViolet}"   stop-opacity="${opHalo}"/>
      <stop offset="34%"  stop-color="${cobaltDeep}"   stop-opacity="${opMid}"/>
      <stop offset="48%"  stop-color="${softMagenta}"  stop-opacity="${opMid}"/>
      <stop offset="58%"  stop-color="${indigoViolet}" stop-opacity="${opMid}"/>
      <stop offset="74%"  stop-color="${midnightBlue}" stop-opacity="${opHalo}"/>
      <stop offset="88%"  stop-color="${softMagenta}"  stop-opacity="${opHalo}"/>
      <stop offset="100%" stop-color="${softMagenta}"  stop-opacity="${opHalo}"/>
    </linearGradient>

    <!-- Thread 3: Cyan/Teal accent -->
    <linearGradient id="g3_${sfx}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${tealGreen}"    stop-opacity="${opHalo}"/>
      <stop offset="22%"  stop-color="${neonCyan}"     stop-opacity="${op3}"/>
      <stop offset="42%"  stop-color="${electricBlue}" stop-opacity="${op3}"/>
      <stop offset="62%"  stop-color="${deepViolet}"   stop-opacity="${opHalo}"/>
      <stop offset="80%"  stop-color="${tealGreen}"    stop-opacity="${op3}"/>
      <stop offset="100%" stop-color="${neonCyan}"     stop-opacity="${opHalo}"/>
    </linearGradient>
  </defs>

  <!-- NO background rect. NO masks. Threads dissipate naturally via gaussian falloff. -->
  <g class="breathe">
    <!-- Thread 2: cobalt/violet undertone -->
    <g class="fl2" filter="url(#ambient_${sfx})">
      <path d="${path2}" stroke="url(#g2_${sfx})" stroke-width="15"  stroke-linecap="round" fill="none" opacity="${opWash}"/>
    </g>
    <g class="fl2" filter="url(#silk_${sfx})">
      <path d="${path2}" stroke="url(#g2_${sfx})" stroke-width="6.5" stroke-linecap="round" fill="none" opacity="${opMid}"/>
    </g>
    <g class="fl2" filter="url(#core_${sfx})">
      <path d="${path2}" stroke="url(#g2_${sfx})" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="${opCore}"/>
    </g>

    <!-- Thread 3: cyan/teal accent -->
    <g class="fl3" filter="url(#ambient_${sfx})">
      <path d="${path3}" stroke="url(#g3_${sfx})" stroke-width="12"  stroke-linecap="round" fill="none" opacity="${opWash}"/>
    </g>
    <g class="fl3" filter="url(#silk_${sfx})">
      <path d="${path3}" stroke="url(#g3_${sfx})" stroke-width="5"   stroke-linecap="round" fill="none" opacity="${opMid}"/>
    </g>
    <g class="fl3" filter="url(#core_${sfx})">
      <path d="${path3}" stroke="url(#g3_${sfx})" stroke-width="1.9" stroke-linecap="round" fill="none" opacity="${op3}"/>
    </g>

    <!-- Thread 1: front dominant — magenta/indigo/white -->
    <g class="fl1" filter="url(#ambient_${sfx})">
      <path d="${path1}" stroke="url(#g1_${sfx})"  stroke-width="16"  stroke-linecap="round" fill="none" opacity="${opWash}"/>
    </g>
    <g class="fl1" filter="url(#halo_${sfx})">
      <path d="${path1}" stroke="url(#g1_${sfx})"  stroke-width="16"  stroke-linecap="round" fill="none" opacity="${opHalo}"/>
    </g>
    <g class="fl1" filter="url(#silk_${sfx})">
      <path d="${path1}" stroke="url(#g1_${sfx})"  stroke-width="7.5" stroke-linecap="round" fill="none" opacity="${opMid}"/>
    </g>
    <g class="fl1" filter="url(#core_${sfx})">
      <path d="${path1}" stroke="url(#g1c_${sfx})" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="${opCore}"/>
    </g>
    <g class="fl1" filter="url(#spine_${sfx})">
      <path d="${path1}" stroke="${coreWhite}"       stroke-width="1.2" stroke-linecap="round" fill="none" opacity="${isDark ? "0.70" : "0.50"}"/>
    </g>
  </g>
</svg>`;
}

function main() {
  console.log("Generating SoftAurora SVGs...");
  console.log("  midY=185, amp=38 → crests at y=147");
  console.log("  Largest blur: stdDeviation=14, 3σ=42 → glow top at y=105 (clear of y=0)");
  console.log("  NO masks, NO mix-blend-mode — pure gaussian natural falloff");
  fs.writeFileSync("profile/contact-card-dark.svg",  generateSoftAuroraSvg(true));
  fs.writeFileSync("profile/contact-card-light.svg", generateSoftAuroraSvg(false));
  console.log("Done! contact-card-dark.svg + contact-card-light.svg written.");
}

main();
