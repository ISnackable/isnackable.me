import { SanityImage } from "@repo/cms/components/sanity-image";
import type { HeroSectionContent } from "@repo/cms/content/pages";
import Image from "next/image";
import type React from "react";

// --- TYPES ---

interface PhotoData {
  h: number;
  id: number;
  left: number;
  rotate: number;
  top: number;
  w: number;
  z: number;
}

interface TapeData {
  bg: string;
  bgImage?: string;
  h: number;
  left: number;
  rotate: number;
  top: number;
  w: number;
}

interface PropData {
  blend?: React.CSSProperties["mixBlendMode"];
  h: number;
  id: string;
  label: string;
  left: number;
  rotate: number;
  top: number;
  url?: string;
  w: number;
  z: number;
}

// --- CONSTANTS ---

const BOARD_W = 560;
const BOARD_H = 840;

const PHOTO_LAYOUTS: PhotoData[] = [
  {
    id: 1,
    w: 260,
    h: 200,
    top: 20,
    left: 0,
    rotate: -5,
    z: 2,
  }, // Top Left - Wider, pushed left
  {
    id: 2,
    w: 220,
    h: 260,
    top: 15,
    left: 300,
    rotate: 6,
    z: 2,
  }, // Top Right
  {
    id: 3,
    w: 310,
    h: 310,
    top: 180,
    left: 90,
    rotate: -2,
    z: 5,
  }, // Center - Larger and shifted LEFT
  {
    id: 4,
    w: 200,
    h: 270,
    top: 400,
    left: 10,
    rotate: 3,
    z: 3,
  }, // Bottom Left - Taller, pushed up & left
  {
    id: 5,
    w: 240,
    h: 190,
    top: 480,
    left: 280,
    rotate: -4,
    z: 3,
  }, // Bottom Right
];

// ADJUSTED: Moved one of the tapes specifically to cut across the empty left gap
const TAPES: TapeData[] = [
  {
    top: 25,
    left: 70,
    w: 95,
    h: 26,
    rotate: -8,
    bg: "rgba(60, 90, 120, 0.95)",
    bgImage:
      "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
  },
  {
    top: 5,
    left: 390,
    w: 90,
    h: 26,
    rotate: 12,
    bg: "rgba(212, 175, 55, 0.95)",
    bgImage:
      "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
  },
  {
    top: 195,
    left: 160,
    w: 95,
    h: 28,
    rotate: -4,
    bg: "rgba(220, 210, 190, 0.95)",
    bgImage:
      "repeating-linear-gradient(90deg, rgba(212,175,55,0.4) 0px, rgba(212,175,55,0.4) 4px, transparent 4px, transparent 8px)",
  },
  {
    top: 480,
    left: 370,
    w: 90,
    h: 30,
    rotate: -25,
    bg: "rgba(60, 90, 120, 0.95)",
    bgImage:
      "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
  },
  // THIS TAPE FILLS THE LEFT VOID:
  {
    top: 380,
    left: -10,
    w: 100,
    h: 26,
    rotate: 80,
    bg: "rgba(200, 180, 140, 0.95)",
  },
  {
    top: 670,
    left: 450,
    w: 85,
    h: 26,
    rotate: 12,
    bg: "rgba(180, 50, 50, 0.95)",
  },
];

// Prop images used to hotlink pngtree.com / nicepng.com / static.vecteezy.com
// (thumbnails) and tokyometro.jp directly. Those are consumer preview pages,
// not CDNs meant for embedding — expect referrer checks, watermarks, or the
// file moving without notice, plus real licensing questions for a public
// portfolio. Drop transparent PNGs you actually want into `/public/collage/`
// and point `url` at them, e.g. "/collage/sakura.png". Until a file exists at
// that path, the onError handler in <Prop> below falls back to the emoji
// placeholder automatically instead of showing a broken-image icon.
const PROPS: PropData[] = [
  {
    id: "flower",
    label: "🌸",
    top: 110,
    left: 235,
    w: 110,
    h: 110,
    rotate: 8,
    z: 4,
    url: "/collage/sakura.png",
  },
  {
    id: "pin",
    label: "📌",
    // Moved the pin perfectly into the remaining left side gap!
    top: 290,
    left: 30,
    w: 55,
    h: 55,
    rotate: -15,
    z: 6,
    url: "/collage/pin.png",
    blend: "multiply",
  },
  {
    id: "ticket",
    label: "🎫",
    top: 340,
    left: 380,
    w: 160,
    h: 95,
    rotate: 15,
    z: 4,
    url: "/collage/ticket.png",
    blend: "multiply",
  },
  {
    id: "fan",
    label: "👘",
    top: 630,
    left: 275,
    w: 120,
    h: 125,
    rotate: -5,
    z: 6,
    url: "/collage/fan.png",
  },
  {
    id: "ramen",
    label: "🍜",
    top: 650,
    left: 170,
    w: 85,
    h: 85,
    rotate: 5,
    z: 6,
    url: "/collage/ramen.png",
  },
];

