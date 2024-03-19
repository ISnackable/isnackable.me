'use client';

import React from 'react';

import { SparklesCore } from '@/components/ui/sparkles';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { name } from '@/lib/config';

const words = [
  {
    text: "I'm",
  },
  {
    text: 'a',
  },
  {
    text: 'cybersecurity',
  },
  {
    text: '&',
  },
  {
    text: 'computer',
  },
  {
    text: 'science',
  },
  {
    text: 'student',
    className: 'text-blue-500 dark:text-blue-500',
  },
];

export function Hero() {
  return (
    <div className='flex h-80 w-full flex-col items-center justify-center overflow-hidden rounded-md'>
      <h1 className='relative z-20 text-center text-5xl font-bold text-foreground md:text-7xl lg:text-9xl'>
        {name || 'DEFAULT NAME'}
      </h1>
      <div className='relative h-10 w-[40rem]'>
        {/* Gradients */}
        <div className='absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm' />
        <div className='absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
        <div className='absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm' />
        <div className='absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent' />

        {/* Core component */}
        <SparklesCore
          background='transparent'
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className='size-full'
          particleColor='#FFFFFF'
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className='absolute inset-0 size-full [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]'></div>
      </div>

      <div className='flex h-40 flex-col items-center justify-center '>
        <TypewriterEffect
          words={words}
          className='w-5/6 whitespace-pre-line break-words'
        />
      </div>
    </div>
  );
}
