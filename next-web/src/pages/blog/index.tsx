import type { NextPage, GetStaticProps } from "next";
import React, { useCallback, useState, forwardRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Container,
  Center,
  Divider,
  Grid,
  Title,
  Text,
  TextInput,
  Menu,
  UnstyledButton,
  UnstyledButtonProps,
  Pagination
} from "@mantine/core";
import SEO from "@components/SEO";
import { getAllPosts, getAllCategories } from "@lib/sanity.server";
import { toDateString } from "@lib/helpers";
import type { AllSanityPost, AllSanityCategory } from "../../@types/sanity";
const SanityNextImage = dynamic(() => import("@components/SanityNextImage"));

interface Props {
  data: {
    posts: AllSanityPost[];
    categories: AllSanityCategory[];
  };
  preview: boolean;
}

interface FilterButtonProps extends UnstyledButtonProps {
  icon?: React.ReactNode;
}

const BlogPage: NextPage<Props> = ({ data }) => {
  const dataLimit = 8;
  const { posts, categories } = data;
  const [activePage, setPage] = useState(1);
  const [state, setState] = useState({
    filteredData: posts.slice(0, dataLimit),
    query: ""
  });

  const getPaginatedData = useCallback(
    (page: number) => {
      const startIndex = page * dataLimit - dataLimit;
      const endIndex = startIndex + dataLimit;

      setPage(page);
      setState({
        query: "",
        filteredData: posts.slice(startIndex, endIndex)
      });
    },
    [posts]
  );

  const handleFilterEvent = useCallback(
    (event: React.SyntheticEvent) => {
      let query: string;
      if (event.type === "change") {
        query = (event.target as HTMLInputElement).value.trim();
      } else {
        query = (event.currentTarget as HTMLElement).innerText;
      }

      const filteredData = posts.filter((post) => {
        const { description, title, categories } = post;
        const tag = categories && categories[0]?.title;

        return (
          description.toLowerCase().includes(query.toLowerCase()) ||
          title.toLowerCase().includes(query.toLowerCase()) ||
          (tag && tag.toLowerCase().includes(query.toLowerCase()))
        );
      });

      setPage(1);
      setState({
        query,
        filteredData: query !== "" ? filteredData : posts.slice(0, dataLimit)
      });
    },
    [posts]
  );

  const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
    ({ icon, ...others }: FilterButtonProps, ref) => (
      <UnstyledButton
        aria-labelledby="Filter button"
        ref={ref}
        sx={(theme) => ({
          display: "block",
          padding: 5,
          borderRadius: "100%",
          color:
            theme.colorScheme === "dark"
              ? theme.colors.gray[5]
              : theme.colors.gray[6],

          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0]
          }
        })}
        {...others}
      >
        {icon}
      </UnstyledButton>
    )
  );

  return (
    <>
      <SEO title={"Blog"} description={"A collection of my blog posts"} />
      <section>
        <Container size="xl" padding={20} my={96}>
          <Center>
            <Title order={1} my="md">
              Blog Post
            </Title>
          </Center>
          <Center mb={80}>
            <Text size="md" mb="md">
              I write stuff I find interesting.
            </Text>
          </Center>

          <Grid>
            <Grid.Col span={11}>
              <TextInput
                placeholder="Search..."
                aria-label="Search"
                onChange={handleFilterEvent}
              />
            </Grid.Col>
            <Grid.Col span={1}>
              <Menu
                menuButtonLabel="Filter button"
                control={
                  <FilterButton
                    icon={
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5.5 5h13a1 1 0 0 1 .5 1.5l-5 5.5l0 7l-4 -3l0 -4l-5 -5.5a1 1 0 0 1 .5 -1.5" />
                      </svg>
                    }
                  />
                }
              >
                <Menu.Label>Filter</Menu.Label>
                <Menu.Item
                  onClick={() => {
                    setState({
                      query: "",
                      filteredData: posts.slice(0, dataLimit)
                    });
                  }}
                >
                  all posts
                </Menu.Item>
                {categories.length > 0 &&
                  categories.map((category) => {
                    return (
                      <Menu.Item key={category._id} onClick={handleFilterEvent}>
                        {category.title}
                      </Menu.Item>
                    );
                  })}
              </Menu>
            </Grid.Col>
          </Grid>

          {state.filteredData.length > 0 &&
            state.filteredData.map((post) => {
              return (
                <React.Fragment key={post._id}>
                  <Grid my={32} align="center">
                    <Grid.Col xs={2}>
                      <SanityNextImage
                        image={post.mainImage}
                        className="rounded-lg"
                        alt={post.mainImage?.alt ?? `${post.title} main image`}
                        layout="responsive"
                        placeholder={post.mainImage?.lqip ? "blur" : undefined}
                        blurDataURL={post.mainImage?.lqip}
                        sizes="(min-width: 282px) 282px, 100vw"
                      />
                    </Grid.Col>
                    <Grid.Col xs={10}>
                      <Link
                        href={{
                          pathname: "/blog/[slug]",
                          query: { slug: post.slug }
                        }}
                        passHref
                      >
                        <a>
                          <Text size="sm">
                            {toDateString(post.publishedAt)}
                          </Text>
                          <Text
                            size="xl"
                            weight={700}
                            sx={(theme) => ({
                              "&:hover": {
                                color: theme.colors.gray[4]
                              }
                            })}
                          >
                            {post.title}
                          </Text>
                          <Text size="md">{post.description}</Text>
                        </a>
                      </Link>
                    </Grid.Col>
                  </Grid>
                  <Divider variant="dotted" />
                </React.Fragment>
              );
            })}

          <Center my={36}>
            <Pagination
              align="center"
              size="lg"
              total={Math.round(posts.length / dataLimit)}
              page={activePage}
              onChange={getPaginatedData}
              getItemAriaLabel={(page) => {
                switch (page) {
                  case "dots":
                    return "dots element aria-label";
                  case "prev":
                    return "previous page button aria-label";
                  case "next":
                    return "next page button aria-label";
                  case "first":
                    return "first page button aria-label";
                  case "last":
                    return "last page button aria-label";
                  default:
                    return `${page} item aria-label`;
                }
              }}
            />
          </Center>
        </Container>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const posts = await getAllPosts();
  const categories = await getAllCategories();

  const data = { posts, categories };

  return {
    props: { data, preview },
    revalidate: 60
  };
};

export default BlogPage;
