import React from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { mapEdgesToNodes } from "../lib/helpers";
import { Node } from "../@types/allSanityNote";

const NotesPage = (props: any) => {
  const { data } = props;
  const noteNodes = (data || {}).allSanityNote
    ? mapEdgesToNodes(data.allSanityNote)
    : [];

  return (
    <Layout>
      <Seo
        title={"Notes"}
        description={"A collection of notes I find useful"}
      />

      <section className="text-gray-400 body-font ">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
              Collection of notes
            </h1>
            <p className="lg:w-1/2 w-full leading-relaxed text-opacity-80">
              WIP, Adding notes that I find useful
            </p>
          </div>
          <div className="flex flex-wrap -m-4">
            {noteNodes &&
              noteNodes.map((note: Node) => {
                return (
                  <div key={note.id} className="xl:w-1/3 md:w-1/2 p-4">
                    <div className="border border-gray-700 border-opacity-75 p-6 rounded-lg">
                      <GatsbyImage
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full mb-4"
                        image={note.mainImage.asset.gatsbyImageData}
                        alt={note.mainImage?.alt ?? `${note.title} main image`}
                      />
                      <h2 className="text-lg text-white font-medium title-font mb-2">
                        <Link
                          className="hover:text-gray-300"
                          to={`/note/${note?.slug?.current}`}
                        >
                          {note.title}
                        </Link>
                      </h2>
                      <p className="leading-relaxed text-base">
                        {note.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const query = graphql`
  query NotePage {
    allSanityNote(
      sort: { fields: [publishedAt], order: DESC }
      filter: { slug: { current: { ne: null } } }
    ) {
      edges {
        node {
          id
          publishedAt
          mainImage {
            asset {
              gatsbyImageData(fit: FILLMAX, placeholder: BLURRED)
            }
            alt
          }
          title
          slug {
            current
          }
          description
        }
      }
    }
  }
`;

export default NotesPage;
