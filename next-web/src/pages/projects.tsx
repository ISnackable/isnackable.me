import type { NextPage, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Title,
  Text
} from "@mantine/core";
import SEO from "@components/SEO";
import { getAllProjects } from "@lib/sanity.server";
import type { AllSanityProject } from "../@types/sanity";
import { socialUsername } from "@lib/config";

const Projects = dynamic(() => import("@components/Projects"), {
  ssr: false,
  loading: () => <p>loading...</p>
});

interface Props {
  projects: AllSanityProject[];
  preview: boolean;
}

const ProjectsPage: NextPage<Props> = ({ projects }) => {
  return (
    <>
      <SEO
        title={"Projects"}
        description={"A quick collection of my open-source projects"}
      />
      <section>
        <Container size="xl" px={20} my={96}>
          <Center>
            <Title order={1} my="md">
              My Projects
            </Title>
          </Center>
          <Center mb={80}>
            <Text size="md" mb="md">
              Open-sourced projects, made with love.
            </Text>
          </Center>
          {projects.length > 0 && <Projects projects={projects} />}
          <Center my={64}>
            <Link href={`https://github.com/${socialUsername}`} passHref>
              <a target="_blank" rel="noreferrer noopener">
                <Button
                  size="md"
                  leftIcon={
                    <ActionIcon variant="transparent" component="i">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#2c3e50"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5" />
                        <line x1="10" y1="14" x2="20" y2="4" />
                        <polyline points="15 4 20 4 20 9" />
                      </svg>
                    </ActionIcon>
                  }
                >
                  More at GitHub
                </Button>
              </a>
            </Link>
          </Center>
        </Container>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const projects = await getAllProjects();

  return {
    props: { projects, preview },
    revalidate: 60
  };
};

export default ProjectsPage;
