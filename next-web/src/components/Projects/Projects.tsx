/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Link from "next/link";
import { Badge, Card, Grid, Group, Text } from "@mantine/core";
import SanityNextImage from "@components/SanityNextImage";
import type { AllSanityProject } from "../../@types/sanity";

interface Props {
  projects: AllSanityProject[];
}

const Projects: NextPage<Props> = (props) => {
  const { projects } = props;

  return (
    <Grid gutter="xl" align="flex-start">
      {projects.map((project) => {
        return (
          <Grid.Col key={project._id} xs={6} lg={4}>
            <Card shadow="sm" p="lg">
              <Card.Section>
                <div style={{ margin: 24 }}>
                  <SanityNextImage
                    image={project.mainImage}
                    width={320}
                    height={160}
                    className="rounded-lg object-cover"
                    alt={
                      project.mainImage?.alt ?? `${project.title} main image`
                    }
                    layout="responsive"
                    placeholder={project.mainImage?.lqip ? "blur" : undefined}
                    blurDataURL={project.mainImage?.lqip}
                    sizes="(min-width: 3200px) 3200px, 100vw"
                  />
                </div>
              </Card.Section>

              <Group position="apart" sx={() => ({ marginBottom: 5 })}>
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

              <Text size="md" sx={() => ({ lineHeight: 1.5 })}>
                {project.description}
              </Text>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default Projects;
