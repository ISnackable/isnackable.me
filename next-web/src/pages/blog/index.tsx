/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import React, { useCallback, useState, forwardRef } from "react";
import {
  Container,
  Center,
  Group,
  Title,
  Text,
  TextInput,
  Menu,
  UnstyledButton,
  UnstyledButtonProps,
  Pagination
} from "@mantine/core";
import { IconFilter, IconSearch } from "@tabler/icons";
import SEO from "@components/SEO";
import { getAllPosts, getAllCategories } from "@lib/sanity.server";
import type { AllSanityPost, AllSanityCategory } from "../../@types/sanity";

const Blog = dynamic(() => import("@components/Blog"), {
  ssr: false,
  loading: () => <p>loading...</p>
});

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
      // Note that Preact and React return different event object.
      let query: string;
      if (event.type === "click") {
        query = (event.currentTarget as HTMLElement).innerText.trim();
      } else {
        query = (event.target as HTMLInputElement).value.trim();
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

  return (
    <>
      <SEO title={"Blog"} description={"A collection of my blog posts"} />
      <section>
        <Container size="xl" px={20} my={96}>
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

          <Group>
            <TextInput
              sx={() => ({
                flex: 1
              })}
              icon={<IconSearch size={18} />}
              placeholder="Search..."
              aria-label="Search"
              onChange={handleFilterEvent}
            />
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <FilterButton icon={<IconFilter size={32} stroke={1.5} />} />
              </Menu.Target>

              <Menu.Dropdown>
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
              </Menu.Dropdown>
            </Menu>
          </Group>

          {state.filteredData.length > 0 ? (
            <Blog state={state} />
          ) : (
            <Text
              align="center"
              size="md"
              my="lg"
              sx={() => ({
                overflowWrap: "break-word"
              })}
            >
              No result for &quot;{state.query}&quot;
            </Text>
          )}

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
