import React from "react";
import { Link } from "gatsby";
import * as styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <button>Contact</button>
      <span></span>
      <Link to="https://github.com/ISnackable">GitHub</Link>
      <Link to="#">LinkedIn</Link>
      <Link to="#">Twitter</Link>
    </footer>
  );
};

export default Footer;
