// import { format, differenceInDays } from "date-fns";
import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
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
    <article className={styles.root}>
      <section>
        <div className="container w-full px-5 py-24 mx-auto lg:px-32">
          <h1 className={styles.title}>{title}</h1>
          <p>{description}</p>
          <div className="flex flex-col w-full mx-autoprose text-left prose-md">
            <div className="h-full flex items-center my-4 rounded-lg">
              <GatsbyImage
                alt="content"
                className="w-16 h-16 object-cover object-center flex-shrink-0 rounded-full mr-4"
                image={author.image.asset.gatsbyImageData}
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
              alt="content"
              className={`object-cover object-center ${styles.mainImage}`}
              image={mainImage.asset.gatsbyImageData}
            />
            <section className={styles.mainContent}>
              {_rawBody && <PortableText blocks={_rawBody} />}
            </section>
          </div>
        </div>
      </section>
    </article>
  );
}

export default BlogPost;
