import { NextApiRequest, NextApiResponse } from "next";
import {
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "@lib/helpers";
import { cachedPosts } from "../../cache/blog.js";
import type { AllSanityPost } from "../../@types/allSanityPost";

type Data = {
  results: string[];
};

const blogPosts: AllSanityPost[] = cachedPosts;
// .filter(filterOutDocsWithoutSlugs)
// .filter(filterOutDocsPublishedInTheFuture);

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const results = req.query.q
    ? blogPosts.filter((post) => {
        const { description, title } = post;

        return (
          description.toLowerCase().includes(req.query.q.toString()) ||
          title.toLowerCase().includes(req.query.q.toString())
        );
      })
    : blogPosts;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ results }));
}
