import { ActivityHeatmap } from "@repo/design-system/components/ui/activity-heatmap";
import { cacheLife } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { fetchContributions } from "@/lib/contributions";

async function getCachedContributions(username: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60 * 60 * 24, expire: 60 * 60 * 24 * 2 });
  const now = new Date();
  const { contributions } = await fetchContributions(
    username,
    now.getUTCFullYear()
  );
  return {
    data: contributions.map(({ date, count }) => ({ date, value: count })),
    endDate: now.toISOString().slice(0, 10),
  };
}

export async function ContributionGraphServer({
  label,
  username,
  unavailableLabel,
}: {
  label: string;
  username: string;
  unavailableLabel: string;
}) {
  if (!username) {
    return null;
  }
  try {
    const { data, endDate } = await getCachedContributions(username);

    return (
      <ActivityHeatmap
        ariaLabel={label}
        data={data}
        endDate={endDate}
        weekStart={1}
      />
    );
  } catch (error) {
    unstable_rethrow(error);
    // A failed optional service must not prevent the homepage from rendering.
    // Keep failures outside the cache so the next request can retry.
    return <p className="text-muted-foreground text-sm">{unavailableLabel}</p>;
  }
}
