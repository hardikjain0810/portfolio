import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${site.name} — ${site.role}`;
const description = site.tagline;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s — ${site.name}`,
  },
  description,
  keywords: [
    "AI Engineer",
    "Machine Learning Engineer",
    "LLM",
    "RAG",
    "PyTorch",
    "FastAPI",
    "Python",
    "Hyderabad",
    site.name,
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    title,
    description,
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: site.url },
};

export const viewport: Viewport = {
  themeColor: "#060709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* Structured data helps Google show your name, role and links in search results. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressCountry: "IN",
  },
  sameAs: [site.socials.github, site.socials.linkedin],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Tells Next.js to keep route changes instant despite smooth scrolling
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Entrance animations start at opacity:0 and are revealed by JavaScript.
          If a visitor has JS blocked, that would leave the page looking empty,
          so force every animated element visible in that case.
        */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          // Static object we control, so this is safe.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
