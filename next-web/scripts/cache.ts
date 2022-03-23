/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable import/first */
require("dotenv").config({ path: ".env.local" });
import fs from "fs";
import { getAllPosts } from "../src/lib/sanity.server";

// We assume that the data is secure. May require some sanitisation of untrusted data.
async function getCachedData(filename: string) {
  switch (filename) {
    case "blog":
      const posts = await getAllPosts();
      return `export const cachedPosts = ${JSON.stringify(posts)}`;

    default:
      return "export const cachedData = []";
  }
}

function createFileCache(filename: string, content: string) {
  fs.writeFile(`./src/cache/${filename}.js`, content, function (err) {
    if (err) {
      console.error(err);
    }
    console.log(`> [cache-posts]: ${filename} cache file written.`);
  });
}

try {
  fs.readdirSync("src/cache");
} catch (e) {
  fs.mkdirSync("src/cache");
}

// entry-point
async function main(): Promise<void> {
  const blogContent = await getCachedData("blog");
  createFileCache("blog", blogContent);
}

main();
