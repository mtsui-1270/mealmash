import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MealMash',
  description: 'Your pixel-powered recipe companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scanlines">{children}</body>
    </html>
  );
}