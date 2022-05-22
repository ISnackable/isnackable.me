/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
import {
  IconBrandOpenSource,
  IconMoonStars,
  IconBrightnessHalf,
  IconCloud,
  IconNotebook
} from "@tabler/icons";
import useScrollListener from "@hooks/useScrollListener";
import { title, description, socialUsername } from "@lib/config";
import style from "./header.module.css";
import Icon from "../../../public/icon.png";

const MINIMUM_SCROLL = 80;

const Header: NextPage = (): JSX.Element => {
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
        withCloseButton={false}
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
              <span>
                {dark ? (
                  <IconBrightnessHalf color="#ffd43b" stroke={1.5} size={28} />
                ) : (
                  <IconMoonStars color="#1c7ed6" stroke={1.5} size={28} />
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
          <IconBrandOpenSource className={style.icon} stroke={1.5} />
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
          <IconCloud className={style.icon} stroke={1.5} />
          Files
        </a>
      </Link>
      <Link href="/blog" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/blog", router.pathname)}
        >
          <IconNotebook className={style.icon} stroke={1.5} />
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
            <IconBrightnessHalf stroke={1.5} size={28} />
          ) : (
            <IconMoonStars stroke={1.5} size={28} />
          )}
        </ActionIcon>
      </div>
    </nav>
  );
};

export default Header;
