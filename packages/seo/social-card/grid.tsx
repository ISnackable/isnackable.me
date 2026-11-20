// Adapted from the ogimagecn Grid block. See LICENSE.ogimagecn.
import { BrandMark } from "./brand-mark";
import { GridLines } from "./grid-lines";

export const socialCardSize = { width: 1200, height: 630 };

interface GridProps {
  brand: string;
  description: string;
  host: string;
  label: string;
  title: string;
}

export const Grid = ({ brand, description, host, label, title }: GridProps) => (
  <div
    style={{
      backgroundColor: "#faf8f3",
      backgroundImage:
        "radial-gradient(circle at 1px 1px, #e7dfec 1px, transparent 0)",
      backgroundSize: "24px 24px",
      color: "#242129",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arimo",
      height: "100%",
      justifyContent: "space-between",
      overflow: "hidden",
      padding: "75px 87px",
      position: "relative",
      width: "100%",
    }}
  >
    <GridLines color="#dcd2e9" inset={46} variant="solid" />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      <BrandMark
        background="#5a36ac"
        radius={8}
        size={40}
        style={{ color: "#fff", fontSize: 21 }}
      >
        {"//"}
      </BrandMark>
      {brand}
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          color: "#5a36ac",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "block",
          fontSize: title.length > 48 ? 60 : 76,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.08,
          lineClamp: title.length > 48 ? '3 "…"' : '2 "…"',
          wordBreak: "break-word",
        }}
      >
        {title}
      </div>
      {description ? (
        <div
          style={{
            color: "#5b5564",
            display: "block",
            fontSize: 30,
            lineHeight: 1.3,
            lineClamp: '2 "…"',
            maxWidth: 900,
            wordBreak: "break-word",
          }}
        >
          {description}
        </div>
      ) : null}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "#5b5564",
        fontSize: 22,
      }}
    >
      <div style={{ width: 44, height: 3, backgroundColor: "#8059cc" }} />
      {host}
    </div>
  </div>
);
