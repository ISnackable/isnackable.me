import type { NextPage, GetStaticProps } from "next";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Container,
  Center,
  Card,
  Title,
  Text,
  SimpleGrid,
  ThemeIcon,
  Group
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { useLocalStorage } from "@mantine/hooks";
import SEO from "@components/SEO";
import { getAllPosts } from "@lib/sanity.server";
import { toDateString } from "@lib/helpers";
import type { AllSanityPost } from "../@types/sanity";
import { socialUsername } from "@lib/config";
import svgImage from "../../public/svg/undraw_hacker_mind_-6-y85.svg";

const SanityNextImage = dynamic(() => import("@components/SanityNextImage"), {
  ssr: false
});

type NewVisitor = "true" | "false";

interface Props {
  posts: AllSanityPost[];
  preview: boolean;
}

const HomePage: NextPage<Props> = ({ posts }) => {
  const [newVisitor, setNewVisitor] = useLocalStorage<NewVisitor>({
    key: "new-visitor",
    defaultValue: "true"
  });
  const notifications = useNotifications();

  useEffect(() => {
    if (newVisitor === "true") {
      notifications.showNotification({
        title: `Hey there! Thanks for checking out my site.`,
        message: `To change the theme of the site, you can use Ctrl+J or switch icon at the side.`
      });
    }

    return () => setNewVisitor("false");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SEO
        title={"Home"}
        description={`Home page of ${socialUsername} personal site`}
      />
      <Container
        size="xl"
        sx={() => ({
          padding: "96px 64px",

          "@media (max-width: 900px)": {
            padding: 48
          },

          "@media (max-width: 640px)": {
            padding: "48px 20px"
          }
        })}
      >
        <section id="intro">
          <Center>
            <Title order={1} my="md" sx={{ fontSize: 48 }} align="center">
              Hey there I&apos;m{" "}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                inherit
              >
                @{socialUsername}
              </Text>
              , Tommy
            </Title>
          </Center>
          <Center mb={96}>
            <Text
              size="lg"
              mb="md"
              align="center"
              sx={() => ({
                maxWidth: "36rem"
              })}
            >
              An aspiring Cyber Specialist and an open-source advocate. I&apos;m
              also a full-time student studying cybersecurity. P.S. Tommy is
              just an online alias.
            </Text>
          </Center>

          <Image src={svgImage} alt="Hero" layout="responsive" priority />
        </section>

        <section style={{ margin: "96px 0px" }}>
          <Title order={3} ml={20}>
            Some Recent Blog Posts
          </Title>
          <Center>
            <SimpleGrid
              cols={4}
              spacing={48}
              breakpoints={[
                { maxWidth: 980, cols: 2, spacing: "md" },
                { maxWidth: 576, cols: 1, spacing: "sm" }
              ]}
            >
              {posts.length > 0 &&
                posts.map((post) => {
                  return (
                    <Card
                      key={post._id}
                      p="lg"
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.white
                      })}
                    >
                      <SanityNextImage
                        image={post.mainImage}
                        className="rounded-lg"
                        alt={post.mainImage?.alt ?? `${post.title} main image`}
                        layout="responsive"
                        placeholder={post.mainImage?.lqip ? "blur" : undefined}
                        blurDataURL={post.mainImage?.lqip}
                        sizes="(min-width: 1200px) 1200px, 100vw"
                      />

                      <Group
                        position="apart"
                        sx={() => ({ margin: "32px 0px 5px 0px" })}
                      >
                        <Link
                          href={{
                            pathname: "/blog/[slug]",
                            query: { slug: post.slug }
                          }}
                          passHref
                        >
                          <Text weight={500} component="a">
                            {post.title}
                          </Text>
                        </Link>
                      </Group>

                      <Text mb={16}>
                        <time dateTime={post.publishedAt}>
                          {toDateString(post.publishedAt)}
                        </time>
                      </Text>
                      <Link
                        href={{
                          pathname: "/blog/[slug]",
                          query: { slug: post.slug }
                        }}
                        aria-label={`Read "${post.title}"`}
                        passHref
                      >
                        <Text color="blue" inherit component="a">
                          Read More »
                        </Text>
                      </Link>
                    </Card>
                  );
                })}
            </SimpleGrid>
          </Center>
        </section>

        <section style={{ margin: "96px 0px" }}>
          <Title order={3} ml={20}>
            Experience &amp; Awards
          </Title>
          <SimpleGrid
            cols={2}
            spacing={48}
            breakpoints={[{ maxWidth: 980, cols: 1 }]}
          >
            <div style={{ padding: 20 }}>
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
            <div style={{ padding: 20 }}>
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
                Director&apos;s Honour Roll, Scholarship &amp; Edusave Awards.
              </Text>
            </div>
          </SimpleGrid>
        </section>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const posts = (await getAllPosts()).slice(0, 4);

  return {
    props: { posts, preview },
    revalidate: 60
  };
};

export default HomePage;
