import sanityConfig from "@repo/cms/sanity-config";
import type { Metadata } from "next";
import { NextStudio } from "next-sanity/studio";

// Studio is a separate application and does not participate in site navigations.
export const instant = false;

// Prevent the Studio from being indexed.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioPage() {
  return <NextStudio config={sanityConfig} />;
}
