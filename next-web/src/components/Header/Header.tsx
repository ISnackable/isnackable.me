import { useRef, useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ActionIcon,
  Button,
  Center,
  Drawer,
  Divider,
  Kbd,
  Title,
  Text,
  useMantineColorScheme
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import useScrollListener from "@hooks/useScrollListener";
import { title, description, socialUsername } from "@lib/config";
import style from "./header.module.css";
import Icon from "../../../public/icon.png";

const MINIMUM_SCROLL = 80;

const Header: NextPage = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const _isMounted = useRef(true);
  const [visible, setVisible] = useState(false);
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const router = useRouter();

  const activeLink = (url: string, pathname: string) =>
    pathname === url ? "page" : undefined;

  useEffect(() => {
    return () => {
      _isMounted.current = false;
    };
  }, []);

  useScrollListener((callbackData) => {
    const { previousScrollTop, currentScrollTop } = callbackData;
    const isScrolledDown = previousScrollTop < currentScrollTop;
    const isMinimumScrolled = currentScrollTop > MINIMUM_SCROLL;
    const isBottom =
      Math.ceil(window.innerHeight + currentScrollTop) >=
      document.documentElement.scrollHeight;

    if (_isMounted.current)
      setVisible(isScrolledDown && isMinimumScrolled && isMobile && !isBottom);
  });

  return (
    <nav
      className={`${style.navbar}${!dark ? " white" : ""}`}
      style={{
        WebkitTransform: visible
          ? "translateY(108px) translateZ(100px)"
          : undefined,
        transform: visible ? "translateY(108px) translateZ(100px)" : undefined
      }}
    >
      <Drawer
        hideCloseButton
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        position="bottom"
        size="md"
        aria-labelledby="drawer"
        aria-describedby="drawer-body"
      >
        <Center my="lg">
          <Title order={2}>{socialUsername}</Title>
        </Center>
        <Center>
          <Button
            variant="outline"
            onClick={() => toggleColorScheme()}
            leftIcon={
              <span
                style={{
                  minWidth: "28px",
                  minHeight: "28px",
                  width: "28px",
                  height: "28px",
                  color: dark ? "#ffd43b" : "#1c7ed6"
                }}
              >
                {dark ? (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 9a3 3 0 0 0 0 6v-6z" />
                    <path d="M6 6h3.5l2.5 -2.5l2.5 2.5h3.5v3.5l2.5 2.5l-2.5 2.5v3.5h-3.5l-2.5 2.5l-2.5 -2.5h-3.5v-3.5l-2.5 -2.5l2.5 -2.5z" />
                  </svg>
                ) : (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                    <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                    <path d="M19 11h2m-1 -1v2" />
                  </svg>
                )}
              </span>
            }
          >
            Toggle Theme
          </Button>
        </Center>
        <Center mb={24}>
          <Title
            mt="xl"
            align="center"
            order={3}
          >{`${title} - ${description}`}</Title>
        </Center>
        <Divider />
        <Center mt="xl">
          <Text align="center">
            Tip: Use <Kbd>Ctrl</Kbd> + <Kbd>J</Kbd> to quickly toggle between
            light and dark theme.
          </Text>
        </Center>
      </Drawer>
      <Link href="/" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/", router.pathname)}
        >
          <svg
            className={style.icon}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <g stroke="currentColor" fill="none" fillRule="evenodd">
              <circle cx="12" cy="9" r="2"></circle>
              <circle cx="12" cy="12" r="8"></circle>
              <path
                d="M6 17a3 3 0 013-3h6a3 3 0 013 3h0"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </g>
          </svg>
          About
        </a>
      </Link>
      <Link href="/projects" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/projects", router.pathname)}
        >
          <svg
            className={style.icon}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
              fillRule="evenodd"
            />
            <path d="M12 3a9 9 0 0 1 3.618 17.243l-2.193 -5.602a3 3 0 1 0 -2.849 0l-2.193 5.603a9 9 0 0 1 3.617 -17.244z" />
          </svg>
          Projects
        </a>
      </Link>
      <div className={style.logo}>
        <Image
          onClick={() => setOpened(true)}
          src={Icon}
          layout="fixed"
          height={64}
          width={64}
          alt="Logo"
          priority
        />
      </div>
      <Link href="/files" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/files", router.pathname)}
        >
          <svg
            className={style.icon}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12" />
          </svg>
          Files
        </a>
      </Link>
      <Link href="/blog" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/blog", router.pathname)}
        >
          <svg
            className={style.icon}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18" />
            <line x1="13" y1="8" x2="15" y2="8" />
            <line x1="13" y1="12" x2="15" y2="12" />
          </svg>
          Blog
        </a>
      </Link>
      <div className={style.switch}>
        <ActionIcon
          variant="transparent"
          color={dark ? "yellow" : "blue"}
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {dark ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 9a3 3 0 0 0 0 6v-6z" />
              <path d="M6 6h3.5l2.5 -2.5l2.5 2.5h3.5v3.5l2.5 2.5l-2.5 2.5v3.5h-3.5l-2.5 2.5l-2.5 -2.5h-3.5v-3.5l-2.5 -2.5l2.5 -2.5z" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
              <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
              <path d="M19 11h2m-1 -1v2" />
            </svg>
          )}
        </ActionIcon>
      </div>
    </nav>
  );
};

export default Header;
