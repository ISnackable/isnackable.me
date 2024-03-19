'use client';

import * as React from 'react';

import type { CodeBlock as TCodeBlock } from 'notion-types';
import { getBlockTitle, getTextContent } from 'notion-utils';
import { useNotionContext } from 'react-notion-x';

import { cn } from '@/lib/utils';
import '@/styles/shiki.css';

import { CopyButton } from './copy-to-clipboard-button';

/* eslint-disable tailwindcss/no-custom-classname */

export interface Format {
  use_crdt: boolean;
  code_wrap: boolean;
  code_preview_format?: 'code' | 'preview';
}

// Notion only supports these languages
const SUPPORTED_LANGUAGES = {
  abap: 'abap',
  // agda: '',
  // arduino: '',
  assembly: 'asm',
  bash: 'shellscript',
  // basic: '',
  // bnf: '',
  c: 'c',
  'c#': 'csharp',
  'c++': 'cpp',
  clojure: 'clojure',
  coffeescript: 'coffee',
  // coq: '',
  css: 'css',
  dart: 'dart',
  // dhall: '',
  diff: 'diff',
  docker: 'docker',
  // ebnf: '',
  elixir: 'elixir',
  elm: 'elm',
  erlang: 'erlang',
  'f#': 'fsharp',
  // flow: '',
  fortran: 'fortran-fixed-form',
  gherkin: 'gherkin',
  glsl: 'glsl',
  go: 'go',
  graphql: 'graphql',
  groovy: 'groovy',
  haskell: 'haskell',
  html: 'html',
  // idris: '',
  java: 'java',
  javascript: 'javascript',
  json: 'json',
  julia: 'jinja',
  kotlin: 'kotlin',
  // 'llvm ir': '',
  latex: 'latex',
  less: 'less',
  lisp: 'lisp',
  // livescript: '',
  lua: 'lua',
  makefile: 'make',
  markdown: 'markdown',
  // markup: '',
  // mathematica: '',
  matlab: 'matlab',
  mermaid: 'mermaid',
  // 'notion formula': '',
  nix: 'nix',
  'objective-c': 'objective-c',
  ocaml: 'ocaml',
  'plain text': 'plain',
  pascal: 'pascal',
  perl: 'perl',
  php: 'php',
  powershell: 'powershell',
  prolog: 'prolog',
  // protobuf: '',
  purescript: 'purescript',
  python: 'python',
  r: 'r',
  // racket: '',
  // reason: '',
  ruby: 'ruby',
  rust: 'rust',
  sass: 'sass',
  scala: 'scala',
  scheme: 'scheme',
  scss: 'scss',
  shell: 'shellscript',
  solidity: 'solidity',
  sql: 'sql',
  swift: 'swift',
  toml: 'toml',
  typescript: 'typescript',
  // 'vb.net': '',
  'visual basic': 'vb',
  verilog: 'verilog',
  vhdl: 'vhdl',
  webassembly: 'wasm',
  xml: 'xml',
  yaml: 'yaml',
};

// const SHIKI_TRANSFORMER_CLASSMAP = {
//   '++': 'diff add',
//   '--': 'diff remove',
//   highlight: 'highlighted',
//   hl: 'has-highlighted',
//   error: ['highlighted', 'error'],
//   warning: ['highlighted', 'warning'],
//   focus: 'focused',
// };

// function escapeRegExp(str: string) {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// const SHIKI_TRANSFORMERS_REGEX = new RegExp(
//   `(\\s*)(?://|/\\*|<!--|#)\\s+\\[!code (${Object.keys(SHIKI_TRANSFORMER_CLASSMAP).map(escapeRegExp).join('|')})(:\\d+)?\\](\\s*)(?:\\*/|-->)?`,
//   'g'
// );
const SHIKI_TRANSFORMERS_REGEX = new RegExp(
  `(\\s*)(?://|/\\*|<!--|#)\\s+\\[!code (?:word:)?(\\+\\+|--|\\w+)(:\\d+)?\\](\\s*)(?:\\*/|-->)?`,
  'g'
);

export const CodeBlock: React.FC<{
  block: TCodeBlock;
  defaultLanguage?: string;
  className?: string;
}> = ({ block, defaultLanguage = 'javascript', className }) => {
  const [codeHtml, setCodeHtml] = React.useState<string | null>(null);
  const codeRef = React.useRef<HTMLDivElement>(null);

  const { recordMap } = useNotionContext();
  const content = getBlockTitle(block, recordMap);
  const _language = (
    getTextContent(block.properties?.language) || defaultLanguage
  ).toLowerCase();
  const language =
    SUPPORTED_LANGUAGES[_language as keyof typeof SUPPORTED_LANGUAGES] ||
    'plain';
  const caption = block.properties.caption;

  React.useEffect(() => {
    if (codeRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (async () => {
                const { getHighlighter } = await import('@/lib/shiki');
                const {
                  transformerNotationDiff,
                  transformerNotationHighlight,
                  transformerNotationWordHighlight,
                  transformerNotationFocus,
                } = await import('@shikijs/transformers');

                if (typeof window !== 'undefined') {
                  const highlighter = await getHighlighter({
                    themes: ['github-light', 'github-dark'],
                    langs: ['javascript', language as any],
                  });

                  await highlighter.loadLanguage(language as any);

                  const html = highlighter.codeToHtml(content, {
                    lang: language,
                    themes: {
                      light: 'github-light',
                      dark: 'github-dark',
                    },
                    defaultColor: false,
                    transformers: [
                      transformerNotationDiff(),
                      transformerNotationHighlight(),
                      transformerNotationWordHighlight(),
                      transformerNotationFocus(),
                    ],
                  });

                  setCodeHtml(html);
                }
              })();

              observer.disconnect();
            }
          });
        },
        // 5. Add root margin so that we can highlight the code in advance before it shows to the screen.
        {
          rootMargin: '100%',
        }
      );

      observer.observe(codeRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`notion-code-wrapper notion-block-${block.id} w-full`}>
      <div className='notion-code-heaader relative flex w-full rounded-t-[3px] border border-[#bdbebe] text-xs leading-6 text-slate-400 dark:border-[#373838]'>
        <div className='flex flex-none items-center px-4 py-1'>{language}</div>
        <div className='flex flex-auto items-center border-l border-[#bdbebe] dark:border-[#373838]'>
          <div className='flex flex-auto items-center justify-end space-x-4 px-4'>
            <CopyButton
              value={content.replace(SHIKI_TRANSFORMERS_REGEX, '$4')}
              className='absolute right-1 top-1 group-hover:visible'
            />
          </div>
        </div>
      </div>

      <div className={cn('notion-code', className)} ref={codeRef}>
        {!codeHtml ? (
          <div className={`language-${language}`}>
            <pre>
              <code>{content}</code>
            </pre>
          </div>
        ) : (
          <div
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: codeHtml }}
          />
        )}
      </div>

      {caption && (
        <figcaption className='notion-asset-caption'>{caption}</figcaption>
      )}
    </div>
  );
};
