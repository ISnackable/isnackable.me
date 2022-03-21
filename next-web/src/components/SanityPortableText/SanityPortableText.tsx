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
import { IconExternalLink, IconLink } from "@tabler/icons";
import SanityNextImage from "@components/SanityNextImage";
import { loadLanguage } from "@lib/prismDeps";
import styles from "./styles.module.css";

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
