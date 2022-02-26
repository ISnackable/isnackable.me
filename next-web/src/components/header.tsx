import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mantine/hooks";
import useScrollListener from "@hooks/useScrollListener";
import style from "./header.module.css";
import Icon from "../../public/icon.png";

const MINIMUM_SCROLL = 80;

const Header = () => {
  const _isMounted = useRef(true);
  const [visible, setVisible] = useState(false);
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
      className={style.navbar}
      style={{
        WebkitTransform: visible
          ? "translateY(108px) translateZ(100px)"
          : undefined,
        transform: visible ? "translateY(108px) translateZ(100px)" : undefined
      }}
    >
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
        <Image src={Icon} layout="fixed" height={64} width={64} alt="Logo" />
      </div>
      <Link href="/notes" passHref>
        <a
          className={style.tab}
          aria-current={activeLink("/notes", router.pathname)}
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
            <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
            <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />
            <polyline points="12 8 7 3 3 7 8 12" />
            <line x1="7" y1="8" x2="5.5" y2="9.5" />
            <polyline points="16 12 21 17 17 21 12 16" />
            <line x1="16" y1="17" x2="14.5" y2="18.5" />
          </svg>
          Notes
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
      <div className={style.switch}></div>
    </nav>
  );
};

export default Header;
