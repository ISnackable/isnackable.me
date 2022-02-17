import { GetStaticProps, GetStaticPaths } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import { Affix, Button, Text, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { PortableText } from "@portabletext/react";
import { getClient } from "@lib/sanity.server";
import { urlFor, usePreviewSubscription } from "@lib/sanity";

// type Props = {
//   speaker: String;
// };

const BlogPost = () => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 200}>
          {(transitionStyles) => (
            <Button style={transitionStyles} onClick={() => scrollTo({ y: 0 })}>
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
      <div>BlogPage</div>
    </>
  );
};

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   // params contains the post `id`.
//   // If the route is like /posts/1, then params.id is 1
//   const res = await fetch(`http://127.0.0.1/posts/${params?.id}`);
//   const post = await res.json();

//   // Pass post data to the page via props
//   return { props: { post }, revalidate: 1 };
// };

// export const getStaticPaths: GetStaticPaths = async () => {
//   // Call an external API endpoint to get posts
//   const res = await fetch("http://127.0.0.1/posts");
//   const posts = await res.json();

//   // Get the paths we want to pre-render based on posts
//   const paths = posts.map((post: { id: String }) => ({
//     params: { id: post.id },
//   }));

//   // We'll pre-render only these paths at build time.
//   // { fallback: false } means other routes should 404.
//   return { paths, fallback: false };
// };

export default BlogPost;
