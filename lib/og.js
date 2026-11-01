import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Dharma Web Services — premium websites that convert";

// The card is pre-rendered at build time, so reading from the project root is safe.
const load = (rel) => readFile(path.join(process.cwd(), rel));

// Shared renderer for the Open Graph and Twitter share cards.
export async function renderShareCard() {
  const [bold, medium, mark] = await Promise.all([
    load("app/fonts/inter-latin-700-normal.woff"),
    load("app/fonts/inter-latin-500-normal.woff"),
    load("public/dws-mark.png"),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#faf7f0",
          backgroundImage:
            "radial-gradient(circle at 88% 6%, rgba(182,138,46,0.2), rgba(250,247,240,0) 55%)",
          fontFamily: "Inter",
          color: "#14213d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={150} height={102} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#8a6414",
              fontFamily: "Inter",
            }}
          >
            Bangalore · India
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>
            Premium websites
          </div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 700, lineHeight: 1.05, letterSpacing: -4, color: "#8a6414" }}>
            that convert.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Inter", fontSize: 26, color: "#3b3e46" }}>
          <div style={{ display: "flex" }}>Dharma Web Services</div>
          <div style={{ display: "flex", color: "#14213d" }}>dharmawebservice.in</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength), style: "normal", weight: 700 },
        { name: "Inter", data: medium.buffer.slice(medium.byteOffset, medium.byteOffset + medium.byteLength), style: "normal", weight: 500 },
      ],
    }
  );
}
