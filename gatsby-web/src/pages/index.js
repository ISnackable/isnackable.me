import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";

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
  // console.error(errors);

  const site = (data || {}).site;
  const { title, description, githubUsername } = site.siteMetadata;

  return (
    <Layout>
      <h1>
        {title}
        <br />
        <span>— {description} </span>
        <span role="img" aria-label="Party popper emojis">
          🎉🎉🎉
        </span>
      </h1>
      <p>
        Edit <code>src/pages/index.js</code> to see this page update in
        real-time.{" "}
        <span role="img" aria-label="Sunglasses smiley emoji">
          😎 {githubUsername}
        </span>
      </p>
      <p className="m-5 font-bold">Some Recent Blog Posts</p>
      <p>Experience</p>
      <p>Awards</p>
    </Layout>
  );
};

export default IndexPage;
