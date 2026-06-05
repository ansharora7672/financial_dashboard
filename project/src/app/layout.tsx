import "./globals.css";
import { Barlow, Montserrat } from 'next/font/google'
import type { Metadata } from 'next'

// Barlow: used for headings and titles (acc to Figma)
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-barlow',
})

// Montserrat: used for body text and other elements (acc to Figma)
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: "Circuit Labs Financial Dashboard",
  description: "Financial dashboard for Circuit Labs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${montserrat.variable}`}>{children}</body>
    </html>
  );
}
