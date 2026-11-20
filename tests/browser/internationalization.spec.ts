import { expect, test } from "@playwright/test";
import en from "../../packages/internationalization/messages/en.json" with {
  type: "json",
};
import ja from "../../packages/internationalization/messages/ja.json" with {
  type: "json",
};
import zh from "../../packages/internationalization/messages/zh.json" with {
  type: "json",
};
import { openContentPage } from "./content-page";

for (const [locale, dictionary] of Object.entries({ en, ja, zh })) {
  test(`${locale} interface labels, About controls, and content links remain localized`, async ({
    page,
  }) => {
    const copy = dictionary.web;
    await openContentPage(page, `/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(
      page.getByRole("button", { name: copy.header.switchLanguage })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: copy.header.toggleTheme })
    ).toBeVisible();
    // Music and About are optional CMS content; only exercise configured widgets.
    const musicPlayer = page.locator(".music-player-widget");
    if (await musicPlayer.count()) {
      await expect(
        page.getByRole("button", { name: copy.home.music.play, exact: true })
      ).toBeVisible();
    }
    const selector = page.getByRole("tablist", {
      name: copy.home.about.exploration.selectorLabel,
    });
    if (await selector.count()) {
      await selector.getByRole("tab").last().click();
      await expect(selector.getByRole("tab").last()).toHaveAttribute(
        "aria-selected",
        "true"
      );
    }
    await expect(page.getByRole("contentinfo")).toContainText(
      copy.footer.builtBy
    );
    const links = await page
      .locator('main a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    expect(
      links.every(
        (href) => href?.startsWith(`/${locale}/`) || href === `/${locale}`
      )
    ).toBe(true);
    if (await page.locator("#about").count()) {
      await expect(
        page.locator(`#about a[href="/${locale}/resume"]`)
      ).toBeVisible();
    }
  });
}

test("résumé language switches retain the selected language's résumé URL", async ({
  page,
}) => {
  await page.goto("/en/resume");
  const translated = await page
    .locator('link[rel="alternate"][hreflang="ja"]')
    .evaluateAll((links) => links[0]?.getAttribute("href") ?? null);
  const expected = "/ja/resume";
  await page
    .getByRole("button", { name: en.web.header.switchLanguage })
    .click();
  await page.getByRole("menuitem", { name: "日本語" }).click();
  await expect(page).toHaveURL(expected);
  expect((await page.request.get(expected)).status()).toBe(
    translated ? 200 : 404
  );
});

for (const collection of ["blog", "projects"]) {
  test(`language changes from ${collection} details never navigate to a missing translation`, async ({
    page,
  }) => {
    await openContentPage(page, `/en/${collection}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const contentLinks = page.locator(`main a[href^="/en/${collection}/"]`);
    test.skip(
      (await contentLinks.count()) === 0,
      `Publish a ${collection} document to exercise detail-page translations.`
    );
    await contentLinks.first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const translated = await page
      .locator('link[rel="alternate"][hreflang="ja"]')
      .evaluateAll((links) => links[0]?.getAttribute("href") ?? null);
    const expected = translated
      ? new URL(translated, page.url()).pathname
      : `/ja/${collection}`;
    await page
      .getByRole("button", { name: en.web.header.switchLanguage })
      .click();
    await page.getByRole("menuitem", { name: "日本語" }).click();
    await expect(page).toHaveURL(expected);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect((await page.request.get(expected)).status()).toBe(200);
  });
}
