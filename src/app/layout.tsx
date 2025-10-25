
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { useTheme } from '@/hooks/use-theme';
import { useEffect } from 'react';

// This is a temporary solution for metadata until we can generate it dynamically
// export const metadata: Metadata = {
//   title: 'Casa Organizzata',
//   description: 'Organize tudo que existe em sua casa.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();

  useEffect(() => {
    document.title = 'Casa Organizzata';
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', 'Organize tudo que existe em sua casa.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Organize tudo que existe em sua casa.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
          {children}
          <Toaster />
      </body>
    </html>
  );
}
