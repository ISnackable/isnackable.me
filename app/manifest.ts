import { MetadataRoute } from 'next';

import { description, name } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: name,
    short_name: 'Next.js App',
    description: description,
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#09090b',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
