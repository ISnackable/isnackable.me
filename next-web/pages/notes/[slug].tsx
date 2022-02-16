import { GetStaticProps, GetStaticPaths } from "next";

// type Props = {
//   speaker: String;
// };

export default function NotePage() {
  return <div>NotePage</div>;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const res = await fetch(`https://.../posts/${params?.id}`);
  const post = await res.json();

  // Pass post data to the page via props
  return { props: { post } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Call an external API endpoint to get posts
  const res = await fetch("https://.../posts");
  const posts = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post: { id: String }) => ({
    params: { id: post.id },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
};
