/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export const env = process.env.NODE_ENV || "development";

export const rootURLs = {
  production: {
    studio: "https://isnackable.sanity.studio",
    web: "https://isnackable.me",
  },
  development: {
    studio: "http://localhost:3333",
    web: "http://localhost:3000",
  },
  repo: {
    web: "https://github.com/ISnackable/isnackable.me/",
  },
};

export const paths = {
  blog: "blog",
};

/**
 *
 * @param root The root of the URL, e.g. rootURLs.production.web
 * @param type The documnt type, e.g. "venue"
 * @returns The URL based on the document type and environment
 */
export const getPath = (root: string, type: string): string => {
  return `${root}${paths[type] ? `/${paths[type]}` : ""}`;
};

export const getPreviewUrl = (type: string, slug: string = ""): string => {
  const root = rootURLs[env].web;
  return getPath(root, type) + "/" + slug;
};
