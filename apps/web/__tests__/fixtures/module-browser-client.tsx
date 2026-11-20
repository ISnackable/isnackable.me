import { PortableText } from "@repo/cms/components/portable-text";
import { Accordion } from "@repo/cms/modules/accordion/view";
import { createRoot } from "react-dom/client";
import {
  codeFixture,
  moduleFixtures,
} from "../../../../tests/fixtures/cms-modules";

const container = document.querySelector('[data-module="accordionModule"]');
if (container) {
  createRoot(container).render(
    <Accordion headingLevel={2} module={moduleFixtures[3]} />
  );
}

const codeContainer = document.querySelector("#code-fixture");
if (codeContainer) {
  createRoot(codeContainer).render(<PortableText value={[codeFixture]} />);
}
