import type { NextPage } from "next";
import { useRouter } from "next/router";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Header from "../Header";
import Footer from "../Footer";
import styles from "./layout.module.css";

const AppLayout: NextPage = (props): JSX.Element => {
  const router = useRouter();
  const { children } = props;

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main
          key={router.asPath}
          className={styles.main}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </m.main>
      </LazyMotion>
      <Footer />
    </>
  );
};

export default AppLayout;
