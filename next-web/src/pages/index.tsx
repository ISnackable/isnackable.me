import type { NextPage } from "next";
import { GetStaticProps } from "next";
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
import Seo from "@components/seo";
import { getClient, overlayDrafts } from "@lib/sanity.server";
import { GetNextSanityImage } from "@lib/sanity";
import { toDateString } from "@lib/helpers";
import { indexPagePosts } from "@lib/groqQueries";
import type { AllSanityPost } from "../@types/allSanityPost";
import siteConfig from "../../site.config";
import svgImage from "../../public/svg/undraw_hacker_mind_-6-y85.svg";

interface Props {
  allPosts: AllSanityPost[];
  preview: boolean;
}

const Home: NextPage<Props> = ({ allPosts }) => {
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
              <Text color="blue" inherit component="span">
                {siteConfig.socialUsername}
              </Text>
              , Tommy
            </Title>
          </Center>
          <Center mb={96}>
            <Text
              size="lg"
              mb="md"
              align="center"
              style={{ maxWidth: "36rem" }}
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
                { maxWidth: 768, cols: 1, spacing: "sm" }
              ]}
            >
              {allPosts.length > 0 &&
                allPosts.map((post) => {
                  const imageProps = GetNextSanityImage(post.mainImage);

                  return (
                    <Card
                      key={post._id}
                      padding="lg"
                      sx={(theme) => ({
                        backgroundColor: theme.colors.dark[7]
                      })}
                    >
                      <Image
                        {...imageProps}
                        className="rounded-lg"
                        placeholder="blur"
                        layout="responsive"
                        sizes="(max-width: 800px) 100vw, 800px"
                        alt={post.mainImage?.alt ?? `${post.title} main image`}
                      />

                      <Group
                        position="apart"
                        style={{ margin: "32px 0px 5px 0px" }}
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
  const allPosts = overlayDrafts(
    await getClient(preview).fetch(indexPagePosts)
  );

  return {
    props: { allPosts, preview },
    revalidate: 1
  };
};

export default Home;
