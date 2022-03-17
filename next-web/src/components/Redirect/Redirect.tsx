import type { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  Button,
  createStyles,
  Center,
  Loader,
  Paper,
  Progress,
  Skeleton,
  Title,
  Text
} from "@mantine/core";
import { useInterval } from "@mantine/hooks";

interface Props {
  link: string;
  timer: number;
}

const useStyles = createStyles(() => ({
  button: {
    position: "relative",
    transition: "background-color 150ms ease"
  },

  progress: {
    position: "absolute",
    bottom: -1,
    right: -1,
    left: -1,
    top: -1,
    height: "auto",
    backgroundColor: "transparent",
    zIndex: 0
  },

  label: {
    position: "relative",
    zIndex: 1
  }
}));

const Redirect: NextPage<Props> = (props) => {
  const { link, timer } = props;

  const { classes, theme } = useStyles();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        window.location.assign(link);
        return 0;
      }),
    20
  );

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.assign(link);
    }, timer);
    return () => {
      clearInterval(interval);
    };
  }, [link, timer]);

  return (
    <Paper
      shadow="xs"
      radius="md"
      withBorder
      sx={() => ({
        margin: 96,
        padding: 64,

        "@media (max-width: 900px)": {
          margin: 48
        },

        "@media (max-width: 640px)": {
          margin: 0,
          padding: 48
        }
      })}
    >
      <Center mb="lg">
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <line x1="7" y1="3" x2="7" y2="11.707" />
          <path d="M11 7l-4 -4l-4 4" />
          <path d="M17 14l4 -4l-4 -4" />
          <path d="M7 21a11 11 0 0 1 11 -11h3" />
        </svg>
      </Center>
      <Center>
        <Title order={1} mr="md">
          Hang Tight!
        </Title>
        <Loader variant="bars" />
      </Center>
      <Text size="lg" my="lg">
        You&apos;re being redirected to another page, it may takes up to 10
        seconds.
      </Text>
      <Skeleton height={8} radius="xl" />
      <Skeleton height={8} mt={6} radius="xl" />
      <Skeleton height={8} mt={6} radius="xl" />

      <Text size="xs" mt="xl" mb="sm">
        If you haven&apos;t been redirected in 30 seconds, please click this
        button.
      </Text>
      <Button
        fullWidth
        variant="outline"
        className={classes.button}
        onClick={() =>
          loaded ? setLoaded(false) : !interval.active && interval.start()
        }
        color={loaded ? "teal" : theme.primaryColor}
      >
        <div className={classes.label}>
          {progress !== 0
            ? "Redirecting..."
            : loaded
            ? "Redirected"
            : "Bring me to the new page"}
        </div>
        {progress !== 0 && (
          <Progress
            value={progress}
            className={classes.progress}
            color={theme.fn.rgba(theme.colors[theme.primaryColor][2], 0.35)}
            radius="sm"
          />
        )}
      </Button>
    </Paper>
  );
};

export default Redirect;
