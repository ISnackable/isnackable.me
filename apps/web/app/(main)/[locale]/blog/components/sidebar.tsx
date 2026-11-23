import { capitalize } from "@repo/design-system/utils/capitalize";
import type { PortfolioDictionary } from "@repo/internationalization";
import type { ReactNode } from "react";

interface SidebarProperties {
  readonly copy: PortfolioDictionary["web"]["content"];
  readonly tags?: string[];
  readonly toc?: ReactNode;
}

export const Sidebar = ({ tags, toc: Toc, copy }: SidebarProperties) => (
  <div className="flex flex-col gap-8 border-border border-l pl-6">
    {Toc ? (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-foreground text-sm">{copy.onThisPage}</p>
        {Toc}
      </div>
    ) : null}
    {tags && tags.length > 0 ? (
      <div className="grid gap-2">
        <p className="text-muted-foreground text-sm">{copy.tags}</p>
        <p className="rounded-sm text-foreground text-sm">
          {tags.map(capitalize).join(", ")}
        </p>
      </div>
    ) : null}
  </div>
);
