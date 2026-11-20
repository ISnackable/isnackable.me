import { RESUME_QUERY } from "@repo/cms/queries";
import en from "@repo/internationalization/messages/en.json";
import ja from "@repo/internationalization/messages/ja.json";
import zh from "@repo/internationalization/messages/zh.json";
import { evaluate, parse as parseGroq } from "groq-js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "smol-toml";
import { expect, test, vi } from "vitest";
import { StandardResume } from "../app/(main)/[locale]/resume/components/standard-resume";
import { generateTypstProject } from "../app/(main)/[locale]/resume/lib/generate-typst-project";

vi.mock("@repo/internationalization/client", () => ({
  useTranslations: () => (key: string) =>
    key === "placeholderName" ? en.web.resume.placeholderName : key,
}));

const profile = {
  firstName: "Metadata first name",
  lastName: "Metadata last name",
};

test("the résumé query preserves a missing issuer instead of substituting Organization", async () => {
  const params = { locale: "en" };
  const dataset = [
    {
      _id: "resume-en",
      _type: "resume",
      language: "en",
      ...profile,
      certificates: [
        {
          _key: "certificate",
          title: "A certificate",
          society: "Old organization",
        },
      ],
    },
  ];
  const result = await (
    await evaluate(parseGroq(RESUME_QUERY), { dataset, params })
  ).get();
  expect(result.certificates[0].issuer).toBeNull();
});

test("the web résumé uses only Display name, with a generic placeholder when it is empty", () => {
  const missing = renderToStaticMarkup(
    createElement(StandardResume, { profile, locale: "en" })
  );
  expect(missing).toContain(en.web.resume.placeholderName);
  expect(missing).not.toContain(profile.firstName);
  expect(missing).not.toContain(profile.lastName);
  const authored = renderToStaticMarkup(
    createElement(StandardResume, {
      profile: { ...profile, displayName: "Résumé identity" },
      locale: "en",
    })
  );
  expect(authored).toContain("Résumé identity");
  expect(authored).not.toContain(en.web.resume.placeholderName);
});

test.each([
  ["en", en],
  ["ja", ja],
  ["zh", zh],
] as const)(
  "%s PDF uses the localized placeholder without borrowing first and last names",
  (locale, dictionary) => {
    const placeholder = dictionary.web.resume.placeholderName;
    const project = generateTypstProject(profile, locale, placeholder);
    const metadata = parse(project.files[`profile_${locale}/metadata.toml`]);
    expect(metadata.personal).toMatchObject({
      display_name: placeholder,
      first_name: placeholder,
      last_name: "",
    });
  }
);

test("PDF header and footer share Display name, and certificate issuers do not borrow legacy organizations", () => {
  const project = generateTypstProject(
    {
      ...profile,
      displayName: "Résumé identity",
      certificates: [
        { title: "Legacy entry", society: "Unrelated organization" },
        {
          title: "Current entry",
          issuer: "Correct issuer",
          society: "Another legacy organization",
        },
      ],
    },
    "en",
    en.web.resume.placeholderName
  );
  const metadata = parse(project.files["profile_en/metadata.toml"]);
  expect(metadata.personal).toMatchObject({
    display_name: "Résumé identity",
    first_name: "Résumé identity",
    last_name: "",
  });
  const certificates = project.files["profile_en/certificates.typ"];
  expect(certificates).toContain("Correct issuer");
  expect(certificates).not.toContain("Unrelated organization");
  expect(certificates).not.toContain("Another legacy organization");
});

test("PDF exports leave absent entry details blank and localize the footer", () => {
  const project = generateTypstProject(
    {
      ...profile,
      projects: [{ title: "プロジェクト名" }],
      experiences: [
        {
          society: "勤務先",
          roles: [{ title: "職名" }, { title: "前職", date: "2024–2025" }],
        },
        {
          title: "研究員",
          society: "研究所",
          date: "2025年",
          location: "東京",
        },
      ],
      certificates: [{ title: "資格名" }],
    },
    "ja",
    ja.web.resume.placeholderName
  );
  const metadata = parse(project.files["profile_ja/metadata.toml"]);
  expect(metadata.cv_footer).toBe("履歴書");
  expect(project.files["profile_ja/projects.typ"]).toContain(
    "society: [プロジェクト名],\n  title: [],\n  date: [],\n  location: []"
  );
  const experience = project.files["profile_ja/professional.typ"];
  expect(experience).toContain("society: [勤務先],\n  location: []");
  expect(experience).toContain('title: [職名],\n  date: ""');
  expect(experience).toContain('title: [前職],\n  date: "2024–2025"');
  expect(experience).toContain(
    "society: [研究所],\n  title: [研究員],\n  date: [2025年],\n  location: [東京]"
  );
  expect(project.files["profile_ja/certificates.typ"]).toContain(
    "date: [],\n  title: [資格名]"
  );
});
