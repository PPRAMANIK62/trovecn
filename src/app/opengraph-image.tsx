import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { registry } from "@/lib/components-registry";

export const alt = "trove/cn — a collected component registry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules/geist/dist/fonts");

export default async function Image() {
  const [geistRegular, geistSemiBold, geistMonoRegular] = await Promise.all([
    readFile(join(FONT_DIR, "geist-sans/Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "geist-sans/Geist-SemiBold.ttf")),
    readFile(join(FONT_DIR, "geist-mono/GeistMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#181818",
        padding: "72px",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 22,
          letterSpacing: 1,
          color: "#7c9cf5",
        }}
      >
        {registry.length} components, growing...
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontWeight: 600,
            fontSize: 32,
            color: "#f7f7f7",
            marginBottom: 28,
          }}
        >
          trove/cn
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 600,
            fontSize: 58,
            lineHeight: 1.2,
            color: "#f7f7f7",
            maxWidth: 980,
          }}
        >
          The small details that make interfaces feel premium.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.5,
            color: "#adadad",
            marginTop: 28,
            maxWidth: 860,
          }}
        >
          A registry of polished interface patterns, shipped as source you own.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: 32,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 22, color: "#f7f7f7" }}>
          trovecn.dev
        </div>
        <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, color: "#adadad" }}>
          copy-paste source
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: geistMonoRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
