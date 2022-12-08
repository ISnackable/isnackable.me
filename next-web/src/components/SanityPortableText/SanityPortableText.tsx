/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Link from "next/link";
import type {
  PortableTextReactComponents,
  PortableTextProps
} from "@portabletext/react";
import {
  Blockquote,
  Center,
  Code,
  Image,
  Paper,
  Mark,
  Text,
  Title
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { PortableText } from "@portabletext/react";
import { IconExternalLink, IconLink } from "@tabler/icons";
import Zoom from "react-medium-image-zoom";
import SanityNextImage from "@components/SanityNextImage";
import { loadLanguage } from "@lib/prismDeps";
import styles from "./styles.module.css";
import "react-medium-image-zoom/dist/styles.css";

// const deleted = { color: "red", label: "-" };
// const added = { color: "green", label: "+" };

// const codeDiffParser = (code: string) => {
//   const codeLines = code.split("\\n")

// }

const myPortableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    authorReference: ({ value }) => {
      if (value && value.author && value.author.name) {
        return <span>{value.author.name}</span>;
      }
      return <></>;
    },
    code: ({
      value
    }: {
      value?: {
        code: string;
        language: string;
        filename: string;
        highlightedLines: [number];
      };
    }) => {
      const styles = {
        line: { fontSize: 15 },
        lineNumber: { fontSize: 15 }
      };
      const highlightedLines = value?.highlightedLines
        ? value?.highlightedLines?.reduce(
            (a: object, v: number) => ({ ...a, [v]: { color: "blue" } }),
            {}
          )
        : undefined;

      const prismLang = value?.language
        ? loadLanguage(value.language)
        : "plain";

      const code = value?.code ? value.code : "";

      if (value?.filename) {
        return (
          <Prism.Tabs
            defaultValue={value.filename}
            my={8}
            styles={{
              tab: { fontSize: 15 },
              ...styles
            }}
          >
            <Prism.TabsList>
              <Prism.Tab value={value.filename} icon="📁">
                {value.filename}
              </Prism.Tab>
            </Prism.TabsList>

            <Prism.Panel
              value={value.filename}
              language={prismLang as any}
              withLineNumbers
              highlightLines={highlightedLines}
              copyLabel="Copy code to clipboard"
              // scrollAreaComponent="div" // default scrollArea broken on preact
            >
              {code}
            </Prism.Panel>
          </Prism.Tabs>
        );
      }

      return (
        <Prism
          my={8}
          language={prismLang as any}
          withLineNumbers
          highlightLines={highlightedLines}
          copyLabel="Copy code to clipboard"
          styles={styles}
          // scrollAreaComponent="div" // default scrollArea broken on preact
        >
          {code}
        </Prism>
      );
    },
    figure: ({ value }) => {
      return (
        <Center my={50}>
          <Paper
            component="figure"
            sx={() => ({
              position: "relative",
              margin: "0rem 8rem",

              "@media (max-width: 900px)": {
                margin: 0
              }
            })}
          >
            <Zoom zoomMargin={20}>
              <SanityNextImage
                image={value}
                alt={value.alt ?? "default alt text"}
                // placeholder="blur"
                blurDataURL={value.lqip}
                width={550}
                height={430}
                style={{ objectFit: "contain" }}
              />
            </Zoom>
            {value?.caption && (
              <Text align="center" component="figcaption">
                {value?.caption}
              </Text>
            )}
          </Paper>
        </Center>
      );
    },
    externalImage: ({ value }) => (
      <Center my={50}>
        <Paper
          sx={() => ({
            margin: "0rem 8rem",

            "@media (max-width: 900px)": {
              margin: 0
            }
          })}
        >
          <Zoom zoomMargin={20}>
            <Image
              radius="md"
              src={value?.url}
              alt={value?.alt ?? "default alt text"}
              caption={value?.caption}
              withPlaceholder
              width={550}
              height={430}
              style={{ objectFit: "contain" }}
            />
          </Zoom>
        </Paper>
      </Center>
    ),
    break: () => <br />
  },

  marks: {
    em: ({ children }) => (
      <Text weight={300} component="em">
        {children}
      </Text>
    ),
    strong: ({ children }) => (
      <Text weight={700} component="span">
        {children}
      </Text>
    ),
    highlight: ({ children }) => <Mark>{children}</Mark>,
    internalLink: ({ children, value }) => {
      const href = value?.slug ? `/blog/${value?.slug?.current}` : "/";
      return (
        <Link href={href}>
          <Text variant="link" component="span">
            {children}
          </Text>
        </Link>
      );
    },
    link: ({ children, value }) => {
      const { blank, href } = value;
      return (
        <>
          <Link
            href={href ?? ""}
            rel={blank ? "noreferrer noopener" : undefined}
            target={blank ? "_blank" : undefined}
          >
            <Text variant="link" component="span">
              {children}
            </Text>
          </Link>
          <IconExternalLink stroke={1.5} size={14} color="#1c7ed6" />
        </>
      );
    },
    code: ({ children }) => (
      <Code
        sx={() => ({
          fontSize: 18,

          "@media (max-width: 900px)": {
            fontSize: 16
          }
        })}
      >
        {children}
      </Code>
    )
  },

  block: {
    normal: ({ children }) => {
      return (
        <Text
          sx={() => ({
            fontSize: 18,

            "@media (max-width: 900px)": {
              fontSize: 16
            }
          })}
          my={16}
        >
          {children}
        </Text>
      );
    },
    h1: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={1}
          my="0.67em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    h2: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={2}
          my="0.83em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    h3: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={3}
          my="1em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    h4: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={4}
          my="1.33em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    h5: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={5}
          my="1.67em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    h6: ({ value, children }) => {
      const headingId = `h-${value._key}`;
      return (
        <Title
          order={6}
          my="2.33em"
          className={`blog-h ${styles.heading}`}
          id={headingId}
          data-id={headingId}
        >
          {children}{" "}
          <a href={`#${headingId}`} aria-hidden="true">
            <IconLink size={18} />
          </a>
        </Title>
      );
    },
    blockquote: ({ children }) => (
      <Blockquote className="border-l-purple-500">{children}</Blockquote>
    )
  },

  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>
  },

  listItem: {
    bullet: ({ children }) => <li>{children}</li>
  }
};

const SanityPortableText: NextPage<PortableTextProps> = (props) => {
  return <PortableText components={myPortableTextComponents} {...props} />;
};

export default SanityPortableText;
