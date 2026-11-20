import type {
  ResumeAsset,
  ResumeData,
  ResumeEntry,
  ResumeRole,
  ResumeSkill,
} from "@repo/cms";
import { BRILLIANT_CV_IMPORT } from "@repo/typst/config";
import type { TypstProject } from "@repo/typst/types";
import { stegaClean } from "@sanity/client/stega";
import { stringify } from "smol-toml";

type SectionKey =
  | "education"
  | "professional"
  | "projects"
  | "certificates"
  | "publications"
  | "skills";

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "education",
  "professional",
  "projects",
  "certificates",
  "publications",
  "skills",
];

const SECTION_TITLES: Record<string, Record<SectionKey, string>> = {
  en: {
    education: "Education",
    professional: "Professional Experience",
    projects: "Projects",
    certificates: "Certificates",
    publications: "Publications",
    skills: "Skills",
  },
  ja: {
    education: "学歴",
    professional: "職務経歴",
    projects: "プロジェクト",
    certificates: "資格・受賞",
    publications: "出版物",
    skills: "スキル",
  },
  zh: {
    education: "教育背景",
    professional: "工作经历",
    projects: "项目经历",
    certificates: "证书与奖项",
    publications: "发表作品",
    skills: "技能",
  },
};

const FOOTER_LABELS: Record<string, string> = {
  en: "Curriculum vitae",
  ja: "履歴書",
  zh: "简历",
};

const ACCENT_COLORS = new Set([
  "skyblue",
  "red",
  "nephritis",
  "concrete",
  "darknight",
]);

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;
const URL_PROTOCOL_REGEX = /^https?:\/\//;
const LOGO_ID_SANITIZE_REGEX = /[^a-zA-Z0-9_-]/g;

function compact<T>(items: (T | null | undefined | false)[]): T[] {
  return items.filter(Boolean) as T[];
}

