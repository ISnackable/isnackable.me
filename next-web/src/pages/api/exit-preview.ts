import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.clearPreviewData();

  res.writeHead(307, { Location: req?.query?.slug ?? `/` });

  return res.end();
}
