import type { NextPage } from "next";
import { Avatar, Center, Container, Text, Title } from "@mantine/core";
import { Giscus } from "@giscus/react";
import SanityNextImage from "@components/SanityNextImage";
import SanityPortableText from "@components/SanityPortableText";
import type { AllSanityPost } from "../../@types/sanity";
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

interface Props {
  post: AllSanityPost;
}

const BlogPost: NextPage<Props> = (props) => {
  const { post } = props;

  return (
    <>
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
              style={{ float: "left" }}
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
            maxWidth: "60rem",
            marginLeft: "auto",
            marginRight: "auto"
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
              theme="dark"
            />
          </section>
        )}
      </Container>
    </>
  );
};

export default BlogPost;
