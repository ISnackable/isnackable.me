import React, { useState } from "react";
import { Link, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout";
import Seo from "../components/seo";
import {
  getBlogUrl,
  toDateString,
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture,
} from "../lib/helpers";
import { Node } from "../@types/allSanityPost";
import useComponentVisible from "../hooks/useComponentVisible";

const showMenu = {
  enter: {
    opacity: 1,
    y: 0,
    display: "block",
  },
  exit: {
    y: -5,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

const BlogPage = (props: any) => {
  const { data } = props;
  const postNodes = (data || {}).allSanityPost
    ? mapEdgesToNodes(data.allSanityPost)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];
  const categoriesNodes = (data || {}).allSanityCategory
    ? mapEdgesToNodes(data.allSanityCategory)
    : [];

  const emptyQuery = "";
  const [state, setState] = useState({
    filteredData: [],
    query: emptyQuery,
  });
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.trim();

    const filteredData = postNodes.filter((post: Node) => {
      const { description, title, categories } = post;
      const tag = categories[0]?.title;

      return (
        description.toLowerCase().includes(query.toLowerCase()) ||
        title.toLowerCase().includes(query.toLowerCase()) ||
        (tag && tag.toLowerCase().includes(query.toLowerCase()))
      );
    });

    setState({
      query,
      filteredData,
    });
  };

  const handleFilterCategory = (event: React.MouseEvent<HTMLElement>) => {
    const query = event.currentTarget.innerText;

    const filteredData = postNodes.filter((post: Node) => {
      const { categories } = post;
      const tag = categories[0]?.title;

      return tag && tag.toLowerCase().includes(query.toLowerCase());
    });

    setState({
      query,
      filteredData,
    });
  };

  const { filteredData, query } = state;
  const hasSearchResults = filteredData && query !== emptyQuery;
  const posts = hasSearchResults ? filteredData : postNodes;

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

            <div className="flex">
              <input
                type="text"
                aria-label="Search"
                placeholder="Search..."
                onChange={handleInputChange}
                className="w-full bg-gray-900 bg-opacity-40 rounded border border-gray-700 focus:ring-2 focus:ring-blue-900 focus:bg-transparent focus:border-blue-500 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />

              <div ref={ref}>
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="ml-2 p-1 rounded-full hover:bg-white/[.1]"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => setIsComponentVisible(!isComponentVisible)}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#ffffff"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5.5 5h13a1 1 0 0 1 .5 1.5l-5 5.5l0 7l-4 -3l0 -4l-5 -5.5a1 1 0 0 1 .5 -1.5" />
                    </svg>
                  </button>

                  {isComponentVisible ? (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-neutral-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                    >
                      <motion.ul
                        variants={showMenu}
                        initial="exit"
                        animate={isComponentVisible ? "enter" : "exit"}
                        className="py-1 text-white hover:cursor-pointer"
                      >
                        <motion.li
                          className="block px-4 py-2 text-md hover:bg-gray-900/75"
                          onClick={() => {
                            setState({ query: "", filteredData: [] });
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          all posts
                        </motion.li>
                        {categoriesNodes.map(
                          (category: { id: string; title: string }) => (
                            <motion.li
                              key={category.id}
                              className="block px-4 py-2 text-md hover:bg-gray-900/75"
                              onClick={handleFilterCategory}
                              whileTap={{ scale: 0.9 }}
                            >
                              {category?.title}
                            </motion.li>
                          )
                        )}
                      </motion.ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-8 lg:divide-y lg:divide-gray-800">
              {posts.length ? (
                posts.map((post: Node) => {
                  return (
                    <div
                      key={post.id}
                      className="pt-8 sm:flex lg:items-end group"
                    >
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                        <GatsbyImage
                          className="w-full rounded-md sm:h-32 sm:w-32"
                          image={post.mainImage?.asset?.gatsbyImageData}
                          alt={
                            post.mainImage?.alt ?? `${post.title} main image`
                          }
                        />
                      </div>
                      <Link to={getBlogUrl(post.slug)}>
                        <div>
                          <span className="text-sm text-gray-300">
                            <time dateTime={post.publishedAt}>
                              {toDateString(post.publishedAt)}
                            </time>
                          </span>
                          <p className="mt-2 text-lg font-medium leading-6">
                            <p
                              className="
                        text-xl
                        group-hover:text-gray-300
                        lg:text-2xl"
                              aria-label={`Read "${post.title}"`}
                            >
                              {post.title}
                            </p>
                          </p>
                          <p className="mt-2 text-lg text-gray-300">
                            {post?.description}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="mt-4 break-all">
                  There were no results found for "{query}". Try searching for
                  something else like "CTF".
                </p>
              )}
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
            alt
          }
          title
          slug {
            current
          }
          categories {
            title
          }
          description
        }
      }
    }
    allSanityCategory {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

export default BlogPage;
