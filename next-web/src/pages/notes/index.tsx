import type { NextPage } from "next";
import { Container, Center, Title, Text } from "@mantine/core";
import Seo from "@components/seo";

const Notes: NextPage = () => {
  return (
    <>
      <Seo
        title={"Notes"}
        description={"A collection of notes I find useful"}
      />
      <section>
        <Container size="xl" padding={20} my={96}>
          <Center>
            <Title order={1} my="md">
              Collection of notes
            </Title>
          </Center>
          <Center>
            <Text size="md" mb="md">
              WIP, Adding notes that I find useful
            </Text>
          </Center>
        </Container>
      </section>
    </>
  );
};

export default Notes;
