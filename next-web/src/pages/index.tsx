import type { NextPage } from "next";
import { GetStaticProps, GetStaticPaths } from "next";
import Link from "next/link";
import {
  Container,
  Center,
  Title,
  Text,
  Image,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import { groq } from "next-sanity";
import Seo from "@components/seo";
import { getClient, overlayDrafts } from "@lib/sanity.server";
// import { urlFor } from "@lib/sanity";
import type { AllSanityPost } from "../@types/allSanityPost";
import siteConfig from "../../site.config";

interface Props {
  data: Posts;
  preview: boolean;
}

interface Posts {
  posts: AllSanityPost[];
}

const postQuery = groq`
*[_type == "post"]{
  _id,
  publishedAt,
  mainImage,
  title,
  "slug": slug.current,
  description
}|order(publishedAt desc)[0..4]
`;

const Home: NextPage<Props> = ({ data, preview }) => {
  console.log(data?.posts);

  return (
    <>
      <Seo
        title={"Home"}
        description={"Home page of ISnackable personal site"}
      />
      <Container
        size="xl"
        sx={() => ({
          padding: "96px 64px",

          "@media (max-width: 900px)": {
            padding: 48,
          },
        })}
      >
        <section id="intro">
          <Center>
            <Title order={1} my="md" sx={{ fontSize: 48 }} align="center">
              Hey there I'm{" "}
              <Text color="blue" inherit component="span">
                {siteConfig.socialUsername}
              </Text>
              , Tommy
            </Title>
          </Center>
          <Center>
            <Text size="md" mb="md" align="center">
              An aspiring Cyber Specialist and an open-source advocate. I'm also
              a full-time student studying cybersecurity. P.S. Tommy is just an
              online alias.
            </Text>
          </Center>

          <Image
            width="100%"
            height="100%"
            src="/undraw_hacker_mind_-6-y85.svg"
            alt="Hero"
            withPlaceholder
          />
        </section>

        <section>
          <Title order={3}>Some Recent Blog Posts</Title>
          <SimpleGrid
            cols={4}
            spacing={48}
            breakpoints={[{ maxWidth: 980, cols: 1 }]}
          >
            {/* TODO: Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak */}
            {data.posts.length &&
              data.posts.map((post) => {
                return (
                  <div key={post._id}>
                    <Link
                      href={{
                        pathname: "/blog/[slug]",
                        query: { slug: post.slug },
                      }}
                    >
                      <a>{post.title}</a>
                    </Link>
                  </div>
                );
              })}
          </SimpleGrid>
        </section>

        <section>
          <Title order={3}>Experience &amp; Awards</Title>
          <SimpleGrid
            cols={2}
            spacing={48}
            breakpoints={[{ maxWidth: 980, cols: 1 }]}
          >
            <div>
              <ThemeIcon variant="light" radius="xl" size="xl" mb={20}>
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
              </ThemeIcon>
              <Title order={4} mb={32}>
                Internship in the Cybersecurity industry
              </Title>
              <Text size="md">
                Opportunity to become a Cybersecurity research intern and a
                Cybersecurity forensic incident response intern.
              </Text>
            </div>
            <div>
              <ThemeIcon variant="light" radius="xl" size="xl" mb={20}>
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
              </ThemeIcon>
              <Title order={4} mb={32}>
                Outstanding awards received from others
              </Title>
              <Text size="md">
                Director's Honour Roll, Scholarship &amp; Edusave Awards.
              </Text>
            </div>
          </SimpleGrid>
        </section>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const posts = overlayDrafts(await getClient(preview).fetch(postQuery));

  return {
    props: {
      preview,
      data: { posts },
    },
    revalidate: 1,
  };
};

export default Home;
