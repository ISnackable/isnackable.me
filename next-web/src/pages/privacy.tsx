import type { NextPage } from "next";
import Image from "next/image";
import { Container, Title, Text } from "@mantine/core";
import Seo from "@components/seo";
import svgImage from "../../public/svg/undraw_personal_information_re_vw8a.svg";

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
            I don&apos;t store you data.
          </Text>
          <Text size="md" my="md">
            This website is hosted on GitHub Pages, which is just a static site.
            There isn&apos;t any place to store any information collected.
            GitHub might see your IP address when visiting to my website, but
            that is the nature of visiting a website.
          </Text>
          <Image
            src={svgImage}
            layout="responsive"
            alt="Undraw personal information logo"
            priority
          />
        </Container>
      </section>
    </>
  );
};

export default Projects;
