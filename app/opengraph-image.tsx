import { ImageResponse } from "next/og";

export const alt = "Modbay — see mods on your own car";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card in the app's workshop design language: graphite stage,
// gauge-amber accent, spec-sheet typography.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#141518",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#f2a324",
              borderRadius: 6,
            }}
          />
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 10,
              color: "#ece9e2",
            }}
          >
            MODBAY
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1.05,
              color: "#ece9e2",
              display: "flex",
            }}
          >
            YOUR CAR, MODIFIED
            <span style={{ color: "#f2a324" }}>.</span>
          </div>
          <div style={{ fontSize: 34, color: "#8f939b" }}>
            Upload a photo, spec the build, and see it on your actual car.
          </div>
        </div>

        {/* Spec-sheet footer strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            borderTop: "1px solid #2a2d33",
            paddingTop: 28,
            fontSize: 24,
            letterSpacing: 4,
            color: "#8f939b",
          }}
        >
          <span>PAINT</span>
          <span style={{ color: "#3b3f47" }}>·</span>
          <span>RIMS</span>
          <span style={{ color: "#3b3f47" }}>·</span>
          <span>STANCE</span>
          <span style={{ color: "#3b3f47" }}>·</span>
          <span>TINT</span>
          <span style={{ color: "#3b3f47" }}>·</span>
          <span>UNDERGLOW</span>
          <span style={{ flexGrow: 1 }} />
          <span style={{ color: "#f2a324" }}>MODBAY.VERCEL.APP</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
