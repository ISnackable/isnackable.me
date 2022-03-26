/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import useSWR from "swr";
import {
  createStyles,
  keyframes,
  Badge,
  Paper,
  Center,
  Text,
  ThemeIcon
} from "@mantine/core";
import { IconLiveView } from "@tabler/icons";
import { fetcherJSON } from "@lib/fetcher";
import { JSend } from "../../../@types/JSend";

type liveVisitors = JSend & {
  data: {
    visitors: number;
  };
};

const ICON_SIZE = 60;

export const blinker = keyframes({
  "50%": { opacity: 0 }
});

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    overflow: "visible",
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 1.5 + ICON_SIZE / 3
  },

  icon: {
    position: "absolute",
    top: -ICON_SIZE / 3,
    left: `calc(50% - ${ICON_SIZE / 2}px)`
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1
  },

  badge: {
    animation: `${blinker} 2s linear infinite`
  }
}));

const Visitors: NextPage = () => {
  const { data: liveVisitors } = useSWR<liveVisitors>(
    "/api/statistics/visitors",
    fetcherJSON
  );

  const { classes } = useStyles();

  return (
    <Paper radius="md" withBorder className={classes.card} mt={ICON_SIZE / 3}>
      <ThemeIcon className={classes.icon} size={ICON_SIZE} radius={ICON_SIZE}>
        <IconLiveView size={34} />
      </ThemeIcon>

      <Center>
        <Badge variant="dot" size="lg" className={classes.badge}>
          {liveVisitors?.data.visitors}
        </Badge>
      </Center>
      <Text align="center" weight={700} className={classes.title} mt="sm">
        Live Visitors
      </Text>
    </Paper>
  );
};

export default Visitors;
