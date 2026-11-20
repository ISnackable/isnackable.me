import { z } from "zod";

const contributionResponse = z.object({
  contributions: z.array(
    z.object({
      date: z.iso.date(),
      count: z.number().int().nonnegative(),
      level: z.number().int().min(0).max(4),
    })
  ),
  total: z.record(z.string(), z.number().int().nonnegative()),
});

export async function fetchContributions(username: string, year: number) {
  const url = new URL(
    `/v4/${encodeURIComponent(username)}`,
    "https://github-contributions-api.jogruber.de"
  );
  url.searchParams.set("y", String(year));

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw new Error(`GitHub contributions request failed: ${response.status}`);
  }

  const data = contributionResponse.parse(await response.json());
  return { contributions: data.contributions, total: data.total[year] ?? 0 };
}
