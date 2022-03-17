const env = process.env.NODE_ENV || "development";
const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET;

const remoteUrl = `https://isnackable.me`;
const localUrl = `http://localhost:3000`;

export default function resolveProductionUrl(document) {
  const baseUrl = env === "development" ? localUrl : remoteUrl;

  const previewUrl = new URL(baseUrl);

  previewUrl.pathname = `/api/preview`;
  previewUrl.searchParams.append(`secret`, previewSecret);

  switch (document._type) {
    case "post":
      previewUrl.searchParams.append(
        `slug`,
        `blog/${document?.slug?.current}` ?? `/`
      );
      break;

    default:
      previewUrl.searchParams.append(`slug`, document?.slug?.current ?? `/`);
      break;
  }

  return previewUrl.toString();
}
