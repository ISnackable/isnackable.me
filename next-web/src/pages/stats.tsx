/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import { Center, Container, Space, Text, Title } from "@mantine/core";
import SEO from "@components/SEO";
import Visitors from "@components/Statistics/Visitors";
import Aggregate from "@components/Statistics/Aggregate";

const StatsPage: NextPage = () => {
  return (
    <>
      <SEO
        title="Statistics"
        description="Stats provided by Plausible Analytics. Consist of realtime visitors and other page view data."
      />
      <section>
        <Container size="md" px={20} my={96}>
          <Center>
            <Title order={1} my="md">
              Statistics
            </Title>
          </Center>
          <Center mb={80}>
            <Text size="md" mb="md">
              Stats provided by Plausible Analytics and other APIs.
            </Text>
          </Center>
          <Text size="lg" transform="uppercase" mb="xl">
            Site Stats{" "}
            <Text color="dimmed" component="span">
              (Updated every 60 seconds)
            </Text>
          </Text>
          <Visitors />
          <Space h="xl" />
          <Aggregate />
        </Container>
      </section>
    </>
  );
};

export default StatsPage;
