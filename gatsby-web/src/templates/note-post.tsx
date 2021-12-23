import React from "react";
import { graphql } from "gatsby";
import Seo from "../components/seo";
import Layout from "../components/layout";
import BlogPost from "../components/blog-post";
import { toPlainText } from "../lib/helpers";

export const query = graphql`
  query NotePostTemplateQuery($id: String!) {
    post: sanityNote(id: { eq: $id }) {
      id
      publishedAt
      title
      slug {
        current
      }
      _rawBody(resolveReferences: { maxDepth: 5 })
      author {
        name
        mainImage {
          asset {
            gatsbyImageData(fit: FILLMAX, placeholder: BLURRED)
          }
        }
      }
      mainImage {
        asset {
          gatsbyImageData(fit: FILLMAX, placeholder: BLURRED)
        }
        alt
      }
      description
    }
  }
`;

const NotePostTemplate = (props: any) => {
  const { data, errors } = props;
  const post = data && data.post;

  return (
    <Layout>
      {errors && <Seo title="GraphQL Error" />}
      {post && (
        <Seo
          title={post.title || "Untitled"}
          description={toPlainText(post?._rawBody)}
          image={post?.mainImage?.asset?.gatsbyImageData?.images?.fallback?.src}
        />
      )}
      <h1 className="text-center text-6xl mt-6">Work in progress</h1>

      {/* {post && <BlogPost {...post} />} */}
    </Layout>
  );
};

export default NotePostTemplate;
