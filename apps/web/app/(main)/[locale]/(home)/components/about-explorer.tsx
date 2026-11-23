"use client";

import type { AboutInterest } from "@repo/cms/content/about";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import type { PortfolioDictionary } from "@repo/internationalization";
import { FileCode2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { usePreviewSelection } from "../../components/use-preview-selection";
import { interestPresentation } from "./explorer-content";

interface AboutExplorerItem extends Omit<AboutInterest, "image"> {
  caption: string | null;
  hasImage: boolean;
  visual: ReactNode;
}

export function AboutExplorer({
  items,
  copy,
  introduction,
}: {
  items: AboutExplorerItem[];
  copy: PortfolioDictionary["web"]["home"]["about"]["exploration"];
  introduction: ReactNode;
}) {
  const { activeId, motion, select, hover } = usePreviewSelection(
    items[0]?._key ?? ""
  );
  const active = items.find((item) => item._key === activeId) ?? items[0];
  if (!active) {
    return <div className="about-introduction">{introduction}</div>;
  }

  return (
    <Tabs
      className="about-explorer grid gap-8 lg:gap-x-16"
      onValueChange={(value) => {
        if (typeof value === "string") {
          select(value, "keyboard");
        }
      }}
      value={active._key}
    >
      <div className="about-introduction">{introduction}</div>
      <div className="artifact-window about-artifact">
        <div className="artifact-toolbar">
          <span className="inline-flex items-center gap-2">
            <FileCode2Icon aria-hidden="true" className="size-4" />
            {active.hasImage
              ? active.caption || copy.captionPlaceholder
              : copy.artifacts[active.style]}
          </span>
          <span className="artifact-caption">
            {active.hasImage ? copy.media : copy.placeholder}
          </span>
        </div>
        <div
          className="artifact-stage preview-crossfade"
          data-motion={motion ? "pointer" : "instant"}
        >
          {items.map((item) => (
            <div
              aria-hidden={item._key !== active._key}
              className="preview-layer"
              data-active={item._key === active._key}
              data-tone={interestPresentation[item.style].tone}
              key={item._key}
            >
              {item.visual}
            </div>
          ))}
        </div>
      </div>
      <TabsList
        aria-label={copy.selectorLabel}
        className="about-interest-controls grid h-auto w-full min-w-0 auto-cols-[minmax(7rem,1fr)] grid-flow-col gap-1 overflow-x-auto"
        variant="line"
      >
        {items.map((item) => {
          const Icon = interestPresentation[item.style].icon;
          return (
            <TabsTrigger
              aria-label={item.title}
              className="h-auto min-w-0 flex-col gap-2 whitespace-normal px-1 py-3 after:inset-x-0 after:bottom-0 after:h-0.5"
              key={item._key}
              onPointerEnter={() => hover(item._key)}
              value={item._key}
            >
              <Icon aria-hidden="true" />
              <span className="explorer-tab-label text-balance">
                {item.title}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <div className="explorer-description">
        <TabsContent className="m-0" key={active._key} value={active._key}>
          <h3 className="mb-2 font-medium text-lg">{active.title}</h3>
          <p className="text-muted-foreground text-sm leading-7">
            {active.description}
          </p>
        </TabsContent>
      </div>
    </Tabs>
  );
}
