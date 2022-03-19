import type { NextApiRequest, NextApiResponse } from "next";
import { isValidRequest } from "@sanity/webhook";

type Data = {
  message: string;
};

const SANITY_REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET ?? "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    console.error("Must be a POST request");
    return res.status(401).json({ message: "Must be a POST request" });
  }

  if (!isValidRequest(req, SANITY_REVALIDATE_SECRET)) {
    res.status(401).json({ message: "Invalid signature" });
    return;
  }

  try {
    const {
      body: { type, slug }
    } = req;

    switch (type) {
      case "post":
        await res.unstable_revalidate(`/blog/${slug}`);
        return res.json({
          message: `Revalidated "${type}" with slug "${slug}"`
        });
    }

    return res.json({ message: "No managed type" });
  } catch (err) {
    return res.status(500).send({ message: "Error revalidating" });
  }
}
