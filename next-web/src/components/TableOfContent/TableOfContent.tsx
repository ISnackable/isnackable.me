/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import type { AllSanityPost, Body } from "../../@types/sanity";
import { useEffect, useState } from "react";
import throttle from "lodash/throttle";
import { createStyles, Box, Text, Group } from "@mantine/core";
import { IconListSearch } from "@tabler/icons";
import styles from "./tableofcontent.module.css";

interface Props {
  post: AllSanityPost;
}

interface Headings {
  _key: string;
  title: string;
  order: number;
}

const throttleMs = 100;

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    display: "block",
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    lineHeight: 1.2,
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.xs,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    borderLeft: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0]
    }
  },

  linkActive: {
    fontWeight: 500,
    borderLeftColor:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 6 : 7],
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 2 : 7],

    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0]
    }
  }
}));

const getHeadings = (blocks: Body[]) => {
  const headings: Headings[] = [];

  blocks.forEach((block) => {
    const { _key, children, style } = block;
    const title = children !== undefined ? children[0].text : "";

    if (style === "h1") {
      headings.push({ _key, title, order: 1 });
    } else if (style === "h2") {
      headings.push({ _key, title, order: 2 });
    } else if (style === "h3") {
      headings.push({ _key, title, order: 3 });
    }
  });

  return headings;
};

const TableOfContent: NextPage<Props> = (props) => {
  const { post } = props;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const links = getHeadings(post.body);
  const { classes, cx } = useStyles();

  const items = links.map((item) => (
    <Box<"a">
      component="a"
      href={`#h-${item._key}`}
      onClick={(event) => {
        event.preventDefault();
        document.querySelector(`#h-${item._key}`)!.scrollIntoView({
          behavior: "smooth"
        });
      }}
      key={`#h-${item._key}`}
      className={cx(classes.link, {
        [classes.linkActive]: activeSection === `h-${item._key}`
      })}
      sx={(theme) => ({ paddingLeft: item.order * theme.spacing.md })}
    >
      {item.title}
    </Box>
  ));

  const actionSectionScrollSpy = throttle(() => {
    const sections = document.getElementsByClassName("blog-h");

    let prevBBox: DOMRect | null = null;
    let currentSectionId = activeSection;

    for (let i = 0; i < sections.length; ++i) {
      const section = sections[i];
      if (!section || !(section instanceof Element)) continue;

      if (!currentSectionId) {
        currentSectionId = section.getAttribute("data-id");
      }

      const bbox = section.getBoundingClientRect();
      const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0;
      const offset = Math.max(150, prevHeight / 4);

      // GetBoundingClientRect returns values relative to viewport
      if (bbox.top - offset < 0) {
        currentSectionId = section.getAttribute("data-id");

        prevBBox = bbox;
        continue;
      }

      // No need to continue loop, if last element has been detected
      break;
    }

    setActiveSection(currentSectionId);
  }, throttleMs);

  useEffect(() => {
    window.addEventListener("scroll", actionSectionScrollSpy);

    actionSectionScrollSpy();

    return () => {
      window.removeEventListener("scroll", actionSectionScrollSpy);
    };
  }, [actionSectionScrollSpy]);

  return (
    <aside className={styles.toc}>
      <Group mb="md">
        <IconListSearch size={18} />
        <Text>Table of contents</Text>
      </Group>

      <nav aria-label="Table of contents">{items}</nav>
    </aside>
  );
};

export default TableOfContent;
