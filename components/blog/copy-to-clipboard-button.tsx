'use client';

import * as React from 'react';

import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  src?: string;
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value);
}

export function CopyButton({
  value,
  className,
  src,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='icon'
            variant='ghost'
            className={cn(
              'relative z-10 h-6 w-6 rounded-md text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-opacity-50 dark:text-zinc-50 dark:hover:bg-zinc-700 dark:hover:text-zinc-50',
              className
            )}
            onClick={() => {
              copyToClipboardWithMeta(value);
              setHasCopied(true);
            }}
            {...props}
          >
            <span className='sr-only'>Copy</span>
            {hasCopied ? (
              <CheckIcon className='size-3' />
            ) : (
              <CopyIcon className='size-3' />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
