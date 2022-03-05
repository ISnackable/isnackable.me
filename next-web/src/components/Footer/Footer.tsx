import React from "react";
import Link from "next/link";
import styles from "./footer.module.css";
import { socialUsername } from "@lib/config";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Link href="/privacy">Privacy</Link>
      <span></span>
      <a href={`https://github.com/${socialUsername}`}>GitHub</a>
      <a href="https://www.linkedin.com/in/#/">LinkedIn</a>
      <a href={`https://hackerone.com/${socialUsername}`}>HackerOne</a>
    </footer>
  );
};

export default Footer;
