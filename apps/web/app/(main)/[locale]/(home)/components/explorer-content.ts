import type { InterestStyle } from "@repo/cms/content/about";
import {
  Code2Icon,
  type LucideIcon,
  ScanLineIcon,
  ServerCogIcon,
} from "lucide-react";

export type ArtifactKind = "workspace" | "phone" | "flow" | "timeline";

/** Reusable visual presets; each topic's identity and copy come from the CMS. */
export const interestPresentation: Record<
  InterestStyle,
  { icon: LucideIcon; tone: string; artwork: ArtifactKind }
> = {
  software: { icon: Code2Icon, tone: "brand", artwork: "workspace" },
  systems: { icon: ServerCogIcon, tone: "amber", artwork: "phone" },
  security: { icon: ScanLineIcon, tone: "teal", artwork: "flow" },
};
