import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

const siteUrl = "https://brassey.io"
const siteTitle = "Matt Brassey | Blockchain Infrastructure Architect & Engineering Manager"
const siteDescription =
  "Engineering Manager and Blockchain Infrastructure Architect with 15+ years of DevOps expertise and 5+ years in blockchain. Operating 50+ validators across Solana, Ethereum, Avalanche, Audius, Algorand, Canton, XDC, and Babylon. Leading AI-augmented development at Blueprint Infrastructure. Specializing in validator operations, multi-chain architecture, staking infrastructure, and distributed systems."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Matt Brassey",
  },
  description: siteDescription,
  applicationName: "Matt Brassey",
  authors: [{ name: "Matt Brassey", url: siteUrl }],
  creator: "Matt Brassey",
  publisher: "Matt Brassey",
  generator: "Next.js",
  keywords: [
    "Matt Brassey",
    "Matthew Brassey",
    "Brassey.Crypto",
    "Blueprint Infrastructure",
    "Blockchain Infrastructure Architect",
    "Engineering Manager",
    "Validator Operations",
    "Solana validator",
    "Ethereum validator",
    "Avalanche validator",
    "Audius node operator",
    "Algorand participation node",
    "Canton Network validator",
    "Babylon Bitcoin staking",
    "Firedancer",
    "MEV-boost",
    "Jito MEV",
    "Solentic",
    "CC Ledger",
    "agtop",
    "Rust",
    "MCP server",
    "OpenAPI 3.1",
    "AI agent infrastructure",
    "DevOps",
    "Bare-metal infrastructure",
    "Staking infrastructure",
    "Distributed systems",
    "Multi-chain architecture",
  ],
  category: "technology",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Matt Brassey",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/mbrassey.jpg",
        width: 1200,
        height: 630,
        alt: "Matt Brassey — Blockchain Infrastructure Architect & Engineering Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/mbrassey.jpg"],
    creator: "@mbrassey",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Matt Brassey",
  alternateName: ["Matthew Brassey", "Brassey.Crypto"],
  url: siteUrl,
  image: `${siteUrl}/mbrassey.jpg`,
  jobTitle: "Engineering Manager & Blockchain Infrastructure Architect",
  worksFor: {
    "@type": "Organization",
    name: "Blueprint, inc",
    url: "https://theblueprint.xyz",
  },
  sameAs: [
    "https://github.com/MBrassey",
    "https://www.linkedin.com/in/mbrassey/",
    "https://solentic.theblueprint.xyz",
    "https://ccledger.theblueprint.xyz",
  ],
  knowsAbout: [
    "Blockchain Infrastructure",
    "Validator Operations",
    "Solana",
    "Ethereum",
    "Avalanche",
    "Canton Network",
    "Audius",
    "Algorand",
    "Babylon",
    "DevOps",
    "Bare-metal Infrastructure",
    "Distributed Systems",
    "MCP Servers",
    "OpenAPI",
    "Rust",
    "TypeScript",
    "Spring Boot",
    "Java 21",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${jetbrainsMono.className} dark`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