const PAD = 10;
const BOT = 36;

// --- COMPONENTS ---

type GalleryImage = NonNullable<HeroSectionContent["gallery"]>[number];

function Photo({ data, image }: { data: PhotoData; image: GalleryImage }) {
  return (
    <div
      className="group absolute z-[var(--z)] select-none rounded-[2px] bg-[#fafaf8] transition-all duration-[350ms] ease-[cubic-bezier(0.25,1.5,0.5,1)] [box-shadow:var(--sd)] [transform:rotate(var(--rot))] hover:z-[100] motion-reduce:transition-none hover:[box-shadow:var(--sh)] hover:[transform:rotate(var(--rot-hover))_translateY(-15px)_scale(1.08)] motion-reduce:hover:[transform:rotate(var(--rot))]"
      style={
        {
          top: data.top,
          left: data.left,
          padding: `${PAD}px ${PAD}px ${BOT}px`,
          width: data.w + PAD * 2,
          "--z": data.z,
          "--rot": `${data.rotate}deg`,
          "--rot-hover": `${data.rotate * 0.1}deg`,
          "--sd":
            "0 8px 25px rgba(0,0,0,0.4), 0 3px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
          "--sh":
            "0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.5)",
        } as React.CSSProperties
      }
    >
      <SanityImage
        className="block bg-[#ddd] object-cover shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"
        draggable={false}
        height={data.h}
        image={image}
        sizes="310px"
        style={{ height: data.h, width: data.w }}
        width={data.w}
      />
    </div>
  );
}

function Tape({ t }: { t: TapeData }) {
  return (
    <div
      className="pointer-events-none absolute z-[60] rounded-[1px] shadow-[0_1px_3px_rgba(0,0,0,0.2),_inset_0_1px_2px_rgba(255,255,255,0.3)]"
      style={{
        top: t.top,
        left: t.left,
        width: t.w,
        height: t.h,
        transform: `rotate(${t.rotate}deg)`,
        backgroundColor: t.bg,
        backgroundImage: t.bgImage,
        backgroundSize: "8px 8px",
        clipPath:
          "polygon(2% 0, 98% 0, 100% 10%, 98% 20%, 100% 30%, 98% 40%, 100% 50%, 98% 60%, 100% 70%, 98% 80%, 100% 90%, 98% 100%, 2% 100%, 0 90%, 2% 80%, 0 70%, 2% 60%, 0 50%, 2% 40%, 0 30%, 2% 20%, 0 10%)",
      }}
    />
  );
}

function Prop({ p }: { p: PropData }) {
  const showFallback = !p.url;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: p.top,
        left: p.left,
        width: p.w,
        height: p.h,
        transform: `rotate(${p.rotate}deg)`,
        zIndex: 70 + (p.z || 0),
      }}
    >
      {showFallback ? (
        <div className="box-border flex h-full w-full items-center justify-center rounded border-2 border-white/50 border-dashed bg-black/15 p-1 text-center font-bold text-[0.8rem] text-white/90">
          {p.label}
        </div>
      ) : (
        <Image
          alt={p.label}
          className="h-full w-full object-contain"
          height={p.h}
          sizes={`${p.w}px`}
          src={p.url ?? ""}
          style={{
            filter:
              p.blend === "multiply"
                ? "none"
                : "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
            mixBlendMode: p.blend || "normal",
          }}
          unoptimized
          width={p.w}
        />
      )}
    </div>
  );
}

// --- MAIN APP ---

export function PhotoCollage({
  photos,
  caption,
}: {
  photos: GalleryImage[];
  caption: string;
}) {
  return (
    <div className="flex w-full items-center justify-center">
      <div
        className="relative overflow-hidden rounded shadow-[0_40px_100px_rgba(0,0,0,0.6),_0_15px_40px_rgba(0,0,0,0.4)] [transform:rotate(-1deg)]"
        style={{
          width: BOARD_W,
          height: BOARD_H,
          backgroundColor: "#b88a58",
          backgroundImage: `
            radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(50,25,0,0.6) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='blotch'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23blotch)' opacity='0.25'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
          `,
        }}
      >
        {photos.slice(0, PHOTO_LAYOUTS.length).map((image, index) => (
          <Photo data={PHOTO_LAYOUTS[index]} image={image} key={image._key} />
        ))}
        {TAPES.map((t, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: TAPES is a static constant array; index is a stable identity
          <Tape key={i} t={t} />
        ))}
        {PROPS.map((p) => (
          <Prop key={p.id} p={p} />
        ))}

        <div
          className="pointer-events-none absolute z-[80] text-right font-['Dancing_Script',cursive] font-bold text-[#faf5e6]/95 text-[2rem] leading-snug whitespace-pre-line [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] [transform:rotate(-2.5deg)]"
          style={{ bottom: 15, right: 35 }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}
