/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Image as SanityImage } from "@sanity/types";
import React from "react";
import sanityClient from "part:@sanity/base/client";
import imageUrlBuilder from "@sanity/image-url";

import css from "./ogImageLayout.module.css";

const client = sanityClient.withConfig({ apiVersion: `2021-05-19` });
const imageBuilder = imageUrlBuilder(client);

interface LayoutProps {
  title?: string;
  quote?: string;
  mainImage: SanityImage;
}

interface Props {
  image: SanityImage;
  width?: number;
  className?: string;
}

// You might want to change this field
const svgPic: SanityImage = {
  _type: "image",
  asset: {
    _type: "reference",
    _ref: "image-77b213fb947597b5f9720a42f0b4220cec385e40-1200x630-png",
  },
};

const Image: React.FC<Props> = React.forwardRef((props) => {
  if (!props.image?.asset?._ref) {
    return null;
  }
  const src = imageBuilder
    .image(props.image)
    .width(props.width || 500)
    .url();

  if (!src) {
    return null;
  }

  return <img src={src} alt="" className={props.className || ""} />;
});

const Component: React.FC<LayoutProps> = React.forwardRef(
  ({ title, quote, mainImage }) => {
    return (
      <div className={css.root}>
        <div>
          <h1 className={css.title}>{title || "Title missing"}</h1>
          {quote && <blockquote className={css.p}>{quote}</blockquote>}
        </div>
        <div className={css.logo}>
          {mainImage && <Image image={mainImage} />}
        </div>
        <Image image={svgPic} className={css.bg} />
      </div>
    );
  }
);

const ogImage = {
  name: "ogImage",
  title: "ogImage (Twitter)",
  component: Component,
  prepare: (document) => {
    return {
      title: document.title || document.seoTitle,
      quote: document.mainQuote,
      mainImage: document.mainImage,
    };
  },
  fields: [
    {
      title: "Post title",
      name: "title",
      type: "string",
    },
    {
      title: "Main quote",
      name: "quote",
      type: "text",
    },
  ],
  dimensions: {
    width: 1200,
    height: 630,
  },
};

export default ogImage;
