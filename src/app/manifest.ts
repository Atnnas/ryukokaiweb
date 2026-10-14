import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ryoku Kai Dojo • Karate Do',
    short_name: 'Ryoku Kai',
    description: 'Dojo oficial de Karate Do tradicional y alta competencia Ryoku Kai. Rutinas, kata y kumite.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0F1D',
    theme_color: '#0A0F1D',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
