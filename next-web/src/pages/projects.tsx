/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
import { IconExternalLink } from "@tabler/icons";
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
                      <IconExternalLink size={40} stroke={1.5} />
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
