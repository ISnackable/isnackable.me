import React from "react";
import * as styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a href="https://termly.io/resources/templates/privacy-policy-template/">
        Privacy
      </a>
      <span></span>
      <a href="https://github.com/ISnackable">GitHub</a>
      <a href="https://www.linkedin.com/in/#/">LinkedIn</a>
      <a href="https://hackerone.com/isnackable">HackerOne</a>
    </footer>
  );
};

export default Footer;
