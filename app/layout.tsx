import type React from "react"
import "@/app/globals.css"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Matt Brassey | Blockchain Infrastructure Architect & Engineering Manager",
  description:
    "Engineering Manager and Blockchain Infrastructure Architect with 15+ years of DevOps expertise and 5+ years in blockchain. Operating 40+ validators across Solana, Ethereum, Avalanche, Audius, and Algorand. Leading AI-augmented development at Blueprint Infrastructure. Specializing in validator operations, multi-chain architecture, staking infrastructure, and decentralized systems. Matt Brassey, Matthew Brassey, Brassey.Crypto.",
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
