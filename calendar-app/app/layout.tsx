import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rolling Wheels Kalender',
  description: 'Standalone Kalenderansicht ohne Header und Footer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
