import type { NextPage } from "next";
import dynamic from "next/dynamic";
import {
  Avatar,
  Center,
  Container,
  Text,
  Title,
  useMantineColorScheme
} from "@mantine/core";
import SanityNextImage from "@components/SanityNextImage";
import { toDateString } from "@lib/helpers";
import { urlFor } from "@lib/sanity";
import {
  giscusRepo,
  giscusRepoId,
  giscusCategory,
  giscusCategoryId,
  giscusMapping,
  giscusReactionsEnabled,
  giscusEmitMetadata
} from "@lib/config";
import type { AllSanityPost } from "../../@types/sanity";

const SanityPortableText = dynamic(
  () => import("@components/SanityPortableText"),
  { ssr: false, loading: () => <p>loading...</p> }
);
const Giscus = dynamic(async () => (await import("@giscus/react")).Giscus, {
  ssr: false,
  loading: () => <p>loading...</p>
});
interface Props {
  post: AllSanityPost;
}

const BlogPost: NextPage<Props> = (props) => {
  const { post } = props;

  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Container size="xl" my="6rem">
      <section>
        <Title order={1}>{post.title}</Title>
        <Text size="xl">{post.description}</Text>
        <div style={{ margin: "2rem 0px" }}>
          <Avatar
            src={urlFor(post.author.mainImage).auto("format").url()}
            alt={post.author.name}
            radius="xl"
            size="lg"
            mr="1rem"
            sx={() => ({ float: "left" })}
          />

          <div>
            <Text weight={600} size="md">
              {post.author.name}
            </Text>
            <Text size="md">{toDateString(post.publishedAt)}</Text>
          </div>
        </div>
        <Center>
          <SanityNextImage
            image={post.mainImage}
            height={200}
            className="rounded-lg object-cover"
            alt={post.mainImage?.alt ?? `${post.title} main image`}
          />
        </Center>
      </section>
      <section
        style={{
          marginTop: 32,
          maxWidth: "55rem",
          marginLeft: "auto",
          marginRight: "auto",
          wordWrap: "break-word"
        }}
      >
        {post.body.length > 0 && (
          <SanityPortableText value={post.body} onMissingComponent={false} />
        )}
      </section>
      {giscusRepo && giscusRepoId && giscusCategoryId && (
        <section
          style={{
            marginTop: 32
          }}
        >
          <Giscus
            repo={giscusRepo}
            repoId={giscusRepoId}
            category={giscusCategory}
            categoryId={giscusCategoryId}
            mapping={giscusMapping}
            reactionsEnabled={giscusReactionsEnabled}
            emitMetadata={giscusEmitMetadata}
            theme={dark ? "dark" : "light"}
          />
        </section>
      )}
    </Container>
  );
};

export default BlogPost;
