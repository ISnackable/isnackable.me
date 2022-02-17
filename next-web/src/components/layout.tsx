import type { NextPage } from "next";
import Header from "./header";
import Footer from "./footer";
import styles from "./layout.module.css";

const Layout: NextPage = (props) => {
  const { children } = props;

  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
