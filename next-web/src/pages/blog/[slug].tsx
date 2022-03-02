import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { Affix, Button, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { toPlainText } from "@portabletext/react";
import SEO from "@components/SEO";
import BlogPost from "@components/BlogPost";
import { getAllPosts, getSinglePost } from "@lib/sanity.server";
import { urlFor } from "@lib/sanity";
import type { AllSanityPost } from "../../@types/sanity";

type Props = {
  post: AllSanityPost;
};

const BlogPostPage: NextPage<Props> = ({ post }) => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <>
      <SEO
        title={post.title}
        description={toPlainText(post.body)}
        image={urlFor(post.mainImage).url()}
        article={true}
      />
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 200}>
          {(transitionStyles) => (
            <Button style={transitionStyles} onClick={() => scrollTo({ y: 0 })}>
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
      <article>{post && <BlogPost post={post} />}</article>
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
