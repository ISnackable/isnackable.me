/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import dynamic from "next/dynamic";
import { toPlainText } from "@portabletext/react";
import SEO from "@components/SEO";
import BlogPost from "@components/BlogPost";
import PreviewBar from "@components/PreviewBar";
import {
  getAllPosts,
  getSinglePost,
  filterDataToSingleItem
} from "@lib/sanity.server";
import { urlFor, usePreviewSubscription } from "@lib/sanity";
import generateSocialImage from "@lib/generateSocialImage";
import { cloudName, imagePublicID } from "@lib/config";
import type { AllSanityPost } from "../../@types/sanity";

const TableOfContent = dynamic(() => import("@components/TableOfContent"), {
  ssr: false,
  loading: () => <p>loading...</p>
});

interface Props {
  data: Data;
  preview: boolean;
}

interface Data {
  post: AllSanityPost[];
  query: string;
  queryParams: { slug: string };
}

const BlogPostPage: NextPage<Props> = ({ data, preview }) => {
  const slug = data?.queryParams?.slug;
  const { data: previewPost } = usePreviewSubscription(data?.query, {
    params: data?.queryParams ?? {},
    initialData: data?.post,
    enabled: preview
  });

  const post = filterDataToSingleItem(previewPost, preview);
  const socialImage = generateSocialImage({
    title: post?.title,
    underlayImage: post?.mainImage ? urlFor(post?.mainImage).url() : "",
    cloudName: cloudName!,
    imagePublicID: imagePublicID!
  });

  return (
    <>
      {preview && <PreviewBar href={`/api/exit-preview?slug=/blog/${slug}`} />}

      <SEO
        title={post?.title ? post.title : ""}
        description={
          post?.body ? toPlainText(post.body).slice(0, 200) : undefined
        }
        image={
          post?.mainImage && socialImage
            ? socialImage
            : urlFor(post.mainImage).url()
        }
        article={true}
      />
      <article>
        {post && (
          <>
            <TableOfContent post={post} />
            <BlogPost post={post} />
          </>
        )}
      </article>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false
}) => {
  const slug = params?.slug as string;
  const data = await getSinglePost(preview, slug);

  return { props: { data, preview }, revalidate: 60 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  const slugs = posts.map((post) => ({
    params: { slug: post.slug }
  }));

  return { paths: slugs, fallback: false };
};

export default BlogPostPage;
