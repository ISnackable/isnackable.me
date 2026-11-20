import type React from "react";

export const Logo = (props: React.ComponentProps<"svg">) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polygon fill="#B388FF" points="200,20 44.115,110 122.058,155 200,110" />
    <polygon fill="#9055FF" points="200,20 200,110 277.942,155 355.885,110" />
    <polygon
      fill="#7545E0"
      points="355.885,110 277.942,155 277.942,245 355.885,290"
    />
    <polygon
      fill="#5B33AD"
      points="44.115,110 44.115,290 122.058,245 122.058,155"
    />
    <polygon fill="#47238C" points="200,380 355.885,290 277.942,245 200,290" />
    <polygon fill="#381673" points="44.115,290 200,380 200,290 122.058,245" />
    <polygon fill="#260E54" points="122.058,155 200,110 200,200 122.058,245" />
    <polygon fill="#150633" points="200,110 277.942,155 277.942,245 200,200" />
  </svg>
);
