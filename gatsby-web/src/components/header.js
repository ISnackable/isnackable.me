import { Link } from "gatsby";
import React from "react";
import * as style from "./header.module.css";

const Header = ({
  showNav,
  siteTitle,
  scrolled,
  navMenuItems = [],
  textWhite = true,
}) => {
  return (
    <nav className={style.navbar}>
      <Link className={style.tab} to="/">
        <svg
          className={style.icon}
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
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
      <Link className={style.tab} to="/blog">
        Blog
      </Link>
      <div title="Contact">ICON</div>
      <Link className={style.tab} to="/projects">
        Projects
      </Link>
      <Link className={style.tab} to="/tools">
        Tools
      </Link>
    </nav>
  );
};

export default Header;
