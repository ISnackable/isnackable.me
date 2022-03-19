import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

const SANITY_PREVIEW_SECRET = process.env.SANITY_PREVIEW_SECRET;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req?.query?.secret) {
    return res.status(401).json({ message: "No secret token" });
  }

  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (req.query.secret !== SANITY_PREVIEW_SECRET) {
    return res.status(401).json({ message: "Invalid secret token" });
  }

  if (!req.query.slug) {
    return res.status(401).json({ message: "No slug" });
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({});

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.writeHead(307, { Location: `/${req?.query?.slug}` ?? `/` });

  return res.end();
}
