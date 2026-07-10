import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"
export const alt = "Matt Brassey — Blockchain Infrastructure Architect & Engineering Manager"

async function loadFonts() {
  try {
    const [bold, regular] = await Promise.all([
      fetch(
        "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Bold.ttf",
      ).then((r) => r.arrayBuffer()),
      fetch(
        "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Regular.ttf",
      ).then((r) => r.arrayBuffer()),
    ])
    return [
      { name: "JetBrains Mono", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "JetBrains Mono", data: regular, weight: 400 as const, style: "normal" as const },
    ]
  } catch {
    return undefined
  }
}

export default async function OpengraphImage() {
  const fonts = await loadFonts()

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#000102",
        padding: "72px 80px",
        position: "relative",
        fontFamily: fonts ? "JetBrains Mono" : "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "linear-gradient(rgba(75,127,155,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(75,127,155,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, rgba(75,127,155,0.1), #4B7F9B, rgba(107,163,191,0.4))",
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#10b981",
            display: "flex",
            boxShadow: "0 0 18px rgba(16,185,129,0.8)",
          }}
        />
        <div style={{ fontSize: "20px", letterSpacing: "8px", color: "#34d399", display: "flex" }}>OPERATIONAL</div>
        <div style={{ fontSize: "20px", letterSpacing: "4px", color: "#475569", display: "flex" }}>
          // ENGINEERING MANAGER, STAKING
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "96px", fontWeight: 700, color: "#e2e8f0", display: "flex", letterSpacing: "-4px" }}>
          Matt Brassey
        </div>
        <div style={{ fontSize: "34px", color: "#4B7F9B", display: "flex" }}>
          Blockchain Infrastructure Architect
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "24px", color: "#64748b", display: "flex" }}>
          50+ validators · 25+ protocols · $500M+ staked AUM
        </div>
        <div style={{ fontSize: "26px", display: "flex" }}>
          <span style={{ color: "#4B7F9B" }}>brassey</span>
          <span style={{ color: "#475569" }}>.io</span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  )
}
