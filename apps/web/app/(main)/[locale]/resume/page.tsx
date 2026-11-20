import { resume } from "@repo/cms";
import { urlFor } from "@repo/cms/content/images";
import { routing } from "@repo/internationalization";
import { stegaClean } from "@sanity/client/stega";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteLocale } from "@/i18n/locale";
import { createWebMetadata } from "@/lib/metadata";
import { StandardResume } from "./components/standard-resume";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async (): Promise<Metadata> =>
  createWebMetadata({ kind: "resume" }, await getSiteLocale());

const ResumePage = async () => {
  const locale = await getSiteLocale();

  const profile = await resume.get(locale);

  if (!(profile?._id && profile.firstName && profile.lastName)) {
    notFound();
  }

  const photo = profile.profilePhoto;
  const photoUrl = photo?.asset?.url
    ? urlFor(
        photo.asset._id
          ? {
              ...stegaClean(photo),
              asset: { _ref: stegaClean(photo.asset._id) },
            }
          : stegaClean(photo.asset.url)
      )
        .width(336)
        .height(336)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <StandardResume locale={locale} photoUrl={photoUrl} profile={profile} />
  );
};

export default ResumePage;
