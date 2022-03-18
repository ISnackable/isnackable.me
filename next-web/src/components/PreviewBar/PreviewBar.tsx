import type { NextPage } from "next";
import Link from "next/link";
import { ActionIcon, Badge, Box, ThemeIcon } from "@mantine/core";

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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
              <polyline points="11 12 12 12 12 16 13 16" />
            </svg>
          </ActionIcon>
        }
      >
        Preview Mode Activated!
      </Badge>

      <Link href={href} passHref>
        <Badge
          component="a"
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          sx={{ float: "right", cursor: "pointer" }}
          leftSection={
            <ThemeIcon variant="light" radius="lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M7 12h14l-3 -3m0 6l3 -3" />
              </svg>
            </ThemeIcon>
          }
        >
          Exit
        </Badge>
      </Link>
    </Box>
  );
};

export default PreviewBar;
