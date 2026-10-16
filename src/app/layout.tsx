import type { Metadata } from "next";
import { headers } from "next/headers";
import { serverEnvironment } from "@/server/environment";
export const dynamic = "force-dynamic";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { site, absoluteUrl } from "@/lib/site";
import "./globals.css";
const poppins = localFont({
  src: "../../public/fonts/poppins-regular.woff2",
  variable: "--font-poppins",
  weight: "400",
  display: "swap",
});
const playfair = localFont({
  src: "../../public/fonts/playfair-display-regular.woff2",
  variable: "--font-playfair",
  weight: "400",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Havenfield — Room for a different rhythm", template: "%s | Havenfield" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Havenfield — Homes & perspectives",
    description: site.description,
    url: site.url,
    images: [
      {
        url: absoluteUrl("/brand/social.png"),
        width: 1200,
        height: 630,
        alt: "Havenfield — Room for a different rhythm",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/brand/mark.svg", type: "image/svg+xml" },
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand/icon-180.png",
  },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  serverEnvironment();
  await headers();
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased selection:bg-brand/20 [&_a]:outline-offset-4 [&_button]:outline-offset-4 [&_input]:outline-offset-2 [&_textarea]:outline-offset-2">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-24 bg-ink px-5 py-3 text-sm text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
