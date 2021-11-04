const env = process.env.NODE_ENV || "development";

export default function resolveProductionUrl(document) {
  const baseUrl =
    env === "development" ? "http://localhost:8000" : "https://isnackable.me/";

  switch (document._type) {
    case "post":
      return `${baseUrl}/blog/${document?.slug?.current}`;
    case "note":
      return `${baseUrl}/note/${document?.slug?.current}`;

    default:
      return null;
  }
}
