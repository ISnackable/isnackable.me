import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import SEO from "../components/seo";

const BlogPage = () => {
  return (
    <Layout>
      <SEO title={"Blog"} description={"A collection of my blog posts"} />
      <h1>Blog Page</h1>
      <input type="search"></input>
      <StaticImage src="/svg/algolia-full.svg" alt="Algolia Icon" />
      <button>filter</button>
      <p>All posts</p>
    </Layout>
  );
};

export default BlogPage;
