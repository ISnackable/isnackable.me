import { graphql } from "gatsby";
import React from "react";
import Layout from "../components/layout";
import * as styles from "../styles/home.module.css";

// styles
const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};

const headingAccentStyles = {
  color: "#663399",
};
const paragraphStyles = {
  marginBottom: 48,
};
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
};

export const query = graphql`
  query SiteInfo {
    site {
      siteMetadata {
        title
        description
        githubUsername
      }
    }
  }
`;

// markup
const IndexPage = (props) => {
  const { data, errors } = props;

  const site = (data || {}).site;
  const { title, description, githubUsername } = site.siteMetadata;

  return (
    <Layout>
      <main className={styles.header} style={pageStyles}>
        <title>Home Page</title>
        <h1>
          {title}
          <br />
          <span style={headingAccentStyles}>
            — you just made a Gatsby site!{" "}
          </span>
          <span role="img" aria-label="Party popper emojis">
            🎉🎉🎉
          </span>
        </h1>
        <p style={paragraphStyles}>
          Edit <code style={codeStyles}>src/pages/index.js</code> to see this
          page update in real-time.{" "}
          <span role="img" aria-label="Sunglasses smiley emoji">
            😎
          </span>
        </p>
        <p style={paragraphStyles}>Some Recent Blog Posts</p>
        <p style={paragraphStyles}>Experience</p>
        <p style={paragraphStyles}>Awards</p>
      </main>
    </Layout>
  );
};

export default IndexPage;
