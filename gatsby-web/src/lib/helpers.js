import { format, isFuture, parseISO } from "date-fns";

export const cn = (...args) => {
  return args.filter(Boolean).join(" ");
};

export const mapEdgesToNodes = (data) => {
  if (!data?.edges) return [];
  return data.edges.map((edge) => edge.node);
};

export const filterOutDocsWithoutSlugs = ({ slug }) => {
  return (slug || {}).current;
};

export const filterOutDocsPublishedInTheFuture = ({ publishedAt }) => {
  try {
    return !isFuture(parseISO(publishedAt));
  } catch (error) {
    return;
  }
};

export const getBlogUrl = (slug) => {
  return `/blog/${slug.current || slug}/`;
};

export const buildImageObj = (source = { asset: {} }) => {
  const imageObj = {
    asset: { _ref: source.asset._ref || source.asset._id },
  };

  if (source.crop) imageObj.crop = source.crop;
  if (source.hotspot) imageObj.hotspot = source.hotspot;

  return imageObj;
};

export const toPlainText = (blocks) => {
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block?._type !== "block" || !block?.children) {
        return "";
      }
      return block?.children.map((child) => child?.text).join("");
    })
    .join("\n\n");
};

export const toDateString = (iso) => {
  if (!iso) {
    return "";
  }
  return format(parseISO(iso), "EEEE, dd MMMM yyyy");
};
