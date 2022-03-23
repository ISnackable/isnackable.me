/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import React from "react";
import Link from "next/link";
import { Divider, Grid, Text } from "@mantine/core";
import SanityNextImage from "@components/SanityNextImage";
import { toDateString } from "@lib/helpers";
import type { AllSanityPost } from "../../@types/sanity";

interface Props {
  state: {
    filteredData: AllSanityPost[];
    query: string;
  };
}

const Blog: NextPage<Props> = (props) => {
  const { state } = props;

  return (
    <>
      {state.filteredData.map((post) => {
        return (
          <React.Fragment key={post._id}>
            <Grid my={32} align="center">
              <Grid.Col xs={2}>
                <SanityNextImage
                  image={post.mainImage}
                  className="rounded-lg"
                  alt={post.mainImage?.alt ?? `${post.title} main image`}
                  layout="responsive"
                  placeholder={post.mainImage?.lqip ? "blur" : undefined}
                  blurDataURL={post.mainImage?.lqip}
                  sizes="(min-width: 282px) 282px, 100vw"
                />
              </Grid.Col>
              <Grid.Col xs={10}>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    query: { slug: post.slug }
                  }}
                  passHref
                >
                  <a>
                    <Text size="sm">{toDateString(post.publishedAt)}</Text>
                    <Text
                      size="xl"
                      weight={700}
                      sx={(theme) => ({
                        "&:hover": {
                          color: theme.colors.gray[4]
                        }
                      })}
                    >
                      {post.title}
                    </Text>
                    <Text size="md">{post.description}</Text>
                  </a>
                </Link>
              </Grid.Col>
            </Grid>
            <Divider variant="dotted" />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default Blog;
