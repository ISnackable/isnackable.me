import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import dynamic from "next/dynamic";
import { toPlainText } from "@portabletext/react";
import SEO from "@components/SEO";
import BlogPost from "@components/BlogPost";
import { getAllPosts, getSinglePost } from "@lib/sanity.server";
import { urlFor } from "@lib/sanity";
import type { AllSanityPost } from "../../@types/sanity";

const TableOfContent = dynamic(() => import("@components/TableOfContent"), {
  ssr: false,
  loading: () => <p>loading...</p>
});

type Props = {
  post: AllSanityPost;
};

const BlogPostPage: NextPage<Props> = ({ post }) => {
  return (
    <>
      <SEO
        title={post.title}
        description={toPlainText(post.body)}
        image={urlFor(post.mainImage).url()}
        article={true}
      />
      <article>
        {post && (
          <>
            <TableOfContent post={post} />
            <BlogPost post={post} />
          </>
        )}
      </article>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false
}) => {
  const slug = params?.slug as string;
  const post = await getSinglePost(preview, slug);

  return { props: { post }, revalidate: 60 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  const slugs = posts.map((post) => ({
    params: { slug: post.slug }
  }));

  return { paths: slugs, fallback: false };
};

export default BlogPostPage;
