import { expect, test } from "@playwright/test";
import { studioInputId } from "../../packages/cms/studio/input-id";

test("Studio field IDs support injected autofill selectors, labels, and descriptions", async ({
  page,
}) => {
  const path = 'sections[_key=="hero"].nameGraphic.paths[0]';
  const id = studioInputId(path);
  await page.setContent(
    `<label for="${id}">SVG path</label><input id="${id}" aria-describedby="desc_${id}" /><p id="desc_${id}">Path instructions</p>`
  );
  const input = page.getByRole("textbox", { name: "SVG path" });
  await expect(input).toHaveAccessibleDescription("Path instructions");
  await page.getByText("SVG path", { exact: true }).click();
  await expect(input).toBeFocused();
  const labels = await input.evaluate(
    (element) => document.querySelectorAll(`label[for="${element.id}"]`).length
  );
  expect(labels).toBe(1);
});
