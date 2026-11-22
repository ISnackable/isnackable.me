import { Grid, socialCardSize } from "@repo/seo/social-card/grid";
import { ImageResponse } from "next/og";

export const alt = "OneDrive Index";
export const contentType = "image/png";
export const size = socialCardSize;

export default function Image() {
  return new ImageResponse(
    <Grid
      brand="OneDrive Index"
      description="Browse and download files."
      host={
        URL.parse(process.env.NEXT_PUBLIC_APP_URL ?? "")?.hostname ||
        "localhost"
      }
      label="Files"
      title="OneDrive Index"
    />,
    size
  );
}
