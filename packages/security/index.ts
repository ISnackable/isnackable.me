import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { keys } from "./keys";

const arcjetKey = keys().ARCJET_KEY;
const arcjetClient = arcjetKey
  ? arcjet({
      key: arcjetKey,
      // A cached bot denial should only affect clients with the same identity.
      characteristics: ["ip.src", "userAgent"],
      rules: [shield({ mode: "LIVE" })],
    })
  : undefined;

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[] | null,
  request: Request,
  rateLimit?: { requestsPerMinute: number }
) => {
  if (!arcjetClient) {
    return;
  }

  try {
    const botClient =
      allow === null
        ? arcjetClient
        : arcjetClient.withRule(detectBot({ mode: "LIVE", allow }));
    const client = rateLimit
      ? botClient.withRule(
          slidingWindow({
            characteristics: ["ip.src"],
            interval: "60s",
            max: rateLimit.requestsPerMinute,
            mode: "LIVE",
          })
        )
      : botClient;
    const decision = await client.protect(request, {
      userAgent: request.headers.get("user-agent")?.trim() || "(missing)",
    });

    if (decision.isDenied()) {
      const reason = decision.reason;
      const rateLimited = reason.isRateLimit();
      const headers = new Headers({ "Cache-Control": "private, no-store" });
      if (rateLimited) {
        const { reset, resetTime } = reason;
        const seconds = resetTime
          ? (resetTime.getTime() - Date.now()) / 1000
          : reset;
        headers.set("Retry-After", String(Math.max(1, Math.ceil(seconds))));
      }
      return Response.json(
        { error: rateLimited ? "rate-limited" : "denied" },
        {
          headers,
          status: rateLimited ? 429 : 403,
        }
      );
    }
  } catch (error) {
    console.error("Arcjet request protection failed", error);
  }
};
