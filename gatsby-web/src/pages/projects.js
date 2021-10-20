import React from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";

const ProjectsPage = () => {
  return (
    <Layout>
      <SEO
        title={"Projects"}
        description={"A quick collection of my open-source projects"}
      />
      <p>Projects Page</p>
    </Layout>
  );
};

export default ProjectsPage;
