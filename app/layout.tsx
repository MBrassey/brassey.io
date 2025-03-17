import type React from "react"
import "@/app/globals.css"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Matt Brassey | Engineering Manager",
  description: "Engineering Manager specializing in blockchain infrastructure, multi-chain architecture, and Web3 technology. Expert in EVM chains (Ethereum, Polygon, Avalanche, Arbitrum), L1 protocols (Solana, Cardano, Cosmos, NEAR), and ZK chains (Aleo, zkSync). Specialized in custom node configuration, consensus management, full-node deployments, chain data indexing, and scalable blockchain API gateways with Node.js, Next.js, Web3.js, and Ethers.js. Skilled in microservices, backend architecture, on-chain data analytics, and DevOps, including containerization, cloud provisioning, and observability with Grafana and Prometheus. Experienced in Web3 frontend development with React, TypeScript, Tailwind CSS, and WalletConnect. Engineering at Hivemind Capital & Blueprint. Brassey, Matt Brassey, Matthew Brassey, Matthew A. Brassey",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${jetbrainsMono.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

