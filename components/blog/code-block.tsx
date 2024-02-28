/* eslint-disable tailwindcss/no-custom-classname */
'use client';

import * as React from 'react';

import type { CodeBlock as TCodeBlock } from 'notion-types';
import { getBlockTitle } from 'notion-utils';
import { useNotionContext } from 'react-notion-x';

import { cn } from '@/lib/utils';

import { CopyButton } from './copy-to-clipboard-button';

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
    block.properties?.language?.[0]?.[0] || defaultLanguage
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
    <>
      <div
        className={cn('notion-code', 'group relative', className)}
        ref={codeRef}
      >
        <CopyButton
          value={content}
          className='invisible absolute right-3 top-3 group-hover:visible'
        />

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
    </>
  );
};
