/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { Feed } from "feed";
import { getAllPosts } from "@lib/sanity.server";
import { title, description, siteUrl, socialUsername } from "@lib/config";

const year = new Date().getFullYear();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const posts = await getAllPosts();

  const feed = new Feed({
    title: `${socialUsername}'s Blog - ${title}`,
    id: siteUrl,
    link: siteUrl,
    description: description,
    copyright: `Copyright © 2021-${year} ${socialUsername}. All rights reserved`,
    image: `${siteUrl}/icon.png`,
    favicon: `${siteUrl}/favicon.ico`,
    author: {
      name: socialUsername ?? "Author",
      link: siteUrl
    }
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post._id,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.publishedAt)
    });
  });

  const rssFeed = feed.rss2();

  res.setHeader("Content-Type", "text/xml");
  res.write(rssFeed);
  res.end();
}
