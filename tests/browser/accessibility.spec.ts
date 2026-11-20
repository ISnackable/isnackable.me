import { expect, test } from "@playwright/test";

const mondayContribution = /^Mon, .* contributions$/;
const tuesdayContribution = /^Tue, .* contributions$/;

test("the GitHub heatmap supports mouse and keyboard selection in the rotated hero", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "The hero contribution panel is shown on wider screens.");
  await page.goto("/en");
  const hero = page.locator(".hero-scene");
  test.skip(
    (await hero.getByRole("link", { name: "GitHub", exact: true }).count()) ===
      0,
    "The published homepage has no GitHub profile."
  );

  const chart = hero.getByRole("img", { name: "GitHub contributions" });
  await expect(chart).toBeVisible();
  const selection = chart.locator("../..").getByRole("status");
  await chart.focus();
  await expect(chart).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(selection).toHaveText(mondayContribution);
  await page.keyboard.press("ArrowDown");
  await expect(selection).toHaveText(tuesdayContribution);
  await page.keyboard.press("Escape");
  await expect(selection).toBeEmpty();

  // The transparent pointer layer is above the cells inside the rotated panel.
  const firstCell = await chart
    .locator("rect[data-level]")
    .first()
    .boundingBox();
  if (!firstCell) {
    throw new Error("The contribution heatmap has no visible cells.");
  }
  await page.mouse.move(
    firstCell.x + firstCell.width / 2,
    firstCell.y + firstCell.height / 2
  );
  await expect(selection).toHaveText(mondayContribution);
});

test("returning home retains the live lanyard without creating another worker", async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    window.Worker = class extends OriginalWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        document.documentElement.dataset.workerStarts = String(
          Number(document.documentElement.dataset.workerStarts ?? 0) + 1
        );
      }
    };
  });
  await page.goto("/en");
  const badge = page.locator(".lanyard-wrapper");
  test.skip(
    (await badge.count()) === 0,
    "The published homepage has no badge."
  );
  await expect(badge).toHaveAttribute("data-state", "live", {
    timeout: 20_000,
  });
  const workers = await page.locator("html").getAttribute("data-worker-starts");
  await badge.locator("canvas").evaluate((canvas) => {
    canvas.dataset.returnMarker = "retained";
  });
  const navigate = async (name: string) => {
    if (isMobile) {
      await page.getByRole("button", { name: "Toggle menu" }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name, exact: true })
        .click();
    } else {
      await page
        .locator("header")
        .getByRole("link", { name, exact: true })
        .click();
    }
  };
  await navigate("Blog");
  await expect(page).toHaveURL("/en/blog");
  await page.goBack();
  await expect(page).toHaveURL("/en");
  await expect(badge).toHaveAttribute("data-state", "live");
  await expect(badge.locator("canvas")).toHaveAttribute(
    "data-return-marker",
    "retained"
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-worker-starts",
    workers as string
  );
  await navigate("Blog");
  await expect(page).toHaveURL("/en/blog");
  await navigate("Home");
  await expect(page).toHaveURL("/en");
  await expect(badge).toHaveAttribute("data-state", "live");
  await expect(badge.locator("canvas")).toHaveAttribute(
    "data-return-marker",
    "retained"
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-worker-starts",
    workers as string
  );
});

test("mobile navigation manages focus, blocks background input, and closes with Escape", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The menu is only shown below the desktop breakpoint.");
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Toggle menu" });
  const triggerBounds = await trigger.boundingBox();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await expect(dialog).toBeVisible();
  const closeBounds = await dialog
    .getByRole("button", { name: "Close menu" })
    .boundingBox();
  expect(closeBounds?.x).toBeCloseTo(triggerBounds?.x ?? -1, 0);
  expect(closeBounds?.y).toBeCloseTo(triggerBounds?.y ?? -1, 0);
  const menuBounds = await dialog.getByRole("navigation").boundingBox();
  expect(menuBounds?.y).toBe(56);
  await expect(page.locator("header").first()).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close menu" })
  ).toBeFocused();
  await expect(
    dialog.getByRole("link", { name: "Blog", exact: true })
  ).toHaveAttribute("href", "/en/blog");
  await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(
    0
  );
  const focusOrder = [
    dialog.getByRole("link", { name: "Home", exact: true }),
    dialog.getByRole("link", { name: "Blog", exact: true }),
    dialog.getByRole("link", { name: "Projects", exact: true }),
    dialog.getByRole("button", { name: "Close menu" }),
  ];
  for (let index = 0; index < 6; index++) {
    // biome-ignore lint/performance/noAwaitInLoops: Verify sequential keyboard focus remains inside the modal.
    await page.keyboard.press("Tab");
    // Base UI redirects its focus guard on the next animation frame.
    await expect(focusOrder[index % focusOrder.length]).toBeFocused();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile menu links navigate and the overlay stays closed on browser back", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The menu is only shown below the desktop breakpoint.");
  await page.goto("/en");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await dialog.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL("/en/blog");
  await expect(dialog).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL("/en");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("resizing to desktop dismisses the mobile overlay and releases scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("button", { name: "Toggle theme" })
  ).toBeVisible();
});
