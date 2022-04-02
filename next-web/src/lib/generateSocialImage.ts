interface SocialImage {
  title: string;
  cloudName: string;
  imagePublicID: string;
  cloudinaryUrlBase?: string;
  version?: string | null;
  titleFont?: string;
  titleExtraConfig?: string;
  underlayImageWidth?: number;
  underlayImageHeight?: number;
  underlayImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  textAreaWidth?: number;
  textAreaHeight?: number;
  textLeftOffset?: number;
  textBottomOffset?: number;
  textColor?: string;
  titleFontSize?: number;
}

export default function generateSocialImage({
  title,
  cloudName,
  imagePublicID,
  cloudinaryUrlBase = "https://res.cloudinary.com",
  version = null,
  titleFont = "arial",
  titleExtraConfig = "_bold",
  underlayImageWidth = 580,
  underlayImageHeight = 630,
  underlayImage = "",
  imageWidth = 1200,
  imageHeight = 630,
  textAreaWidth = 630,
  textAreaHeight = 450,
  textLeftOffset = 45,
  textBottomOffset = -40,
  textColor = "FFFFFF",
  titleFontSize = 56
}: SocialImage): string {
  // configure social media image dimensions, quality, and format
  const imageConfig = [
    `w_${imageWidth}`,
    `h_${imageHeight}`,
    "c_fill",
    "f_auto"
  ].join(",");

  const underlayImageComponent = underlayImage.includes("http")
    ? `fetch:${Buffer.from(underlayImage).toString("base64")}`
    : underlayImage;

  const underlayConfig = [
    `w_${underlayImageWidth}`,
    `h_${underlayImageHeight}`,
    `c_fill`,
    `u_${underlayImageComponent}/fl_layer_apply`,
    `g_east`
  ];

  // configure the title text
  const titleConfig = [
    `w_${textAreaWidth}`,
    `h_${textAreaHeight}`,
    "c_fit",
    `co_rgb:${textColor}`,
    "g_west",
    `x_${textLeftOffset}`,
    `y_${textBottomOffset}`,
    `l_text:${titleFont}_${titleFontSize}${titleExtraConfig}:${encodeURIComponent(
      title.replace(/,/g, "%2C").replace(/\//g, "%2F")
    )}`
  ].join(",");

  // combine all the pieces required to generate a Cloudinary URL
  const urlParts = [
    cloudinaryUrlBase,
    cloudName,
    "image",
    "upload",
    imageConfig,
    underlayConfig,
    titleConfig,
    version,
    imagePublicID
  ];

  // remove any falsy sections of the URL (e.g. an undefined version)
  const validParts = urlParts.filter(Boolean);

  // join all the parts into a valid URL to the generated image
  return validParts.join("/");
}
