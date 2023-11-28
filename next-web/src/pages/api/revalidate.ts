/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { JSend } from "../../@types/JSend";

const SANITY_REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET ?? "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JSend>
) {
  if (req.method !== "POST") {
    console.error("Must be a POST request");
    return res
      .status(401)
      .json({ status: "fail", message: "Must be a POST request" });
  }

  const signature = req.headers[SIGNATURE_HEADER_NAME]?.toString();
  const body = await readBody(req); // Read the body into a string

  if (
    signature &&
    !(await isValidSignature(body, signature, SANITY_REVALIDATE_SECRET))
  ) {
    res.status(401).json({ status: "fail", message: "Invalid signature" });
    return;
  }

  try {
    const { type, slug } = JSON.parse(body);

    switch (type) {
      case "post":
        await res.revalidate(`/blog/${slug}`);
        return res.json({
          status: "success",
          message: `Revalidated "${type}" with slug "${slug}"`
        });
    }

    return res.json({ status: "fail", message: "No managed type" });
  } catch (err) {
    return res
      .status(500)
      .send({ status: "error", message: "Error revalidating" });
  }
}

// Next.js will by default parse the body, which can lead to invalid signatures
export const config = {
  api: {
    bodyParser: false
  }
};

async function readBody(readable: NextApiRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
