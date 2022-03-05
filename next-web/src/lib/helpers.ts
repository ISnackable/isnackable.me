// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* eslint-disable */
import format from "date-fns/format";
import isFuture from "date-fns/isFuture";
import parseISO from "date-fns/parseISO";

export const filterOutDocsWithoutSlugs = ({ slug }: { slug: string }) => {
  return slug;
};

export const filterOutDocsPublishedInTheFuture = ({
  publishedAt
}: {
  publishedAt: string;
}) => {
  try {
    return !isFuture(parseISO(publishedAt));
  } catch (error) {
    return;
  }
};

export const toPlainText = (blocks: any[]) => {
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
