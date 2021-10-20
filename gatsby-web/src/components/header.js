// import ReactDOM from "react-dom";
import React, { useRef } from "react";
// import { Mesh } from "three";
// import { Canvas, useFrame } from "@react-three/fiber";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import * as style from "./header.module.css";

const Header = () => {
  return (
    <nav className={style.navbar}>
      <Link className={style.tab} to="/">
        <svg
          className={style.icon}
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <g stroke="currentColor" fill="none" fillRule="evenodd">
            <circle cx="12" cy="9" r="2"></circle>
            <circle cx="12" cy="12" r="8"></circle>
            <path
              d="M6 17a3 3 0 013-3h6a3 3 0 013 3h0"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
        About
      </Link>
      <Link className={style.tab} to="/projects">
        <svg
          className={style.icon}
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
            fillRule="evenodd"
          />
          <path d="M12 3a9 9 0 0 1 3.618 17.243l-2.193 -5.602a3 3 0 1 0 -2.849 0l-2.193 5.603a9 9 0 0 1 3.617 -17.244z" />
        </svg>
        Projects
      </Link>
      <div className={style.logo}>
        <StaticImage src="../images/icon.png" alt="Logo" />
        {/* <Canvas></Canvas> */}
      </div>
      <Link className={style.tab} to="/tools">
        <svg
          className={style.icon}
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
          <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />
          <polyline points="12 8 7 3 3 7 8 12" />
          <line x1="7" y1="8" x2="5.5" y2="9.5" />
          <polyline points="16 12 21 17 17 21 12 16" />
          <line x1="16" y1="17" x2="14.5" y2="18.5" />
        </svg>
        Tools
      </Link>
      <Link className={style.tab} to="/blog">
        <svg
          className={style.icon}
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18" />
          <line x1="13" y1="8" x2="15" y2="8" />
          <line x1="13" y1="12" x2="15" y2="12" />
        </svg>
        Blog
      </Link>
      <div className={style.contact}>
        <svg
          className={style.icon}
          width="28"
          height="28"
          viewBox="0 0 22 22"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
      </div>
    </nav>
  );
};

export default Header;
