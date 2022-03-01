import type { NextPage, GetStaticProps } from "next";
import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Grid,
  Title,
  Text
} from "@mantine/core";
import SEO from "@components/SEO";
import SanityNextImage from "@components/SanityNextImage";
import { getAllProjects } from "@lib/sanity.server";
import type { AllSanityProject } from "../@types/sanity";
import { socialUsername } from "@lib/config";

interface Props {
  projects: AllSanityProject[];
  preview: boolean;
}

const Projects: NextPage<Props> = ({ projects }) => {
  return (
    <>
      <SEO
        title={"Projects"}
        description={"A quick collection of my open-source projects"}
      />
      <section>
        <Container size="xl" padding={20} my={96}>
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
          <Grid gutter="xl" align="flex-start">
            {projects.length > 0 &&
              projects.map((project) => (
                <Grid.Col key={project._id} xs={6} lg={4}>
                  <Card shadow="sm" padding="lg">
                    <Card.Section>
                      <div style={{ margin: 24 }}>
                        <SanityNextImage
                          image={project.mainImage}
                          width={320}
                          height={160}
                          className="rounded-lg object-cover"
                          alt={
                            project.mainImage?.alt ??
                            `${project.title} main image`
                          }
                          layout="responsive"
                          placeholder={
                            project.mainImage?.lqip ? "blur" : undefined
                          }
                          blurDataURL={project.mainImage?.lqip}
                          sizes="(min-width: 3200px) 3200px, 100vw"
                        />
                      </div>
                    </Card.Section>

                    <Group position="apart" style={{ marginBottom: 5 }}>
                      <Link href={project.projectUrl} passHref>
                        <Text
                          component="a"
                          weight={500}
                          size="lg"
                          sx={(theme) => ({
                            "&:hover": {
                              color:
                                theme.colorScheme === "dark"
                                  ? theme.colors.gray[3]
                                  : theme.colors.gray[8]
                            }
                          })}
                        >
                          {project.title}
                        </Text>
                      </Link>

                      <Badge variant="light">
                        {projects[0] === project && "Latest | "}Open source
                      </Badge>
                    </Group>

                    <Text size="md" style={{ lineHeight: 1.5 }}>
                      {project.description}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
          </Grid>
          <Center my={64}>
            <Link href={`https://github.com/${socialUsername}`} passHref>
              <Button
                component="a"
                size="md"
                leftIcon={
                  <ActionIcon variant="transparent">
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

export default Projects;
