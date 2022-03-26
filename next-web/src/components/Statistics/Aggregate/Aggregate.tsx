/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import useSWR from "swr";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
  IconUserPlus,
  IconEye,
  IconWaveSine,
  IconClock,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons";
import { fetcherJSON } from "@lib/fetcher";
import { JSend } from "../../../@types/JSend";

interface Data {
  change: number;
  value: number;
}

type liveVisitors = JSend & {
  data: {
    bounce_rate: Data;
    pageviews: Data;
    visit_duration: Data;
    visitors: Data;
  };
};

const useStyles = createStyles((theme) => ({
  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center"
  },

  icon: {
    color:
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[4]
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase"
  }
}));

const icons = {
  totalVisitor: IconUserPlus,
  pageView: IconEye,
  bounceRate: IconWaveSine,
  visitDuration: IconClock
};

const Aggregate: NextPage = () => {
  const { data: aggregatesMetrics } = useSWR<liveVisitors>(
    "/api/statistics/aggregate",
    fetcherJSON
  );

  const data = [
    {
      title: "Total Visitors",
      value: aggregatesMetrics?.data.visitors.value,
      icon: "totalVisitor",
      diff: aggregatesMetrics?.data.visitors.change
    },
    {
      title: "Page Views",
      value: aggregatesMetrics?.data.pageviews.value,
      icon: "pageView",
      diff: aggregatesMetrics?.data.pageviews.change
    },
    {
      title: "Bounce Rate",
      value: aggregatesMetrics?.data.bounce_rate.value,
      icon: "bounceRate"
    },
    {
      title: "Visit Duration",
      value: aggregatesMetrics?.data.visit_duration.value,
      icon: "visitDuration",
      diff: aggregatesMetrics?.data.visit_duration.change
    }
  ];

  const { classes } = useStyles();
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon as keyof typeof icons];
    const diff = stat.diff ?? 0;
    const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size={22} />
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          {diff && (
            <Text
              color={diff > 0 ? "teal" : "red"}
              size="sm"
              weight={500}
              className={classes.diff}
            >
              <span>{diff}%</span>
              <DiffIcon size={16} />
            </Text>
          )}
        </Group>
        <Text size="xs" color="dimmed" mt={7}>
          Compared to previous month
        </Text>
      </Paper>
    );
  });

  return (
    <SimpleGrid
      cols={4}
      breakpoints={[
        { maxWidth: "md", cols: 2 },
        { maxWidth: "xs", cols: 1 }
      ]}
    >
      {stats}
    </SimpleGrid>
  );
};

export default Aggregate;
