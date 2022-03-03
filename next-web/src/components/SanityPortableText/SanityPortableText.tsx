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
      value: {
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
      const highlightedLines = value?.highlightedLines?.reduce(
        (a: object, v: number) => ({ ...a, [v]: { color: "blue" } }),
        {}
      );

      const prismLang = loadLanguage(value.language);

      if (!value.filename) {
        return (
          <Prism
            my={8}
            language={prismLang as any}
            withLineNumbers
            highlightLines={highlightedLines}
            copyLabel="Copy code to clipboard"
            styles={styles}
          >
            {value.code}
          </Prism>
        );
      }

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
          >
            {value.code}
          </Prism.Tab>
        </Prism.Tabs>
      );
    },
    figure: ({ value }) => {
      return (
        <Center my={50}>
          <Box
            sx={() => ({
              width: "50%",

              "@media (max-width: 640px)": {
                width: "100%"
              }
            })}
          >
            <SanityNextImage
              // className="half-image"
              image={value}
              alt={value.alt}
              placeholder="blur"
              blurDataURL={value.lqip}
              objectFit="contain"
            />
          </Box>
        </Center>
      );
    },
    externalImage: ({ value }) => (
      <Center my={50}>
        <Image
          radius="md"
          src={value.url}
          alt={value.alt}
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
    internalLink: ({ children, value }: any) => {
      const href = `/blog/${value.slug.current}`;
      return (
        <Link href={href} passHref>
          <Text variant="link" component="a">
            {children}
          </Text>
        </Link>
      );
    },
    link: ({
      children,
      value
    }: {
      children: ReactNode;
      value?: {
        blank: boolean;
        href: string;
      };
    }) => {
      const { blank, href } = value!;
      const rel = !href.startsWith("/") ? "noreferrer noopener" : undefined;
      return (
        <Link href={href} passHref>
          <Text
            variant="link"
            component="a"
            rel={blank ? rel : undefined}
            target={blank ? "_blank" : undefined}
          >
            {children}
          </Text>
        </Link>
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
    h1: ({ children }) => (
      <Title order={1} my="0.67em">
        {children}
      </Title>
    ),
    h2: ({ children }) => (
      <Title order={2} my="0.83em">
        {children}
      </Title>
    ),
    h3: ({ children }) => (
      <Title order={3} my="1em">
        {children}
      </Title>
    ),
    h4: ({ children }) => (
      <Title order={4} my="1.33em">
        {children}
      </Title>
    ),
    h5: ({ children }) => (
      <Title order={5} my="1.67em">
        {children}
      </Title>
    ),
    h6: ({ children }) => (
      <Title order={6} my="2.33em">
        {children}
      </Title>
    ),
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
