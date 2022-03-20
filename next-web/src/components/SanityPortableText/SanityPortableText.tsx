import type { ReactNode } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import type {
  PortableTextReactComponents,
  PortableTextProps
} from "@portabletext/react";
import {
  Blockquote,
  Box,
  Center,
  Code,
  Image,
  Mark,
  Text,
  Title
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { PortableText } from "@portabletext/react";
import SanityNextImage from "@components/SanityNextImage";
import { loadLanguage } from "@lib/prismDeps";
import styles from "./styles.module.css";

// const deleted = { color: "red", label: "-" };
// const added = { color: "green", label: "+" };

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
            my={8}
            styles={{
              tab: { fontSize: 15 },
              tabActive: { fontSize: 15 },
              ...styles
            }}
          >
            <Prism.Tab
              label={value.filename}
              icon="📁"
              language={prismLang as any}
              withLineNumbers
              highlightLines={highlightedLines}
              copyLabel="Copy code to clipboard"
              scrollAreaComponent="div" // default scrollArea broken on preact
            >
              {code}
            </Prism.Tab>
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
          scrollAreaComponent="div" // default scrollArea broken on preact
        >
          {code}
        </Prism>
      );
    },
    figure: ({ value }) => {
      return (
        <Center my={50}>
          <Box
            mx={0}
            component="figure"
            sx={() => ({
              width: "50%",

              "@media (max-width: 640px)": {
                width: "100%"
              }
            })}
          >
            <SanityNextImage
              image={value}
              alt={value.alt ?? "default alt text"}
              placeholder="blur"
              blurDataURL={value.lqip}
              objectFit="contain"
            />
            {value?.caption && (
              <Text align="center" component="figcaption">
                {value?.caption}
              </Text>
            )}
          </Box>
        </Center>
      );
    },
    externalImage: ({ value }) => (
      <Center my={50}>
        <Image
          radius="md"
          src={value?.url}
          alt={value?.alt ?? "default alt text"}
          caption={value?.caption}
          withPlaceholder
          sx={() => ({
            width: "50%",

            "@media (max-width: 640px)": {
              width: "100%"
            }
          })}
        />
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
        <Link href={href} passHref>
          <Text variant="link" component="a">
            {children}
          </Text>
        </Link>
      );
    },
    link: ({ children, value }) => {
      const { blank, href } = value;
      return (
        <>
          <Link href={href ?? ""} passHref>
            <Text
              variant="link"
              component="a"
              rel={blank ? "noreferrer noopener" : undefined}
              target={blank ? "_blank" : undefined}
            >
              {children}
            </Text>
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 25 25"
            strokeWidth="1.5"
            stroke="#1c7ed6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5" />
            <line x1="10" y1="14" x2="20" y2="4" />
            <polyline points="15 4 20 4 20 9" />
          </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              ></path>
            </svg>
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
