import { cache } from 'react';

import type { HighlighterGeneric } from 'shiki/core';
import {
  createSingletonShorthands,
  createdBundledHighlighter,
} from 'shiki/core';
import getWasm from 'shiki/wasm';

import type { BundledLanguage } from '@/lib/langs-bundle-shiki';
import { bundledLanguages } from '@/lib/langs-bundle-shiki';
import type { BundledTheme } from '@/lib/themes-bundle-shiki';
import { bundledThemes } from '@/lib/themes-bundle-shiki';

export type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

/**
 * Initiate a highlighter instance and load the specified languages and themes.
 * Later it can be used synchronously to highlight code.
 *
 * Importing this function will bundle all languages and themes.
 * @see https://shiki.style/guide/bundles#shiki-bundle-web
 *
 * For granular control over the bundle, check:
 * @see https://shiki.style/guide/install#fine-grained-bundle
 */
export const getHighlighter = /* @__PURE__ */ cache(
  createdBundledHighlighter<BundledLanguage, BundledTheme>(
    bundledLanguages,
    bundledThemes,
    getWasm
  )
);

export const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  getHighlighter
);