function clean(value?: unknown): string {
  if (typeof value === "string") {
    return stegaClean(value).trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function paperSize(value?: string | null): "a4" | "us-letter" {
  const normalized = clean(value)
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  if (normalized === "letter" || normalized === "us-letter") {
    return "us-letter";
  }
  if (normalized === "a4") {
    return "a4";
  }

  return "a4";
}

function accentColor(value?: string | null): string {
  const normalized = clean(value)
    .toLowerCase()
    .replace(/[\s_]+/g, "");

  if (ACCENT_COLORS.has(normalized)) {
    return normalized;
  }
  if (HEX_COLOR_REGEX.test(normalized)) {
    return normalized;
  }

  return "skyblue";
}

function sectionTitle(locale: string, section: SectionKey): string {
  return SECTION_TITLES[clean(locale)]?.[section] ?? SECTION_TITLES.en[section];
}

function densitySettings(value?: string | null) {
  switch (clean(value)) {
    case "compact":
      return {
        before_section_skip: "0pt",
        before_entry_skip: "0pt",
        before_entry_description_skip: "0pt",
      };
    case "relaxed":
      return {
        before_section_skip: "3pt",
        before_entry_skip: "3pt",
        before_entry_description_skip: "2pt",
      };
    default:
      return {
        before_section_skip: "1pt",
        before_entry_skip: "1pt",
        before_entry_description_skip: "1pt",
      };
  }
}

function typstContent(value?: string | null): string {
  return clean(value)
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/#/g, "\\#");
}

function typstString(value: string): string {
  return JSON.stringify(value);
}

function linkedContent(label?: string | null, url?: string | null): string {
  const content = typstContent(label);
  const href = clean(url);
  if (!href) {
    return content;
  }

  return `#link(${typstString(href)})[${content}]`;
}

function typstArray(values: string[]): string {
  if (values.length === 1) {
    return `(${typstString(values[0])},)`;
  }
  return `(${values.map(typstString).join(", ")})`;
}

function typstDescription(items?: string[] | null): string | null {
  const description = (items ?? []).map(clean).filter(Boolean);
  if (!description.length) {
    return null;
  }

  return `list(${description.map((item) => `[${typstContent(item)}]`).join(", ")})`;
}

function typstTags(items?: string[] | null): string | null {
  const tags = (items ?? []).map(clean).filter(Boolean);
  if (!tags.length) {
    return null;
  }
  return typstArray(tags);
}

function fileExtension(asset?: ResumeAsset, fallback = "png"): string {
  const extension = clean(asset?.asset?.extension);
  if (extension) {
    return extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "png";
  }
  const filename = clean(asset?.asset?.originalFilename);
  const filenameExtension = filename.split(".").pop();
  if (filenameExtension && filenameExtension !== filename) {
    return (
      filenameExtension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || fallback
    );
  }
  const mimeType = clean(asset?.asset?.mimeType);
  if (mimeType.includes("jpeg")) {
    return "jpg";
  }
  if (mimeType.includes("svg")) {
    return "svg";
  }
  if (mimeType.includes("webp")) {
    return "webp";
  }
  return fallback;
}

function addAsset(
  assets: Record<string, string>,
  asset: ResumeAsset | undefined,
  pathWithoutExtension: string,
  fallbackExtension = "png"
): string | null {
  const url = asset?.asset?.url;
  if (!url) {
    return null;
  }
  const path = `${pathWithoutExtension}.${fileExtension(asset, fallbackExtension)}`;
  assets[path] = url;
  return path;
}

function entryBlock(
  entry: ResumeEntry,
  logoPath?: string | null
): string | null {
  const title = clean(entry?.title);
  if (!title) {
    return null;
  }

  const description = typstDescription(entry?.description);
  const tags = typstTags(entry?.tags);
  const heading = linkedContent(title, entry?.url);
  const society = typstContent(entry?.society);

  const fields = compact<string>([
    // Brilliant CV uses the society field as the primary heading.
    `society: [${society || heading}]`,
    `title: [${society ? heading : ""}]`,
    `date: [${typstContent(entry?.date)}]`,
    `location: [${typstContent(entry?.location)}]`,
    logoPath && `logo: image(${typstString(`../${logoPath}`)})`,
    description ? `description: ${description}` : null,
    tags ? `tags: ${tags}` : null,
  ]);

  return `#cv-entry(\n  ${fields.join(",\n  ")}\n)`;
}

function roleBlock(role: ResumeRole): string | null {
  const title = clean(role?.title);
  if (!title) {
    return null;
  }

  const description = typstDescription(role?.description);
  const tags = typstTags(role?.tags);
  const fields = compact<string>([
    `title: [${linkedContent(title, role?.url)}]`,
    `date: ${typstString(clean(role?.date))}`,
    description ? `description: ${description}` : null,
    tags ? `tags: ${tags}` : null,
  ]);

  return `#cv-entry-continued(\n  ${fields.join(",\n  ")}\n)`;
}

function experienceBlock(
  entry: ResumeEntry,
  logoPath?: string | null
): string | null {
  const roles = (entry?.roles ?? []).map(roleBlock).filter(Boolean);
  const society = clean(entry?.society);

  if (!(roles.length && society)) {
    return entryBlock(entry, logoPath);
  }

  const fields = compact<string>([
    `society: [${typstContent(society)}]`,
    `location: [${typstContent(entry?.location)}]`,
    logoPath && `logo: image(${typstString(`../${logoPath}`)})`,
  ]);

  return `#cv-entry-start(\n  ${fields.join(",\n  ")}\n)\n\n${roles.join("\n\n")}`;
}

function sectionFile(
  title: string,
  entries: ResumeEntry[] | null | undefined,
  logoPaths: Map<string, string>
) {
  const blocks = (entries ?? [])
    .map((entry) => {
      const entryId = entry?._key ?? entry?._id;
      return entryBlock(entry, entryId ? logoPaths.get(entryId) : null);
    })
    .filter(Boolean);

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": cv-entry, cv-section

#cv-section(${typstString(title)})

${blocks.join("\n\n")}
`;
}

function experienceSectionFile(
  title: string,
  entries: ResumeEntry[] | null | undefined,
  logoPaths: Map<string, string>
) {
  const blocks = (entries ?? [])
    .map((entry) => {
      const entryId = entry?._key ?? entry?._id;
      return experienceBlock(entry, entryId ? logoPaths.get(entryId) : null);
    })
    .filter(Boolean);

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": cv-entry, cv-entry-continued, cv-entry-start, cv-section

#cv-section(${typstString(title)})

${blocks.join("\n\n")}
`;
}

function honorBlock(entry: ResumeEntry): string | null {
  const title = clean(entry?.title);
  if (!title) {
    return null;
  }

  const fields = compact<string>([
    `date: [${typstContent(entry?.date)}]`,
    `title: [${typstContent(title)}]`,
    entry?.issuer && `issuer: [${typstContent(entry.issuer)}]`,
    entry?.url && `url: ${typstString(clean(entry.url))}`,
    entry?.location && `location: [${typstContent(entry.location)}]`,
  ]);

  return `#cv-honor(\n  ${fields.join(",\n  ")}\n)`;
}

function honorsFile(title: string, entries: ResumeEntry[] | null | undefined) {
  const blocks = (entries ?? []).map(honorBlock).filter(Boolean);

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": cv-honor, cv-section

#cv-section(${typstString(title)})

${blocks.join("\n\n")}
`;
}

function publicationsFile(
  title: string,
  bibliographyPath: string | null,
  profile: NonNullable<ResumeData>,
  logoPaths: Map<string, string>
) {
  if (!bibliographyPath) {
    return sectionFile(title, profile.publications, logoPaths);
  }

  const bibliography = profile.publicationBibliography;
  const keys = (bibliography?.keys ?? []).map(clean).filter(Boolean);
  const style = clean(bibliography?.style) || "apa";
  const showAll = Boolean(bibliography?.showAll || keys.length === 0);
  const keyList = keys.length ? `,\n  key-list: ${typstArray(keys)}` : "";

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": cv-publication, cv-section

#cv-section(${typstString(title)})

#cv-publication(
  bib: bibliography(${typstString(`../${bibliographyPath}`)}),
  ref-style: ${typstString(style)},
  ref-full: ${showAll}${showAll ? "" : keyList},
)
`;
}

function skillsFile(title: string, skills: ResumeSkill[] | null | undefined) {
  const blocks = (skills ?? [])
    .map((skill) => {
      const type = clean(skill.type);
      const items = (skill.items ?? []).map(clean).filter(Boolean);
      if (!type || items.length === 0) {
        return null;
      }

      if (skill.display === "tags") {
        return `#cv-skill(
  type: [${typstContent(type)}],
  info: [
    ${items.map((item) => `#cv-skill-tag([${typstContent(item)}])`).join("\n    ")}
  ],
)`;
      }

      const fn = skill.level ? "cv-skill-with-level" : "cv-skill";
      const level = skill.level
        ? `,\n  level: ${Math.max(1, Math.min(5, skill.level))}`
        : "";
      return `#${fn}(
  type: [${typstContent(type)}]${level},
  info: [${items.map((item) => typstContent(item)).join(" #h-bar() ")}],
)`;
    })
    .filter(Boolean);

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": (
  cv-section, cv-skill, cv-skill-tag, cv-skill-with-level, h-bar,
)

#cv-section(${typstString(title)})

${blocks.join("\n\n")}
`;
}

function cjkFonts(locale: string): string[] | null {
  const loc = clean(locale);
  if (loc === "ja") {
    return ["IBM Plex Sans", "Noto Sans CJK JP"];
  }
  if (loc === "zh") {
    return ["IBM Plex Sans", "Noto Sans CJK SC"];
  }
  return null;
}

function metadata(
  profile: NonNullable<ResumeData>,
  locale: string,
  hasProfilePhoto: boolean,
  placeholderName: string
) {
  const layout = profile.layout ?? {};
  const contact = profile.contact ?? {};
  const cjk = cjkFonts(locale);
  const usesCJKFallback = cjk !== null;
  const density = densitySettings(layout.density);
  const displayName = clean(profile.displayName) || placeholderName;

  return {
    header_quote: clean(profile.headerQuote),
    cv_footer: FOOTER_LABELS[clean(locale)] ?? FOOTER_LABELS.en,
    layout: {
      awesome_color: accentColor(layout.accentColor),
      before_section_skip: density.before_section_skip,
      before_entry_skip: density.before_entry_skip,
      before_entry_description_skip: density.before_entry_description_skip,
      paper_size: paperSize(layout.paperSize),
      date_width: "3.6cm",
      fonts: {
        regular_fonts: cjk ?? ["IBM Plex Sans"],
        header_font: "IBM Plex Sans",
      },
      header: {
        header_align: "left",
        display_profile_photo:
          Boolean(layout.showProfilePhoto ?? true) && hasProfilePhoto,
        profile_photo_radius: "50%",
        info_font_size: "10pt",
      },
      entry: {
        display_entry_society_first: true,
        display_logo: Boolean(layout.showEntryLogos ?? true),
      },
      section: {
        title_highlight: usesCJKFallback ? "full" : "first-letters",
        title_highlight_letters: 3,
      },
      footer: {
        display_page_counter: false,
        display_footer: true,
      },
    },
    inject: {
      injected_keywords_list: profile.atsKeywords ?? [],
    },
    personal: {
      // The template's footer reads first/last directly. Give it the same name
      // as the header so it cannot silently introduce another identity source.
      first_name: displayName,
      last_name: "",
      display_name: displayName,
      info: {
        ...(contact.github ? { github: clean(contact.github) } : {}),
        ...(contact.phone ? { phone: clean(contact.phone) } : {}),
        ...(contact.email ? { email: clean(contact.email) } : {}),
        ...(contact.linkedin ? { linkedin: clean(contact.linkedin) } : {}),
        ...(contact.gitlab ? { gitlab: clean(contact.gitlab) } : {}),
        ...(contact.orcid ? { orcid: clean(contact.orcid) } : {}),
        ...(contact.researchgate
          ? { researchgate: clean(contact.researchgate) }
          : {}),
        ...(contact.homepage
          ? {
              homepage: clean(contact.homepage).replace(URL_PROTOCOL_REGEX, ""),
            }
          : {}),
        ...(contact.location ? { location: clean(contact.location) } : {}),
        ...(contact.extraInfo ? { extraInfo: clean(contact.extraInfo) } : {}),
      },
    },
  };
}

function cvEntrypoint(
  locale: string,
  sectionOrder: SectionKey[],
  profilePhotoPath: string | null
) {
  const profileDir = `profile_${locale}`;
  const photoArg = profilePhotoPath
    ? `,\n  profile-photo: image(${typstString(profilePhotoPath)})`
    : "";

  return `// Generated from Sanity resume data.
#import "${BRILLIANT_CV_IMPORT}": cv

#let metadata = toml(${typstString(`${profileDir}/metadata.toml`)})

#show: cv.with(
  metadata${photoArg}
)

${sectionOrder
  .map((section) => `#include ${typstString(`${profileDir}/${section}.typ`)}`)
  .join("\n")}
`;
}

/**
 * Builds a `TypstProject` (virtual `.typ` + `.toml` files + remote asset
 * URLs) from Sanity resume content, ready to feed into `compileTypstProject`.
 *
 * Locale-aware: section titles, CJK font fallback, and title highlight
 * strategy are selected by `locale` (en/ja/zh).
 */
export function generateTypstProject(
  profile: ResumeData,
  locale: string,
  placeholderName: string
): TypstProject {
  if (!(profile?.firstName && profile.lastName)) {
    throw new Error("Resume needs at least first name and last name.");
  }

  const profileDir = `profile_${locale}`;
  const files: Record<string, string> = {};
  const assets: Record<string, string> = {};
  const logoPaths = new Map<string, string>();

  const profilePhotoPath = addAsset(
    assets,
    profile.profilePhoto,
    "assets/avatar"
  );
  const bibliographyPath = addAsset(
    assets,
    profile.publicationBibliography?.bibFile,
    "assets/publications",
    "bib"
  );

  const collectLogos = (entries?: ResumeEntry[] | null) => {
    for (const entry of entries ?? []) {
      const entryId = entry?._key ?? entry?._id;
      if (!(entry && entryId)) {
        continue;
      }
      const path = addAsset(
        assets,
        entry.logo,
        `assets/logos/${entryId.replace(LOGO_ID_SANITIZE_REGEX, "-")}`
      );
      if (path) {
        logoPaths.set(entryId, path);
      }
    }
  };

  collectLogos(profile.experiences);
  collectLogos(profile.projects);
  collectLogos(profile.education);
  collectLogos(profile.publications);

  const sectionOrder = (profile.sectionOrder ?? DEFAULT_SECTION_ORDER)
    .map(clean)
    .filter((section): section is SectionKey =>
      DEFAULT_SECTION_ORDER.includes(section as SectionKey)
    )
    .filter((section, index, sections) => sections.indexOf(section) === index);

  files["cv.typ"] = cvEntrypoint(locale, sectionOrder, profilePhotoPath);
  files[`${profileDir}/metadata.toml`] = stringify(
    metadata(profile, locale, Boolean(profilePhotoPath), placeholderName)
  );
  files[`${profileDir}/education.typ`] = sectionFile(
    sectionTitle(locale, "education"),
    profile.education,
    logoPaths
  );
  files[`${profileDir}/professional.typ`] = experienceSectionFile(
    sectionTitle(locale, "professional"),
    profile.experiences,
    logoPaths
  );
  files[`${profileDir}/projects.typ`] = sectionFile(
    sectionTitle(locale, "projects"),
    profile.projects,
    logoPaths
  );
  files[`${profileDir}/certificates.typ`] = honorsFile(
    sectionTitle(locale, "certificates"),
    profile.certificates
  );
  files[`${profileDir}/publications.typ`] = publicationsFile(
    sectionTitle(locale, "publications"),
    bibliographyPath,
    profile,
    logoPaths
  );
  files[`${profileDir}/skills.typ`] = skillsFile(
    sectionTitle(locale, "skills"),
    profile.skills
  );

  // Might not be a valid filename but yolo (we will assume the user has a valid first/last name)
  const filenameName = [profile.firstName, profile.lastName, "resume"]
    .map(clean)
    .filter(Boolean)
    .join("-");

  return {
    files,
    assets,
    mainFile: "cv.typ",
    filename: `${filenameName}.pdf`,
  };
}
