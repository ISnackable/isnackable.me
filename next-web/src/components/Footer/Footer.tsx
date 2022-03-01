import React from "react";
import Link from "next/link";
import styles from "./footer.module.css";
import siteConfig from "../../../site.config";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Link href="/privacy">Privacy</Link>
      <span></span>
      <a href={`https://github.com/${siteConfig.socialUsername}`}>GitHub</a>
      <a href="https://www.linkedin.com/in/#/">LinkedIn</a>
      <a href={`https://hackerone.com/${siteConfig.socialUsername}`}>
        HackerOne
      </a>
    </footer>
  );
};

export default Footer;
