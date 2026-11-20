import { Badge } from "@repo/design-system/components/ui/badge";

export function ContentTags({
  values,
  limit,
  variant = "secondary",
}: {
  values: string[];
  limit?: number;
  variant?: "secondary" | "outline";
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {Array.from(new Set(values))
        .slice(0, limit)
        .map((value) => (
          <li className="min-w-0 max-w-full" key={value}>
            <Badge className="max-w-full" variant={variant}>
              <span className="whitespace-normal [overflow-wrap:anywhere]">
                {value}
              </span>
            </Badge>
          </li>
        ))}
    </ul>
  );
}
