import React from "react";
import Header from "./header";
import Footer from "./footer";

const Layout = (props) => {
  const { children } = props;

  return (
    <>
      <Header />
      <>{children}</>
      <Footer siteTitle={siteTitle} />
    </>
  );
};

export default Layout;
