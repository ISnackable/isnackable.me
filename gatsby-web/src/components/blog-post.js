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
    categories,
    title,
    description,
    mainImage,
    publishedAt,
  } = props;

  return (
    <article className={styles.root}>
      <div className="container w-full px-5 py-24 mx-auto lg:px-32">
        <h1 className={styles.title}>{title}</h1>
        <h5 className={styles.publishedAt}>{toDateString(publishedAt)}</h5>
        <span>{categories[0]?.title}</span>
        <div className="flex flex-col w-full mx-auto mb-2 prose text-left prose-md mt-5">
          <GatsbyImage
            alt="content"
            className={`object-cover object-center ${styles.mainImage}`}
            image={mainImage.asset.gatsbyImageData}
          />
          <div className="text-center sm:pr-8 sm:py-8">
            <div className="h-full flex items-center p-4 rounded-lg">
              <GatsbyImage
                alt="content"
                className="w-16 h-16 object-cover object-center flex-shrink-0 rounded-full mr-4"
                image={author.image.asset.gatsbyImageData}
              />
              <div className="flex-grow">
                <h2 className="text-white title-font font-medium">
                  {author.name}
                </h2>
                <p className="text-gray-600">Author</p>
              </div>
            </div>
          </div>
          <div>{description}</div>
          {_rawBody && <PortableText blocks={_rawBody} />}
        </div>
      </div>
    </article>
  );
}

export default BlogPost;
