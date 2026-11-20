import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * On-demand revalidation webhook for Sanity.
 *
 * Configure a GROQ-powered webhook in Sanity Manage (sanity.io/manage →
 * your project → API → Webhooks) pointing at this route:
 *
 * - URL:        https://<your-domain>/api/revalidate
 * - Method:     POST
 * - Trigger on: Create, Update, Delete
 * - Filter:     _type in ["page", "post", "project", "author", "legalPage", "resume", "settings", "translation.metadata"]
 * - Projection: { "tags": [_type, select(defined(slug.current) => _type + ":" + slug.current)] }
 * - Secret:     the same SANITY_REVALIDATE_SECRET stored in your env
 *
 * The webhook fires only on publish (drafts/versions are excluded by
 * default), which is what makes newly published content appear without
 * a full rebuild. `parseBody` validates Sanity's Stripe-style signature
 * against SANITY_REVALIDATE_SECRET and waits for Content Lake eventual
 * consistency before returning so subsequent fetches aren't stale.
 */
interface WebhookPayload {
  tags?: unknown;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return new Response("Webhook is not configured", { status: 503 });
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
      true
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (!Array.isArray(body?.tags) || body.tags.length === 0) {
      return new Response("Missing tags", { status: 400 });
    }

    const tags = body.tags.filter(
      (tag): tag is string => typeof tag === "string" && tag.length > 0
    );

    for (const tag of tags) {
      revalidateTag(tag, "max");
    }

    return Response.json({ revalidated: tags });
  } catch {
    return new Response("Revalidation failed", { status: 500 });
  }
}
