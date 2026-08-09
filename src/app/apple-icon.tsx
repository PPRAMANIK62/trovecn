import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const FONT_PATH = join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf",
);

// Full-bleed square, no manual rounding — iOS applies its own squircle mask
// over apple-touch-icon, so a self-rounded corner would just double up.
export default async function AppleIcon() {
  const geistMonoBold = await readFile(FONT_PATH);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#181818",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 108,
          color: "#7c9cf5",
        }}
      >
        /
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Geist Mono", data: geistMonoBold, weight: 700, style: "normal" }],
    },
  );
}
