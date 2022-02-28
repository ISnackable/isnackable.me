import type { NextPage } from "next";
import Header from "../Header";
import Footer from "../Footer";
import styles from "./layout.module.css";

const AppLayout: NextPage = (props) => {
  const { children } = props;

  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default AppLayout;
