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
  Space,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import Seo from "@components/seo";

interface FilterButtonProps extends UnstyledButtonProps {
  icon?: React.ReactNode;
}

const BlogPage: NextPage = (props) => {
  const UserButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
    ({ icon, ...others }: FilterButtonProps, ref) => (
      <UnstyledButton
        ref={ref}
        sx={(theme) => ({
          display: "block",
          padding: 5,
          borderRadius: "100%",
          color:
            theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
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
        <Space h={96} />
        <Container size="xl" padding={20}>
          <Center>
            <Title order={1} my="md">
              Blog Post
            </Title>
          </Center>
          <Center>
            <Text size="md" mb="md">
              I write stuff I find interesting.
            </Text>
          </Center>
          <Space h={80} />

          <Grid justify="center" align="center">
            <Grid.Col span={11}>
              <TextInput
                placeholder="Search..."
                aria-label="Search"
                type="search"
              />
            </Grid.Col>
            <Grid.Col span={1}>
              <Menu
                control={
                  <UserButton
                    icon={
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#ffffff"
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
        <Space h={96} />
      </section>
    </>
  );
};

export default BlogPage;
