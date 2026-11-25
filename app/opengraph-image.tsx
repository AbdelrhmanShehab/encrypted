import { ImageResponse } from "next/og";

export const alt = "Encrypted — Egyptian menswear marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 35%, #06180a 0%, #030503 68%)",
          color: "#f1f5f1",
        }}
      >
        <div style={{ width: 120, height: 1, background: "#00f23a", marginBottom: 40 }} />
        <div style={{ fontSize: 132, letterSpacing: 24, fontWeight: 600, color: "#00f23a" }}>ENCRYPTED</div>
        <div style={{ fontSize: 30, letterSpacing: 10, marginTop: 28, color: "#b1bcb2" }}>
          MENSWEAR, DECODED.
        </div>
        <div style={{ width: 120, height: 1, background: "#00f23a", marginTop: 40 }} />
      </div>
    ),
    size
  );
}
