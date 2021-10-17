import React from "react";
import Header from "./header";
import Footer from "./footer";
import "../styles/global.css";

const Layout = (props) => {
  const {
    children,
    // onHideNav,
    // onShowNav,
    // showNav,
    // siteTitle,
    // navMenuItems,
    // textWhite = true,
  } = props;

  return (
    <>
      <Header
      // navMenuItems={navMenuItems}
      // siteTitle={siteTitle}
      // onHideNav={onHideNav}
      // onShowNav={onShowNav}
      // showNav={showNav}
      // scrolled={scrolled}
      // textWhite={textWhite}
      />
      <>{children}</>
      <Footer />
    </>
  );
};

export default Layout;
