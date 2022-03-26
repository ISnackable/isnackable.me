/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Link from "next/link";
import { ActionIcon, createStyles, Group } from "@mantine/core";
import { IconBrandLinkedin, IconBrandGithub } from "@tabler/icons";
import { socialUsername } from "@lib/config";
import styles from "./footer.module.css";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: "1rem",
    marginLeft: "4rem",
    marginRight: "1rem",

    "@media (max-width: 899px)": {
      marginLeft: "1rem",
      marginRight: "1rem",
      marginBottom: "68px"
    }
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing.md}px ${theme.spacing.md}px`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column-reverse"
    }
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg
    }
  }
}));

const links = [
  {
    link: "/blog",
    label: "Blog"
  },
  {
    link: "/feed",
    label: "RSS"
  },
  {
    link: "/privacy",
    label: "Privacy"
  },
  {
    link: `/stats`,
    label: "Stats"
  }
];

const Footer: NextPage = () => {
  const { classes } = useStyles();
  const items = links.map((link) => (
    <Link key={link.label} href={link.link} passHref>
      <a className={styles.link} href={link.link}>
        {link.label}
      </a>
    </Link>
  ));

  return (
    <footer className={classes.footer}>
      <div className={classes.inner}>
        <Group className={classes.links}>{items}</Group>

        <Group spacing={0} position="right" noWrap>
          <ActionIcon
            component="a"
            href={`https://github.com/${socialUsername}`}
            size="lg"
          >
            <IconBrandGithub size={20} />
          </ActionIcon>
          <ActionIcon
            component="a"
            href={`https://www.linkedin.com/in/${socialUsername}`}
            size="lg"
          >
            <IconBrandLinkedin size={20} />
          </ActionIcon>
          <ActionIcon
            component="a"
            href={`https://hackerone.com/${socialUsername}`}
            size="lg"
          >
            <svg width="20" height="20">
              <g>
                <path
                  fill="currentColor"
                  d="m4.30772,0.63834c-0.45494,0.03692 -1.04637,0.18462 -1.13736,0.5908l0,13.55147c0.09099,0.33232 0.50044,0.55387 0.90989,0.5908l0.63692,0c0.40945,-0.07385 0.90989,-0.25847 0.95538,-0.62772a5309.55213,4309.44273 0 0 0 0,-13.51455c-0.13648,-0.40617 -0.68241,-0.55387 -1.13736,-0.5908l-0.22747,0zm7.2336,5.3172c-0.31846,0.03692 -0.59143,0.07385 -0.7734,0.18462l-3.36658,1.73547c-0.18198,0.11077 -0.22747,0.2954 -0.22747,0.4431c0.09099,0.4431 0.36395,0.77542 0.7734,0.99697c0.31846,0.1477 0.8189,0.25847 1.13736,0.07385l1.31934,-0.70157l0,6.09262c0.13648,0.36925 0.54593,0.55387 0.95538,0.62772l0.45494,0c0.40945,-0.07385 0.86439,-0.18462 1.04637,-0.51695l0.04549,-0.11077a841.37212,682.89092 0 0 0 0,-8.19735c-0.04549,-0.4431 -0.72791,-0.5908 -1.18285,-0.62772l-0.18198,0z"
                />
              </g>
            </svg>
          </ActionIcon>
        </Group>
      </div>
    </footer>
  );
};

export default Footer;
