import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { stegaClean } from "@sanity/client/stega";
import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import { ModuleText } from "../text";
import type { ModuleHeadingLevel, ModuleOf } from "../types";

export function Callout({
  module,
  headingLevel,
}: {
  module: ModuleOf<"calloutModule">;
  headingLevel: ModuleHeadingLevel;
}) {
  const tone = stegaClean(module.tone) ?? "note";
  const Tag = headingLevel === 2 ? "h2" : "h3";
  const Icon =
    tone === "warning"
      ? TriangleAlertIcon
      : tone === "tip"
        ? LightbulbIcon
        : InfoIcon;
  return (
    <Alert
      data-tone={tone}
      role="note"
      variant={tone === "warning" ? "destructive" : "default"}
    >
      <Icon aria-hidden="true" />
      {module.title ? (
        <AlertTitle>
          <Tag data-module-title>{module.title}</Tag>
        </AlertTitle>
      ) : null}
      <AlertDescription>
        <ModuleText value={module.body} />
      </AlertDescription>
    </Alert>
  );
}
