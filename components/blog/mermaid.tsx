'use client';

import * as React from 'react';

import type { CodeBlock as TCodeBlock } from 'notion-types';
import { getTextContent } from 'notion-utils';

import '@/styles/shiki.css';

import { CopyButton } from './copy-to-clipboard-button';

/* eslint-disable tailwindcss/no-custom-classname */

export interface Format {
  use_crdt: boolean;
  code_wrap: boolean;
  code_preview_format?: 'code' | 'preview';
}

export function Mermaid({ block }: { block: TCodeBlock }) {
  const [svg, setSVG] = React.useState<string>('');
  const codeRef = React.useRef<HTMLDivElement>(null);

  const source = getTextContent(block.properties.title);
  const caption = block.properties.caption;

  React.useEffect(() => {
    if (codeRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (async () => {
                try {
                  const { initialize, render } = await import('mermaid').then(
                    (m) => m.default
                  );

                  initialize({
                    startOnLoad: false,
                    theme: 'base',
                    themeVariables: {
                      primaryColor: '#BB2528',
                      primaryTextColor: '#fff',
                      primaryBorderColor: '#7C0000',
                      lineColor: '#F8B229',
                      secondaryColor: '#006100',
                      tertiaryColor: '#fff',
                    },
                    flowchart: {
                      useMaxWidth: false,
                      htmlLabels: true,
                      curve: 'linear',
                    },
                  });

                  const { svg } = await render(
                    `mermaid-${block.id}`,
                    source,
                    // @ts-expect-error - codeRef.current here won't be null
                    codeRef.current
                  );
                  setSVG(svg);
                } catch (err) {
                  console.warn('mermaid highlight error', err);
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
        <div className='flex flex-none items-center px-4 py-1'>mermiad</div>
        <div className='flex flex-auto items-center border-l border-[#bdbebe] dark:border-[#373838]'>
          <div className='flex flex-auto items-center justify-end space-x-4 px-4'>
            <CopyButton
              value={source}
              className='absolute right-1 top-1 group-hover:visible'
            />
          </div>
        </div>
      </div>

      <div className='notion-code'>
        <div
          ref={codeRef}
          className='language-mermaid'
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {caption && (
        <figcaption className='notion-asset-caption'>{caption}</figcaption>
      )}
    </div>
  );
}
