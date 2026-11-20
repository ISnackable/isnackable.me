import type { ArtifactKind } from "./explorer-content";

/** Illustrative artwork slots; real project media can replace these server-rendered nodes. */
export function ArtifactPlaceholder({ kind }: { kind: ArtifactKind }) {
  return (
    <svg
      aria-hidden="true"
      className="artifact-drawing"
      fill="none"
      viewBox="0 0 720 450"
    >
      <path
        className="artifact-grid"
        d="M0 90H720M0 180H720M0 270H720M0 360H720M90 0V450M180 0V450M270 0V450M360 0V450M450 0V450M540 0V450M630 0V450"
      />
      {kind === "flow" ? (
        <>
          <path
            className="artifact-line"
            d="M360 98V160M360 206V260M360 206H192V282M360 206H528V282M192 328V366H360M528 328V366H360"
          />
          <rect
            className="artifact-paper"
            height="64"
            rx="12"
            width="168"
            x="276"
            y="42"
          />
          <rect
            className="artifact-accent-fill"
            height="8"
            rx="4"
            width="72"
            x="324"
            y="70"
          />
          <path
            className="artifact-paper"
            d="M360 144L416 188L360 232L304 188Z"
          />
          <circle className="artifact-accent-fill" cx="360" cy="188" r="8" />
          <rect
            className="artifact-paper"
            height="56"
            rx="10"
            width="144"
            x="120"
            y="280"
          />
          <rect
            className="artifact-paper"
            height="56"
            rx="10"
            width="144"
            x="456"
            y="280"
          />
          <path
            className="artifact-code-line"
            d="M148 301H224M148 316H194M484 301H560M484 316H530"
          />
          <circle className="artifact-node" cx="360" cy="366" r="18" />
        </>
      ) : null}
      {kind === "phone" ? (
        <>
          <path
            className="artifact-line"
            d="M299 332V366H556V318M299 180H445"
          />
          <rect
            className="artifact-paper"
            height="300"
            rx="26"
            width="208"
            x="190"
            y="56"
          />
          <rect
            className="artifact-surface"
            height="226"
            rx="8"
            width="174"
            x="207"
            y="89"
          />
          <path
            className="artifact-code-line"
            d="M272 73H316M227 125H303M227 150H344M227 175H320"
          />
          <path className="artifact-cursor" d="M227 204H290V267H351" />
          <rect
            className="artifact-soft-fill"
            height="46"
            rx="6"
            width="69"
            x="226"
            y="228"
          />
          <circle className="artifact-node" cx="295" cy="335" r="6" />
          <rect
            className="artifact-paper"
            height="80"
            rx="12"
            width="182"
            x="445"
            y="122"
          />
          <rect
            className="artifact-paper"
            height="80"
            rx="12"
            width="182"
            x="445"
            y="220"
          />
          <path
            className="artifact-code-line"
            d="M466 145H542M466 166H515M466 244H542M466 265H515"
          />
          <circle className="artifact-accent-fill" cx="601" cy="162" r="5" />
          <circle className="artifact-accent-fill" cx="601" cy="260" r="5" />
        </>
      ) : null}
      {kind === "workspace" ? (
        <>
          <rect
            className="artifact-paper"
            height="322"
            rx="14"
            width="560"
            x="80"
            y="64"
          />
          <path className="artifact-line" d="M80 106H640M207 106V386" />
          <circle className="artifact-accent-fill" cx="104" cy="85" r="5" />
          <circle className="artifact-muted-fill" cx="121" cy="85" r="5" />
          <circle className="artifact-muted-fill" cx="138" cy="85" r="5" />
          <rect
            className="artifact-soft-fill"
            height="28"
            rx="6"
            width="93"
            x="97"
            y="146"
          />
          <path
            className="artifact-code-line"
            d="M111 159H166M111 195H168M111 228H153M111 261H172M111 343H147"
          />
          <path className="artifact-code-line" d="M238 142H403M238 164H344" />
          {[0, 1, 2].map((index) => (
            <g key={index}>
              <rect
                className="artifact-surface"
                height="82"
                rx="9"
                width="108"
                x={237 + index * 124}
                y="195"
              />
              <rect
                className="artifact-soft-fill"
                height="26"
                rx="5"
                width="27"
                x={253 + index * 124}
                y="210"
              />
              <path
                className="artifact-code-line"
                d={`M${253 + index * 124} 254H${304 + index * 124}`}
              />
            </g>
          ))}
          <path
            className="artifact-line"
            d="M238 306H597M238 336H597M238 365H597"
          />
          <path className="artifact-code-line" d="M248 321H354M248 350H396" />
          <rect
            className="artifact-accent-fill"
            height="20"
            rx="10"
            width="58"
            x="533"
            y="311"
          />
        </>
      ) : null}
      {kind === "timeline" ? (
        <>
          <rect
            className="artifact-paper"
            height="310"
            rx="14"
            width="560"
            x="80"
            y="70"
          />
          <path className="artifact-code-line" d="M107 99H272M107 128H189" />
          <path
            className="artifact-line"
            d="M80 153H640M214 153V380M298 153V380M382 153V380M466 153V380M550 153V380M80 208H640M80 263H640M80 318H640"
          />
          {[0, 1, 2, 3].map((row) => (
            <path
              className="artifact-code-line"
              d={`M108 ${183 + row * 55}H174`}
              key={row}
            />
          ))}
          <rect
            className="artifact-soft-fill"
            height="27"
            rx="7"
            width="149"
            x="232"
            y="167"
          />
          <rect
            className="artifact-accent-fill"
            height="27"
            rx="7"
            width="225"
            x="317"
            y="222"
          />
          <rect
            className="artifact-soft-fill"
            height="27"
            rx="7"
            width="146"
            x="400"
            y="277"
          />
          <rect
            className="artifact-soft-fill"
            height="27"
            rx="7"
            width="147"
            x="232"
            y="332"
          />
          <path className="artifact-cursor" d="M453 116V365" />
          <circle className="artifact-accent-fill" cx="453" cy="116" r="6" />
        </>
      ) : null}
    </svg>
  );
}
