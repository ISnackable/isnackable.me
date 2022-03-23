/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  title as titleConfig,
  description as descriptionConfig,
  siteUrl,
  image as imageConfig,
  socialUsername
} from "@lib/config";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  article?: boolean;
}

const SEO: NextPage<SEOProps> = ({ title, description, image, article }) => {
  const { asPath } = useRouter();

  const seo = {
    title: title || titleConfig,
    description: description || descriptionConfig,
    image: image || `${siteUrl}/${image || imageConfig}`,
    url: `${siteUrl}${asPath}`
  };

  return (
    <Head>
      <title>{`${seo.title} – ${titleConfig}`}</title>
      <meta property="og:type" content={article ? "article" : "website"} />
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && (
        <meta property="og:description" content={seo.description} />
      )}
      <meta property="og:site_name" content={titleConfig} />
      {seo.url && <meta property="og:url" content={seo.url} />}
      {seo.image && <meta property="og:image" content={seo.image} />}
      <meta property="og:site_name" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      {socialUsername && (
        <meta name="twitter:creator" content={socialUsername} />
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
