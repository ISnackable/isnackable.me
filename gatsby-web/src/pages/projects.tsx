import React from "react";
import { graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { mapEdgesToNodes } from "../lib/helpers";
import { Node } from "../@types/allSanityProject";

const ProjectsPage = (props: any) => {
  const { data } = props;
  const projectNodes = (data || {}).allSanityProject
    ? mapEdgesToNodes(data.allSanityProject)
    : [];

  return (
    <Layout>
      <Seo
        title={"Projects"}
        description={"A quick collection of my open-source projects"}
      />
      <section className="text-gray-400 body-font ">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
              My Projects
            </h1>
            <p className="lg:w-1/2 w-full leading-relaxed text-opacity-80">
              Open-sourced projects, made with love.
            </p>
          </div>
          <div className="flex flex-wrap -m-4">
            {projectNodes &&
              projectNodes.map((project: Node) => {
                return (
                  <div key={project.id} className="xl:w-1/4 md:w-1/2 p-4">
                    <div className="bg-gray-800 bg-opacity-40 p-6 rounded-lg">
                      <GatsbyImage
                        className="h-40 rounded w-full object-cover object-center mb-6"
                        image={project.mainImage.asset.gatsbyImageData}
                        alt={
                          project.mainImage?.alt ??
                          `${project.title} main image`
                        }
                      />
                      <h2 className="text-lg text-white font-medium title-font mb-4">
                        <a
                          className="hover:text-gray-300"
                          href={project.projectUrl ?? ""}
                        >
                          {project.title}
                        </a>{" "}
                      </h2>
                      <p className="leading-relaxed text-base">
                        {project.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
          <button className="flex mx-auto mt-16 text-black bg-blue-400 border-0 py-2 px-8 focus:outline-none hover:text-gray-300 hover:bg-blue-600 rounded text-lg">
            <a href="https://github.com/ISnackable/">More at GitHub</a>
          </button>
        </div>
      </section>
    </Layout>
  );
};

export const query = graphql`
  query ProjectPage {
    allSanityProject(filter: { slug: { current: { ne: null } } }) {
      edges {
        node {
          id
          mainImage {
            asset {
              gatsbyImageData(fit: FILLMAX, placeholder: BLURRED)
            }
            alt
          }
          title
          description
          projectUrl
        }
      }
    }
  }
`;

export default ProjectsPage;
