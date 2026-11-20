import type { SchemaTypeDefinition } from "sanity";
import { moduleSchemas } from "../modules/schema";
import { author } from "./documents/author";
import { legalPage } from "./documents/legal-page";
import { page } from "./documents/page";
import { post } from "./documents/post";
import { project } from "./documents/project";
import { resume } from "./documents/resume";
import { settings } from "./documents/settings";
import { aboutSection } from "./objects/about-section";
import { blockContent } from "./objects/block-content";
import {
  heroSection,
  projectsSection,
  writingSection,
} from "./objects/home-content";
import { seo } from "./objects/seo";

/**
 * Schema registry. Order doesn't matter — Sanity wires references up by name.
 * The Studio reads this via `sanity.config.ts`; TypeGen reads it via
 * `sanity schema extract`.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  page,
  project,
  author,
  legalPage,
  settings,
  resume,

  // Objects (embedded, not independently listed)
  seo,
  blockContent,
  heroSection,
  aboutSection,
  projectsSection,
  writingSection,
  ...moduleSchemas,
];
