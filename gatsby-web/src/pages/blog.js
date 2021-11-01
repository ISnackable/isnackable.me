import React from "react";
import { Link, graphql } from "gatsby";
import { StaticImage, GatsbyImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import {
  getBlogUrl,
  toDateString,
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture,
} from "../lib/helpers";

const BlogPage = (props) => {
  const { data } = props;
  const postNodes = (data || {}).allSanityPost
    ? mapEdgesToNodes(data.allSanityPost)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];

  return (
    <Layout>
      <Seo title={"Blog"} description={"A collection of my blog posts"} />
      <section>
        <div className="container px-5 py-24 mx-auto">
          <div className="mx-auto">
            <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
                Blog Post
              </h1>
              <p className="lg:w-1/2 w-full leading-relaxed text-opacity-80 text-gray-400">
                I write stuff I find interesting.
              </p>
            </div>

            {/* Need to create a search bar component */}
            <form
              action=""
              className="flex justify-center  overflow-hidden border-0"
            >
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:ring-2 focus:ring-indigo-900 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
              <svg
                className="h-6 w-6 my-auto m-2"
                style={{ color: "gray" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <a
                href="https://www.algolia.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <StaticImage
                  src="../../static/svg/algolia-full.svg"
                  alt="Algolia Icon"
                  height={40}
                  width={150}
                />
              </a>
            </form>

            {/* Create a filter component */}

            <div className="space-y-8 lg:divide-y lg:divide-gray-800">
              {postNodes &&
                postNodes.map((post) => {
                  return (
                    <div
                      key={post.id}
                      className="pt-8 sm:flex lg:items-end group"
                    >
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                        <GatsbyImage
                          className="w-full rounded-md sm:h-32 sm:w-32"
                          image={post.mainImage.asset.gatsbyImageData}
                          alt={`${post.title} main image`}
                        />
                      </div>
                      <div>
                        <span className="text-sm text-gray-300">
                          <time dateTime={post.publishedAt}>
                            {toDateString(post.publishedAt)}
                          </time>
                        </span>
                        <p className="mt-2 text-lg font-medium leading-6">
                          <Link
                            to={getBlogUrl(post.slug)}
                            className="
                        text-xl text-neutral-600
                        group-hover:text-gray-300
                        lg:text-2xl"
                            aria-label={`Read "${post.title}"`}
                          >
                            {post.title}
                          </Link>
                        </p>
                        <p className="mt-2 text-lg text-gray-300">
                          {post?.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const query = graphql`
  query BlogPage {
    allSanityPost(
      sort: { fields: [publishedAt], order: DESC }
      filter: { slug: { current: { ne: null } }, publishedAt: { ne: null } }
    ) {
      edges {
        node {
          id
          publishedAt
          mainImage {
            asset {
              gatsbyImageData(fit: FILLMAX, placeholder: BLURRED)
            }
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

export default BlogPage;
