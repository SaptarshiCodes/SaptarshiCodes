"use client";

import SoftAurora from "./SoftAurora";

export default function ContactWithAurora() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "32px 20px 0",
        textAlign: "center",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: "26px",
          fontWeight: 800,
          margin: "0 0 12px 0",
          letterSpacing: "-0.02em",
          color: "#FFFFFF",
        }}
      >
        Contact Me
      </h2>

      <p
        style={{
          fontSize: "14px",
          margin: "0 0 20px 0",
          color: "#AAA8B4",
          maxWidth: "640px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        I'm always open to discussing new software engineering opportunities,
        open-source collaborations, competitive programming, or innovative tech
        projects. Feel free to reach out through any of the channels below!
      </p>

      {/* Action Links */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <a
          href="mailto:mannasaptarshi1@gmail.com"
          style={{
            padding: "8px 18px",
            backgroundColor: "#EA4335",
            color: "#FFFFFF",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Email
        </a>
        <a
          href="https://www.linkedin.com/in/saptarshi-manna-ju28/"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 18px",
            backgroundColor: "#0A66C2",
            color: "#FFFFFF",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/SaptarshiCodes"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 18px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            color: "#FFFFFF",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          GitHub
        </a>
      </div>

      {/* Pure Transparent SoftAurora Animation Configured with Exact Preset Values */}
      <div
        style={{
          width: "100%",
          height: "150px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SoftAurora
          color1="#f7f7f7"
          color2="#e100ff"
          spectrum={1}
          speed={0.6}
          colorSpeed={1.7}
          scale={1.1}
          brightness={0.65}
          noiseFrequency={2.5}
          noiseAmplitude={2.5}
          bandHeight={0.5}
          bandSpread={1.3}
          tilt={0}
          octaveDecay={0.14}
          layerOffset={1}
          enableMouseInteraction={false}
          mouseInfluence={0}
          clickPulse={false}
          intro={true}
          lightMode={false}
        />
      </div>
    </div>
  );
}
