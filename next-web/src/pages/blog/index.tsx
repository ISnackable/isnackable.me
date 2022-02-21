import { forwardRef } from "react";
import type { NextPage } from "next";
import {
  Container,
  Center,
  Grid,
  Title,
  Text,
  TextInput,
  Menu,
  UnstyledButton,
  UnstyledButtonProps
} from "@mantine/core";
import Seo from "@components/seo";

interface FilterButtonProps extends UnstyledButtonProps {
  icon?: React.ReactNode;
}

const BlogPage: NextPage = () => {
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
      <Seo title={"Blog"} description={"A collection of my blog posts"} />
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

          <Grid justify="center" align="center">
            <Grid.Col span={11}>
              <TextInput placeholder="Search..." aria-label="Search" />
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
                <Menu.Item>Some items</Menu.Item>
                <Menu.Item>Some items</Menu.Item>
                <Menu.Item>Some items</Menu.Item>
              </Menu>
            </Grid.Col>
          </Grid>
        </Container>
      </section>
    </>
  );
};

export default BlogPage;
