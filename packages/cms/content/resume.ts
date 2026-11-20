import type { SanityImageCrop, SanityImageHotspot } from "../sanity.types";

/**
 * Resume content shapes — the structure `generateTypstProject` expects.
 *
 * These mirror the GROQ projection in `@repo/cms/queries.ts` (resumeQuery).
 * The CMS package re-exports `ResumeData` as a type-only import so the
 * data shape has a single source of truth here.
 */
export type ResumeAsset = {
  alt?: string | null;
  crop?: SanityImageCrop | null;
  hotspot?: SanityImageHotspot | null;
  asset?: {
    _id?: string | null;
    url?: string | null;
    mimeType?: string | null;
    extension?: string | null;
    originalFilename?: string | null;
  } | null;
} | null;

export type ResumeRole = {
  _key?: string | null;
  title?: string | null;
  date?: string | null;
  url?: string | null;
  description?: string[] | null;
  tags?: string[] | null;
} | null;

export type ResumeEntry = {
  _id?: string | null;
  _key?: string | null;
  _type?: string | null;
  title?: string | null;
  society?: string | null;
  issuer?: string | null;
  date?: string | null;
  location?: string | null;
  url?: string | null;
  description?: string[] | null;
  tags?: string[] | null;
  logo?: ResumeAsset;
  roles?: ResumeRole[] | null;
} | null;

export interface ResumeSkill {
  _key?: string;
  display?: string | null;
  items?: string[] | null;
  level?: number | null;
  type?: string | null;
}

export type ResumeData = {
  _id?: string;
  _updatedAt?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  headerQuote?: string | null;
  contact?: {
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    homepage?: string | null;
    github?: string | null;
    linkedin?: string | null;
    gitlab?: string | null;
    orcid?: string | null;
    researchgate?: string | null;
    extraInfo?: string | null;
  } | null;
  sectionOrder?: string[] | null;
  skills?: ResumeSkill[] | null;
  atsKeywords?: string[] | null;
  layout?: {
    accentColor?: string | null;
    paperSize?: string | null;
    density?: string | null;
    showProfilePhoto?: boolean | null;
    showEntryLogos?: boolean | null;
  } | null;
  profilePhoto?: ResumeAsset;
  experiences?: ResumeEntry[] | null;
  projects?: ResumeEntry[] | null;
  education?: ResumeEntry[] | null;
  certificates?: ResumeEntry[] | null;
  publications?: ResumeEntry[] | null;
  publicationBibliography?: {
    style?: string | null;
    keys?: string[] | null;
    showAll?: boolean | null;
    bibFile?: ResumeAsset;
  } | null;
} | null;
