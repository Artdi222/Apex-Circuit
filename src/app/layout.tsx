import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export async function generateMetadata(): Promise<Metadata> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/settings/public`, { cache: 'no-store' });
    const result = await res.json();
    const settings = result.data || [];
    
    const siteName = settings.find((s: any) => s.key === 'site.name')?.value || 'APEX Circuit Rentals';
    const siteDesc = settings.find((s: any) => s.key === 'site.description')?.value || 'Premium racing track rental and session booking platform';

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: siteDesc,
    };
  } catch (e) {
    return {
      title: {
        default: 'APEX Circuit Rentals',
        template: '%s | APEX Circuit Rentals',
      },
      description: 'Premium racing track rental and session booking platform',
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="light">
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
