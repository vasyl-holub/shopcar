import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Прев'ю посилання в месенджерах. Шрифт не підвантажуємо: ImageResponse
 * малює кирилицю системним, а зайвий ttf важить більше, ніж дає.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #042256 0%, #1457a9 100%)",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.2 }}>
          {site.lead}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          fontSize: 28,
          color: "#c3d0e9",
        }}
      >
        <div style={{ display: "flex" }}>Polcar</div>
        <div style={{ display: "flex" }}>Signeda</div>
        <div style={{ display: "flex" }}>NTY</div>
        <div style={{ display: "flex" }}>DEPO</div>
        <div style={{ display: "flex" }}>SRLine</div>
      </div>
    </div>,
    size,
  );
}
