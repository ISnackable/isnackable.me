/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Link from "next/link";
import { ActionIcon, Badge, Box } from "@mantine/core";
import { IconInfoCircle, IconLogout } from "@tabler/icons";

interface Props {
  href: string;
}

const PreviewBar: NextPage<Props> = (props) => {
  const { href } = props;

  return (
    <Box
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: 2,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[7]
            : theme.colors.gray[0]
      })}
    >
      <Badge
        variant="gradient"
        gradient={{ from: "indigo", to: "cyan" }}
        leftSection={
          <ActionIcon variant="transparent" radius="lg" component="i">
            <IconInfoCircle size={16} stroke={1.5} />
          </ActionIcon>
        }
      >
        Preview Mode Activated!
      </Badge>

      <Link href={href}>
        <Badge
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          sx={{ float: "right", cursor: "pointer" }}
          leftSection={
            <ActionIcon variant="transparent" radius="lg" component="i">
              <IconLogout size={16} stroke={1.5} />
            </ActionIcon>
          }
        >
          Exit
        </Badge>
      </Link>
    </Box>
  );
};

export default PreviewBar;
