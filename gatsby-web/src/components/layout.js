import React from "react";
import { motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";
import * as styles from "./layout.module.css";

const Layout = (props) => {
  const { children } = props;

  return (
    <>
      <Header />
      <motion.main
        className={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          mass: 0.35,
          stiffness: 75,
          duration: 0.1,
        }}
      >
        {children}
      </motion.main>
      <Footer />
    </>
  );
};

export default Layout;
