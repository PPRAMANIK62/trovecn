import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const FONT_PATH = join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf",
);

// The "/" from the wordmark (see Brand, src/components/site/brand.tsx) —
// same #181818/#7c9cf5 pairing the OG image uses, so the tab icon and the
// social card read as the same mark.
export default async function Icon() {
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
        borderRadius: 7,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 22,
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
