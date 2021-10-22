import React from "react";
import * as styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <button>Contact</button>
      <span></span>
      <a href="https://github.com/ISnackable">GitHub</a>
      <a href="#">LinkedIn</a>
      <a href="#">Twitter</a>
    </footer>
  );
};

export default Footer;
