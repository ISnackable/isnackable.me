import { format, isFuture, parseISO } from "date-fns";

export const cn = (...args: any) => {
  return args.filter(Boolean).join(" ");
};

export const mapEdgesToNodes = (data: any) => {
  if (!data?.edges) return [];
  return data.edges.map((edge: any) => edge.node);
};

export const filterOutDocsWithoutSlugs = ({ slug }: any) => {
  return (slug || {}).current;
};

export const filterOutDocsPublishedInTheFuture = ({
  publishedAt,
}: {
  publishedAt: string;
}) => {
  try {
    return !isFuture(parseISO(publishedAt));
  } catch (error) {
    return;
  }
};

export const getBlogUrl = (slug: any) => {
  return `/blog/${slug.current || slug}/`;
};

export const buildImageObj = (source: any = { asset: {} }) => {
  const imageObj: any = {
    asset: { _ref: source.asset._ref || source.asset._id },
  };

  if (source.crop) imageObj.crop = source.crop;
  if (source.hotspot) imageObj.hotspot = source.hotspot;

  return imageObj;
};

export const toPlainText = (blocks: Array<any>) => {
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block?._type !== "block" || !block?.children) {
        return "";
      }
      return block?.children.map((child: any) => child?.text).join("");
    })
    .join("\n\n");
};

export const toDateString = (iso: string) => {
  if (!iso) {
    return "";
  }
  return format(parseISO(iso), "EEEE, dd MMMM yyyy");
};
