import { Link } from "gatsby";
import React from "react";

const Header = ({
  showNav,
  siteTitle,
  scrolled,
  navMenuItems = [],
  textWhite = true,
}) => {
  return (
    <nav id="header">
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/project">Project</Link>
      </div>
    </nav>
  );
};

export default Header;
