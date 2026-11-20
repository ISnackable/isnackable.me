import {
  getImageUrl,
  SanityImage,
  type SanityImageProps,
} from "@repo/cms/components/sanity-image";
import { expect, test, vi } from "vitest";

vi.mock("@repo/cms/keys", () => ({
  keys: () => ({
    NEXT_PUBLIC_SANITY_PROJECT_ID: "example",
    NEXT_PUBLIC_SANITY_DATASET: "production",
  }),
}));

const image: NonNullable<SanityImageProps["image"]> = {
  asset: {
    _id: "image-example-2000x1000-png",
    url: "https://cdn.sanity.io/images/example/production/example-2000x1000.png",
  },
  alt: "Image with an off-centre subject",
  crop: { _type: "sanity.imageCrop", left: 0.1, right: 0, top: 0, bottom: 0 },
  hotspot: {
    _type: "sanity.imageHotspot",
    x: 0.85,
    y: 0.5,
    width: 0.1,
    height: 0.2,
  },
};

test("dimensioned collage and filled About images preserve editorial crop and focal point", () => {
  const about = SanityImage({ image, fill: true, width: 1040, height: 650 });
  const collage = SanityImage({ image, width: 260, height: 200 });
  expect(about).not.toBeNull();
  expect(collage).not.toBeNull();
  const aboutUrl = new URL(String(about?.props.src));
  const collageUrl = new URL(String(collage?.props.src));
  expect(aboutUrl.searchParams.get("w")).toBe("1040");
  expect(aboutUrl.searchParams.get("h")).toBe("650");
  expect(aboutUrl.searchParams.get("rect")).toBe("400,0,1600,1000");
  expect(collageUrl.searchParams.get("rect")).toBe("700,0,1300,1000");
  expect(about?.props.fill).toBe(true);
  expect(about?.props.width).toBeUndefined();
});

test("dimensioned image URLs preserve editorial crop and focal point", () => {
  const url = getImageUrl(image, 512, 384);
  expect(url).not.toBeNull();
  expect(new URL(url ?? "").searchParams.get("rect")).toBe("667,0,1333,1000");
});
