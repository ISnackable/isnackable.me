import fs from "fs";
import { createClient } from "next-sanity";
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

// @ts-ignore
const blogContent = await getCachedData("blog");

try {
  fs.readdirSync("cache");
} catch (e) {
  fs.mkdirSync("cache");
}

function createBlogCache(filename: string) {
  fs.writeFile(`./cache/${filename}.js`, blogContent, function (err) {
    if (err) {
      console.error(err);
    }
    console.log("Blog cache file written");
  });
}

// entry-point
createBlogCache("blog");
