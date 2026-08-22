import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { registry } from "@/lib/components-registry";

export const alt =
  "trove/cn — components that keep listening. A notification pile and a set of sliders, rendered in the dark theme.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules/geist/dist/fonts");

/**
 * The share card. Half claim, half product shot.
 *
 * The previous version was five stacked strings and nothing else — it told
 * you the components felt good and showed you a paragraph. What a registry's
 * card can usefully carry is the thing itself, so the right half is a real
 * miniature: the notification pile with the two edges peeking out underneath
 * it, and a pair of slider tracks. It reads as a screenshot of the product
 * rather than a quote about it, which is also what makes it legible at
 * timeline size, where 58px of body copy is not.
 *
 * DEPARTURE — hardcoded colours. design-system.md forbids them everywhere
 * else, and there is no way around it here: Satori resolves styles at build
 * time with no stylesheet and no CSS custom properties, so `var(--card)`
 * renders as nothing. These six are the dark-theme ladder transcribed by
 * hand — background, then two raised planes for the pile, then the same
 * foreground/muted/border relationships. They are the only hex values in the
 * project and they exist because ImageResponse cannot read the token layer.
 *
 * Every element carrying children needs an explicit `display: flex`; Satori
 * has no block layout. The pile is three absolutely-positioned layers rather
 * than negative margins, because paint order follows the DOM and stacked
 * siblings would draw over the front card's rounded bottom edge.
 */
const C = {
  bg: "#141414",
  plane: "#1c1c1c", // panel surface, one step up from bg
  card: "#3a3a3a", // the front notification — the top of the elevation ladder
  cardBack: "#2e2e2e", // second in the pile
  cardBackest: "#2a2a2a", // third, furthest from the reader
  fg: "#f7f7f7",
  muted: "#a6a6a6",
  faint: "#7a7a7a",
  border: "rgba(255,255,255,0.10)",
  bevel: "rgba(255,255,255,0.08)", // the front card's lit top edge
  track: "#4a4a4a",
};

function SliderRow({ label, value, fill }: { label: string; value: string; fill: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", fontSize: 17, color: C.fg }}>{label}</div>
        <div style={{ display: "flex", fontSize: 16, color: C.muted }}>{value}</div>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 8,
          borderRadius: 999,
          backgroundColor: C.track,
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${fill}%`,
            height: 8,
            borderRadius: 999,
            backgroundColor: C.fg,
          }}
        />
      </div>
    </div>
  );
}

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
        backgroundColor: C.bg,
        fontFamily: "Geist",
      }}
    >
      {/* Claim */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 620,
          padding: "64px 0 64px 68px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, color: C.fg }}>
            <span style={{ fontWeight: 600 }}>trove</span>
            <span style={{ fontFamily: "Geist Mono", color: C.faint }}>/cn</span>
          </div>

          <div
            style={{
              display: "flex",
              fontWeight: 600,
              fontSize: 62,
              lineHeight: 1.1,
              letterSpacing: -2,
              color: C.fg,
              marginTop: 40,
              maxWidth: 500,
            }}
          >
            Components that keep listening.
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 23,
              lineHeight: 1.5,
              color: C.muted,
              marginTop: 24,
              maxWidth: 470,
            }}
          >
            Native controls track your input the whole way. Most web components fire once and stop.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 19,
            marginTop: 52,
          }}
        >
          <span style={{ color: C.fg }}>trovecn.dev</span>
          <span style={{ color: C.faint, margin: "0 12px" }}>·</span>
          <span style={{ color: C.faint }}>{registry.length} components, copy-paste source</span>
        </div>
      </div>

      {/* Product shot */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingRight: 68,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: 24,
            borderRadius: 18,
            backgroundColor: C.plane,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: 13,
                letterSpacing: 1.2,
                color: C.faint,
              }}
            >
              NOTIFICATIONS
            </div>
            <div style={{ display: "flex", fontSize: 14, color: C.faint }}>Expand</div>
          </div>

          {/* The pile. Depth is scale and offset, never opacity — a faded
              buried card washes toward the background and the stack turns
              into a smudge (design-system.md "Look"). */}
          <div style={{ display: "flex", position: "relative", width: "100%", height: 122 }}>
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 30,
                left: "9%",
                width: "82%",
                height: 84,
                borderRadius: 14,
                backgroundColor: C.cardBackest,
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 15,
                left: "4.5%",
                width: "91%",
                height: 84,
                borderRadius: 14,
                backgroundColor: C.cardBack,
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 84,
                borderRadius: 14,
                backgroundColor: C.card,
                border: `1px solid ${C.bevel}`,
                padding: "16px 18px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: C.track,
                  marginRight: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      border: `2px solid ${C.muted}`,
                    }}
                  />
                  <div style={{ display: "flex", width: 2, height: 4, backgroundColor: C.muted }} />
                  <div
                    style={{
                      display: "flex",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      border: `2px solid ${C.muted}`,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: C.fg }}>
                  Review requested
                </div>
                <div style={{ display: "flex", fontSize: 15, color: C.muted, marginTop: 4 }}>
                  danabramov opened “Drop the scheduler”.
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 14, color: C.faint }}>now</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: C.border,
              marginTop: 26,
            }}
          />

          <SliderRow label="Volume" value="72%" fill={72} />
          <SliderRow label="Brightness" value="45%" fill={45} />
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
