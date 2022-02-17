import type { NextPage } from "next";
import { Container, Title, Text, Image } from "@mantine/core";
import Seo from "@components/seo";

const Projects: NextPage = () => {
  return (
    <>
      <Seo title={"Privacy"} />
      <section>
        <Container size="sm">
          <Title order={1} my="xl">
            Privacy Policy
          </Title>
          <Title order={2} my="md">
            In short
          </Title>
          <Text size="md" my="md">
            I don't store you data.
          </Text>
          <Text size="md" my="md">
            This website is hosted on GitHub Pages, which is just a static site.
            There isn't any place to store any information collected. GitHub
            might see your IP address when visiting to my website, but that is
            the nature of visiting a website.
          </Text>
          <Image
            width={100}
            height={100}
            src={null}
            alt="Undraw personal information logo"
            withPlaceholder
          />
        </Container>
      </section>
    </>
  );
};

export default Projects;
