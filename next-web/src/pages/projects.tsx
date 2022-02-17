import type { NextPage } from "next";
import { Container, Center, Title, Text, Space } from "@mantine/core";
import Seo from "@components/seo";

const Projects: NextPage = () => {
  return (
    <>
      <Seo
        title={"Projects"}
        description={"A quick collection of my open-source projects"}
      />
      <section>
        <Space h={96} />
        <Container size="xl" padding={20}>
          <Center>
            <Title order={1} my="md">
              My Projects
            </Title>
          </Center>
          <Center>
            <Text size="md" mb="md">
              Open-sourced projects, made with love.
            </Text>
          </Center>
        </Container>
        <Space h={96} />
      </section>
    </>
  );
};

export default Projects;
