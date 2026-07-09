import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import InstallPrompt from '@/components/InstallPrompt';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'ITHECS — Team e-sport',
  description:
    'Site officiel de la team e-sport ITHECS : calendriers Matcherino & Scrim, disponibilités, résultats et actualités.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ITHECS',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d1b3e',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <html lang="fr">
      <body className="font-sans">
        <Navbar user={user} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <InstallPrompt />
        <footer className="mt-16 border-t border-steel/50 py-8 text-center text-sm text-slate-500">
          <p>
            <span className="font-bold text-slate-300">ITHECS</span> — We play to win.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Team ITHECS.</p>
        </footer>
      </body>
    </html>
  );
}
