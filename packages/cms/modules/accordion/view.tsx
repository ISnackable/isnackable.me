import {
  AccordionContent,
  AccordionItem,
  Accordion as AccordionRoot,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { ModuleText } from "../text";
import type { ModuleHeadingLevel, ModuleOf } from "../types";

export function Accordion({
  module,
  headingLevel,
}: {
  module: ModuleOf<"accordionModule">;
  headingLevel: ModuleHeadingLevel;
}) {
  const Tag = headingLevel === 2 ? "h2" : "h3";
  return (
    <div>
      {module.title ? (
        <Tag
          className="mb-4 font-semibold text-xl tracking-tight"
          data-module-title
        >
          {module.title}
        </Tag>
      ) : null}
      <AccordionRoot
        defaultValue={
          module.items?.filter((item) => item.open).map((item) => item._key) ??
          []
        }
        keepMounted
        multiple
      >
        {module.items?.map((item) => (
          <AccordionItem key={item._key} value={item._key}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <ModuleText value={item.body} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </div>
  );
}
