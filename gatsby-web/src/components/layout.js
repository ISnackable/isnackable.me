import React from "react";
import Header from "./header";
import Footer from "./footer";
import * as styles from "./layout.module.css";

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
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
