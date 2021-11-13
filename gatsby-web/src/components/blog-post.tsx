// import { format, differenceInDays } from "date-fns";
import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { Giscus } from "@giscus/react";
import PortableText from "./portableText";
import * as styles from "./blog-post.module.css";
import { toDateString } from "../lib/helpers";

function BlogPost(props) {
  const {
    _rawBody,
    author,
    // categories,
    title,
    description,
    mainImage,
    publishedAt,
  } = props;

  return (
    <article>
      <section>
        <div className="container w-full px-5 py-24 mx-auto lg:px-32">
          <h1 className={styles.title}>{title}</h1>
          <p>{description}</p>
          <div className="flex flex-col w-full mx-autoprose text-left prose-md mb-8">
            <div className="h-full flex items-center my-4 rounded-lg">
              <GatsbyImage
                alt="Author logo"
                className="w-16 h-16 object-cover object-center flex-shrink-0 rounded-full mr-4"
                image={author.mainImage?.asset?.gatsbyImageData}
              />
              <div className="float-left">
                <h2 className="text-white title-font font-medium">
                  {author.name}
                </h2>
                <h5 className={styles.publishedAt}>
                  {toDateString(publishedAt)}
                </h5>
              </div>
            </div>
            <GatsbyImage
              alt={mainImage?.alt ?? `${title} main image`}
              className={`object-cover object-center ${styles.mainImage}`}
              image={mainImage.asset?.gatsbyImageData}
            />
            <section className={styles.mainContent}>
              {_rawBody && <PortableText blocks={_rawBody} />}
            </section>
          </div>
          <Giscus
            repo="ISnackable/isnackable.github.io"
            repoId="MDEwOlJlcG9zaXRvcnkzNTEwNjU5NzY="
            category="Announcements"
            categoryId="DIC_kwDOFOzXeM4B_0gD"
            mapping="pathname"
            reactionsEnabled="1"
            emitMetadata="0"
            theme="dark"
          />
        </div>
      </section>
    </article>
  );
}

export default BlogPost;
