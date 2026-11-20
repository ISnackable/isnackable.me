import { siteConfig } from "@repo/config/site";
import { Grid, socialCardSize } from "@repo/seo/social-card/grid";
import { ImageResponse } from "next/og";

export const alt = "Application preview";
export const contentType = "image/png";
export const size = socialCardSize;

export default function Image() {
  return new ImageResponse(
    <Grid
      brand={siteConfig.applicationName}
      description="A clean starting point for your application."
      host={
        new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
          .hostname
      }
      label="Application"
      title="App"
    />,
    size
  );
}
