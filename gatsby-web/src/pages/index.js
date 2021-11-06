import React from "react";
import { Link, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import hero from "../images/undraw_hacker_mind_-6-y85.svg";
import {
  getBlogUrl,
  toDateString,
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture,
} from "../lib/helpers";

const IndexPage = (props) => {
  const { data } = props;
  // console.error(errors);

  const site = (data || {}).site;
  const { twitterUsername } = site.siteMetadata;
  const postNodes = (data || {}).allSanityPost
    ? mapEdgesToNodes(data.allSanityPost)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];

  return (
    <Layout>
      <Seo
        title={"Home"}
        description={"Home page of ISnackable personal site"}
      />
      <section className="w-full">
        <div
          className="
          relative
          items-center
          w-full
          px-5
          py-12
          mx-auto
          md:px-12
          lg:px-16
          max-w-7xl
          lg:py-24
        "
        >
          <div className="flex w-full mx-auto text-left">
            <div className="relative inline-flex items-center mx-auto align-middle">
              <div className="text-center">
                <h1
                  className="
                  max-w-5xl
                  text-2xl
                  font-bold
                  leading-none
                  tracking-tighter
                  text-neutral-600
                  md:text-5xl
                  lg:text-6xl lg:max-w-7xl
                "
                >
                  Hey there <br className="hidden lg:block" /> I'm{" "}
                  {twitterUsername}, Tommy
                </h1>
                <p
                  className="
                  max-w-xl
                  mx-auto
                  mt-8
                  text-base
                  leading-relaxed
                  text-gray-300
                "
                >
                  An aspiring Cyber Specialist and an open-source advocate. I'm
                  also a full-time student studying cybersecurity. P.S. Tommy is
                  just an online alias.
                </p>
              </div>
            </div>
          </div>
          <section id="intro">
            <div
              className="
              flex flex-col
              items-center
              justify-center
              pt-24
              mx-auto
              rounded-lg
              lg:px-10
              max-w-7xl
            "
            >
              <img
                className="object-cover object-center w-full rounded-xl"
                width={"100%"}
                height={"100%"}
                alt="hero"
                src={hero}
              />
            </div>
          </section>
        </div>
      </section>

      <section>
        <div className="relative items-center w-full px-5 py-12 mx-auto md:px-12 lg:px-24 max-w-7xl">
          <p className="m-5 font-bold text-lg">Some Recent Blog Posts</p>
          <div className="grid w-full grid-cols-1 gap-6 mx-auto lg:grid-cols-4">
            {postNodes &&
              postNodes.map((post) => {
                return (
                  <div key={post.id} className="p-6">
                    <GatsbyImage
                      className="object-cover object-center w-full mb-8 lg:h-48 md:h-36 rounded-xl"
                      image={post.mainImage.asset.gatsbyImageData}
                      alt={post.mainImage?.alt ?? `${post.title} main image`}
                    />
                    <h1 className="mx-auto mb-2 text-xl font-semibold leading-none tracking-tighter text-neutral-600 lg:text-3xl">
                      {post.title}
                    </h1>
                    <p className="mx-auto text-base leading-relaxed text-gray-300">
                      <time dateTime={post.publishedAt}>
                        {toDateString(post.publishedAt)}
                      </time>
                    </p>
                    <div className="mt-4">
                      <Link
                        to={getBlogUrl(post.slug)}
                        className="inline-flex items-center mt-4 font-semibold text-blue-400 lg:mb-0 hover:text-neutral-600"
                        title="read more"
                        aria-label={`Read "${post.title}"`}
                      >
                        Read More »
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section>
        <div
          className="
          relative
          items-center
          w-full
          px-5
          py-12
          mx-auto
          md:px-12
          lg:px-24
          max-w-7xl
        "
        >
          <p className="m-5 font-bold text-lg">Experience &amp; Awards</p>
          <div className="grid w-full grid-cols-1 gap-12 mx-auto lg:grid-cols-2">
            <div className="p-6">
              <div
                className="
                inline-flex
                items-center
                justify-center
                flex-shrink-0
                w-12
                h-12
                mx-auto
                mb-5
                text-blue-400
                rounded-full
                bg-gray-800
              "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#60a5fa"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5.931 6.936l1.275 4.249m5.607 5.609l4.251 1.275" />
                  <path d="M11.683 12.317l5.759 -5.759" />
                  <circle cx="5.5" cy="5.5" r="1.5" />
                  <circle cx="18.5" cy="5.5" r="1.5" />
                  <circle cx="18.5" cy="18.5" r="1.5" />
                  <circle cx="8.5" cy="15.5" r="4.5" />
                </svg>
              </div>
              <h1
                className="
                mx-auto
                mb-8
                text-2xl
                font-semibold
                leading-none
                tracking-tighter
                text-neutral-600
                lg:text-3xl
              "
              >
                Internship in the Cybersecurity industry
              </h1>
              <p className="mx-auto text-base leading-relaxed text-gray-300">
                Opportunity to become a Cybersecurity research intern and a
                Cybersecurity forensic incident response intern.
              </p>
            </div>
            <div className="p-6">
              <div
                className="
                inline-flex
                items-center
                justify-center
                flex-shrink-0
                w-12
                h-12
                mx-auto
                mb-5
                text-blue-400
                rounded-full
                bg-gray-800
              "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#60a5fa"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx="12" cy="9" r="6" />
                  <polyline
                    points="9 14.2 9 21 12 19 15 21 15 14.2"
                    transform="rotate(-30 12 9)"
                  />
                  <polyline
                    points="9 14.2 9 21 12 19 15 21 15 14.2"
                    transform="rotate(30 12 9)"
                  />
                </svg>
              </div>
              <h1
                className="
                mx-auto
                mb-8
                text-2xl
                font-semibold
                leading-none
                tracking-tighter
                text-neutral-600
                lg:text-3xl
              "
              >
                Outstanding awards received from others
              </h1>
              <p className="mx-auto text-base leading-relaxed text-gray-300">
                Director's Honour Roll, Scholarship &amp; Edusave Awards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        twitterUsername
      }
    }
    allSanityPost(
      sort: { fields: [publishedAt], order: DESC }
      filter: { slug: { current: { ne: null } }, publishedAt: { ne: null } }
      limit: 4
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

export default IndexPage;
