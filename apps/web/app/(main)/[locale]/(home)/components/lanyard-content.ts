export type BadgeCanvas = HTMLCanvasElement | OffscreenCanvas;
export type BadgeContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;
export type BadgePortrait = HTMLImageElement | ImageBitmap;

interface BadgeProfile {
  details: string[];
  handle: string;
  name: string;
  pass: string;
  status: string;
  summary: string;
}

interface CardBackProfile {
  description: string;
  footer: string;
  subtitle: string;
  title: string;
}

export interface LanyardDictionary {
  badgeProfile: BadgeProfile;
  cardBackProfile: CardBackProfile;
}

const WHITESPACE = /\s+/u;
const FONT = 'Arial, "Helvetica Neue", sans-serif';
const WIDTH = 716;
const HEIGHT = 1000;

// These are the same decorative social marks used on the original badge.
const GITHUB_PATH =
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";
const LINKEDIN_PATH =
  "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z";

function textLines(ctx: BadgeContext, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(WHITESPACE)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
        continue;
      }
      if (line) {
        lines.push(line);
      }
      line = "";
      for (const character of Array.from(word)) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

interface TextOptions {
  color: string;
  fitWidth?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  maxLines?: number;
  maxWidth?: number;
  size: number;
  weight?: number;
  x?: number;
  y: number;
}

function drawText(
  ctx: BadgeContext,
  text: string,
  {
    color,
    fitWidth = false,
    letterSpacing = 0,
    size,
    x = 83,
    y,
    weight = 400,
    maxWidth = 550,
    maxLines = 1,
    lineHeight = size * 1.2,
  }: TextOptions
) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.letterSpacing = `${letterSpacing}px`;
  if (fitWidth) {
    const width = ctx.measureText(text).width;
    if (width > maxWidth) {
      ctx.font = `${weight} ${(size * (maxWidth - 1)) / width}px ${FONT}`;
    }
  }
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  const lines = textLines(ctx, text, maxWidth);
  for (const [index, value] of lines.slice(0, maxLines).entries()) {
    let line = value;
    if (index === maxLines - 1 && lines.length > maxLines) {
      while (line && ctx.measureText(`${line}…`).width > maxWidth) {
        line = Array.from(line).slice(0, -1).join("");
      }
      line += "…";
    }
    ctx.fillText(line, x, y + index * lineHeight);
  }
  return y + Math.min(lines.length, maxLines) * lineHeight;
}

function pill(
  ctx: BadgeContext,
  label: string,
  x: number,
  y: number,
  width: number,
  isDark: boolean,
  radius = 23
) {
  if (!label) {
    return;
  }
  ctx.beginPath();
  ctx.roundRect(x, y, width, 46, radius);
  ctx.fillStyle = isDark ? "#141414" : "#f5f5f5";
  ctx.fill();
  ctx.strokeStyle = isDark ? "#2c2c2c" : "#e5e5e5";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `400 22px ${FONT}`;
  const textWidth = Math.min(width - 24, ctx.measureText(label).width);
  drawText(ctx, label, {
    color: isDark ? "#a3a3a3" : "#666666",
    size: 22,
    x: x + (width - textWidth) / 2,
    y: y + 12,
    maxWidth: width - 24,
  });
}

function socialMark(
  ctx: BadgeContext,
  path: string,
  x: number,
  isDark: boolean
) {
  pill(ctx, " ", x, 870, 46, isDark, 12);
  ctx.save();
  ctx.translate(x + 8, 878);
  ctx.scale(1.25, 1.25);
  ctx.fillStyle = isDark ? "#a3a3a3" : "#666666";
  ctx.fill(new Path2D(path));
  ctx.restore();
}

function paintFront(
  ctx: BadgeContext,
  profile: BadgeProfile,
  isDark: boolean,
  avatar: BadgePortrait | null
) {
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(178, 243, 94, 0, Math.PI * 2);
    ctx.clip();
    // Preserve the original portrait crop inside the circular avatar.
    ctx.drawImage(
      avatar,
      avatar.width * 0.15,
      avatar.height * 0.04,
      avatar.width * 0.7,
      avatar.height * 0.7,
      84,
      149,
      188,
      188
    );
    ctx.restore();
    ctx.beginPath();
    ctx.arc(178, 243, 99, 0, Math.PI * 2);
    ctx.strokeStyle = "#4a5960";
    ctx.lineWidth = 10;
    ctx.stroke();
  }
  if (profile.status) {
    const color = isDark ? "#00e676" : "#00b359";
    ctx.beginPath();
    ctx.arc(428, 243, 11, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    drawText(ctx, profile.status, {
      color,
      size: 28,
      x: 458,
      y: 229,
      maxWidth: 190,
    });
  }
  drawText(ctx, profile.pass, {
    color: isDark ? "#8c7f72" : "#8a8177",
    letterSpacing: 3.6,
    size: 24,
    y: 391,
  });
  const nameBottom = drawText(ctx, profile.name, {
    color: isDark ? "#f4f0ea" : "#111111",
    size: 75,
    y: 455,
    maxLines: 2,
    lineHeight: 76,
  });
  const [lead, ...rest] = profile.summary.split("\n");
  const summary = [
    [profile.handle, lead].filter(Boolean).join(" · "),
    ...rest,
  ].join("\n");
  drawText(ctx, summary, {
    color: isDark ? "#948d82" : "#666666",
    size: 25,
    y: Math.max(580, nameBottom + 16),
    maxLines: 3,
    lineHeight: 30,
  });
  const [first = "", second = "", third = ""] = profile.details;
  pill(ctx, first, 83, 720, 150, isDark);
  pill(ctx, second, 248, 720, 190, isDark);
  pill(ctx, third, 83, 790, 170, isDark);
  socialMark(ctx, GITHUB_PATH, 83, isDark);
  socialMark(ctx, LINKEDIN_PATH, 143, isDark);
}

function paintBack(
  ctx: BadgeContext,
  profile: CardBackProfile,
  isDark: boolean
) {
  drawText(ctx, profile.title, {
    color: isDark ? "#f4f0ea" : "#111111",
    fitWidth: true,
    size: 80,
    weight: 700,
    y: 163,
  });
  ctx.fillStyle = isDark ? "#333333" : "#e5e5e5";
  ctx.fillRect(83, 301, 550, 4);
  drawText(ctx, profile.subtitle, {
    color: isDark ? "#eaeaea" : "#222222",
    size: 59,
    weight: 650,
    y: 383,
    maxLines: 3,
    lineHeight: 63,
  });
  drawText(ctx, profile.description, {
    color: isDark ? "#b0b0b0" : "#555555",
    size: 33,
    y: 603,
    maxLines: 6,
    lineHeight: 39,
  });
  drawText(ctx, profile.footer, {
    color: isDark ? "#888888" : "#777777",
    letterSpacing: 0.44,
    size: 22,
    weight: 700,
    y: 897,
  });
}

// Authored strings are drawn at runtime, so Sanity edits and theme changes
// update both faces without replacing the card with a static image asset.
export function paintBadgeFace(
  canvas: BadgeCanvas,
  side: "front" | "back",
  dictionary: LanyardDictionary,
  isDark: boolean,
  avatar: BadgePortrait | null
) {
  const ctx = canvas.getContext("2d") as BadgeContext | null;
  if (!ctx) {
    return;
  }
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
  if (side === "front") {
    paintFront(ctx, dictionary.badgeProfile, isDark, avatar);
  } else {
    paintBack(ctx, dictionary.cardBackProfile, isDark);
  }
  ctx.restore();
}
