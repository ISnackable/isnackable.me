import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import siteConfig from "../../site.config";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  article?: boolean;
}

const SEO: NextPage<SEOProps> = ({ title, description, image, article }) => {
  const { asPath } = useRouter();

  const seo = {
    title: title || siteConfig.title,
    description: description || siteConfig.description,
    image: `${siteConfig.siteUrl}/${image || siteConfig.image}`,
    url: `${siteConfig.siteUrl}${asPath}`
  };

  return (
    <Head>
      <title>{`${seo.title} – ${siteConfig.title}`}</title>
      <meta name="description" content={seo.description} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      <meta property="og:type" content={article ? "article" : "website"} />
      {seo.description && (
        <meta property="og:description" content={seo.description} />
      )}
      {seo.url && <meta property="og:url" content={seo.url} />}
      <meta property="og:site_name" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      {siteConfig.socialUsername && (
        <meta name="twitter:creator" content={siteConfig.socialUsername} />
      )}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && (
        <meta name="twitter:description" content={seo.description} />
      )}
      {seo.image && <meta name="twitter:image" content={seo.image} />}
    </Head>
  );
};

export default SEO;
