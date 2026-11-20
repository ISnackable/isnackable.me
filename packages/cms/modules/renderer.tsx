import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import { Accordion } from "./accordion/view";
import { Callout } from "./callout/view";
import { ModuleFrame } from "./frame";
import { Gallery } from "./gallery/view";
import { Quote } from "./quote/view";
import type { ModuleHeadingLevel, VisualModule } from "./types";

/** Used by page composition and Portable Text; every module shares its renderer. */
export function VisualModuleView({
  module,
  headingLevel = 2,
  className,
}: {
  module: VisualModule;
  headingLevel?: ModuleHeadingLevel;
  className?: string;
}) {
  let content: ReactNode;
  switch (module._type) {
    case "calloutModule":
      content = <Callout headingLevel={headingLevel} module={module} />;
      break;
    case "galleryModule":
      content = <Gallery headingLevel={headingLevel} module={module} />;
      break;
    case "quoteModule":
      content = <Quote module={module} />;
      break;
    case "accordionModule":
      content = <Accordion headingLevel={headingLevel} module={module} />;
      break;
    default:
      return null;
  }
  return (
    <ModuleFrame
      attributes={module.attributes}
      className={cn(
        "my-8 min-w-0 [overflow-wrap:anywhere]",
        module._type === "quoteModule" ? "typeset" : "not-typeset",
        className
      )}
      moduleKey={module._key}
      type={module._type}
    >
      {content}
    </ModuleFrame>
  );
}
