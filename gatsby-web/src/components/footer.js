import React from "react";
import { Link } from "gatsby";
import * as styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <button>Contact</button>
      <span></span>
      {/* dynamic content here */}
      <Link to="https://github.com/ISnackable">GitHub</Link>
    </footer>
  );
};

export default Footer;
