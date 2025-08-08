import { ImageResponse } from "next/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0b0b0b", GOLD = "#d8bd6c", FG = "#e9e4d0";

export default async function OpengraphImage(req: Request) {
  const url = new URL(req.url);
  const ref = (url.searchParams.get("ref") || "").slice(0, 40);
  const mixParam = url.searchParams.get("mix") || url.searchParams.get("flavor") || "";
  const mix = mixParam
    .split(/[|,]/).map(s => s.trim()).filter(Boolean).slice(0, 4); // up to 4 flavors
  const mixText = mix.length ? mix.join(" • ") : "Signature Mix";

  return new ImageResponse(
    (
      <div style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Roboto",
        color: FG, background: BG, width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 1040, height: 460, borderRadius: 24, border: "1px solid #222",
          padding: 48, display: "grid", gap: 12, background: "#111",
          boxShadow: "0 0 0 1px rgba(216,189,108,.15) inset"
        }}>
          <div style={{ color: GOLD, fontSize: 80, lineHeight: 1, fontWeight: 800 }}>Hookah+</div>
          <div style={{ fontSize: 34, opacity: 0.92 }}>Live Session Demo</div>

          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            <div style={{ fontSize: 26, opacity: 0.85 }}>
              Flavor Mix: <span style={{ color: GOLD }}>{mixText}</span>
            </div>
            {ref ? (
              <div style={{ fontSize: 24, opacity: 0.8 }}>
                Referral: <span style={{ color: GOLD }}>{ref}</span>
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, fontSize: 20, opacity: 0.65 }}>hookahplus.net/demo</div>
        </div>
      </div>
    ),
    size
  );
}
