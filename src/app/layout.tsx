import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Gnarhub - Get Filmed on the Mountain',
  description: 'Connect with riders who can keep up and capture your best clips.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
