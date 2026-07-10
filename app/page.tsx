"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView, AnimatePresence, MotionConfig, useScroll, useSpring } from "framer-motion"
import { Command as CmdK } from "cmdk"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Command as CommandIcon,
  Copy,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  Github,
  Layers,
  Linkedin,
  Mail,
  Menu,
  Network,
  Server,
  Shield,
  Terminal,
  Users,
  X,
  Zap,
} from "lucide-react"
import CountUp from "react-countup"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// =========================================================
// DATA
// =========================================================

const navItems = [
  { id: "infrastructure", label: "Infrastructure" },
  { id: "ai", label: "AI Dev" },
  { id: "experience", label: "Experience" },
  { id: "expertise", label: "Expertise" },
  { id: "projects", label: "Projects" },
  { id: "credentials", label: "Credentials" },
  { id: "recommendations", label: "Feedback" },
  { id: "activity", label: "Activity" },
  { id: "contact", label: "Contact" },
]

interface InfraNode {
  name: string
  network: string
  type: string
  description: string
  links?: { label: string; url: string }[]
  metric?: string
  count?: number
  logo?: string
}

const infrastructureNodes: InfraNode[] = [
  {
    name: "Solana Jito Validator",
    network: "Solana",
    type: "Validator",
    logo: "/logos/solana.svg",
    description:
      "High-performance bare-metal validator on the DoubleZero network, running a Jito BAM configuration with zero-downtime upgrades. Receiving stake delegations from Jito, DoubleZero, JPool, Marinade, The Vault, and the Solana Foundation.",
    links: [
      { label: "Blueprint Status", url: "https://validator.info/solana/2Wf9V9rPeVRUTfmWdPedCJuWVr6MFfyLuigEq42DuMDc" },
      { label: "SolanaBeach", url: "https://solanabeach.io/validator/528hi3StRe7uGjt99d35myh95JPc2MqBEHTPYcEhqMg5" },
    ],
    metric: "~6% APY",
  },
  {
    name: "Ethereum Max Whale Validator",
    network: "Ethereum",
    type: "Validator",
    logo: "/logos/ethereum.svg",
    description:
      "Enterprise-grade beacon chain validator at the 2048 ETH maximum effective balance (EIP-7251) with MEV boost.",
    links: [
      { label: "Validator", url: "https://beaconcha.in/validator/0x8a132f062776bf0bc497efb5caf075fb674dd7e500a4afcd78ad04d916b0c4ea35490f96a405ecaf00cbc59b5f2126e8" },
    ],
    metric: "2048 ETH",
  },
  {
    name: "Avalanche Validators",
    network: "Avalanche",
    type: "Validator",
    logo: "/logos/avalanche.svg",
    description:
      "Fleet of 8 Avalanche validators under infrastructure contract with Hivemind Capital Partners. Operating and maintaining all validators that the AVAX One treasury stakes to for rewards. Supporting 13.9M+ AVAX holdings.",
    links: [
      { label: "AVAX One Analytics", url: "https://analytics-avaxone.theblueprint.xyz" },
      { label: "va-1", url: "https://subnets.avax.network/validators/NodeID-2vzqhwQuGsyHsK5MpsZ5Z6ie4bqWqJnn9" },
      { label: "va-2", url: "https://subnets.avax.network/validators/NodeID-LiC9NDMWBoPmnwjGfEFKR2wBwyRJ5we7Y" },
      { label: "oh-1", url: "https://subnets.avax.network/validators/NodeID-N4bXacP2FXEKEwH9ZspMmoCfiQ2ceyTZT" },
      { label: "oh-2", url: "https://subnets.avax.network/validators/NodeID-9cFYF35nTK7Jv58i491Yj2wKVW9oY9yZW" },
      { label: "ca-1", url: "https://subnets.avax.network/validators/NodeID-6HTKn9FJ52yTaWGatYkxhJkapGDn3aTeW" },
      { label: "ca-2", url: "https://subnets.avax.network/validators/NodeID-5PMVUmhsEw8vnrzdjFgC2xue7dTDTY8qB" },
      { label: "or-1", url: "https://subnets.avax.network/validators/NodeID-BSDn9cwxnNdJLjNj1pHKt6yek96fYKRSr" },
      { label: "or-2", url: "https://subnets.avax.network/validators/NodeID-EFHu9didDPWweR3XG8A67L9vzdth4UZ8R" },
    ],
    metric: "$139M+ NAV",
    count: 8,
  },
  {
    name: "Audius Validators",
    network: "Audius",
    type: "Validator",
    logo: "/logos/audius.svg",
    description:
      "17-node validator fleet supporting the decentralized music platform. Hosting media content and earning 13,000+ AUDIO tokens weekly.",
    links: [
      { label: "Operator Dashboard", url: "https://dashboard.audius.org/#/services/operator/0x68f656d19AC6d14dF209B1dd6E543b2E81d53D7B" },
    ],
    metric: "13K+ AUDIO/wk",
    count: 17,
  },
  {
    name: "Algorand Participation Nodes",
    network: "Algorand",
    type: "Participation",
    logo: "/logos/algorand.svg",
    description:
      "Four participation nodes contributing to Algorand's Pure Proof-of-Stake consensus mechanism and network security.",
    links: [
      { label: "Node 1", url: "https://allo.info/account/4V5SSKSAWZJYXFXKY42TWPLOJL5K553MY52FEBA2TGBXXOGD6Y5DWE6WSM" },
      { label: "Node 2", url: "https://allo.info/account/FTG3T4W7FY4X2EDHMZ6Y5DFQTXIOFAMITRYYDASQIXXS6W3AEH7ZOSSGBA" },
      { label: "Node 3", url: "https://allo.info/account/KN5T3OPNYGO2QO2ES7SH377WFMYPUBOT3RU37ESOCCWYOMQ7SAWFTHXBJ4" },
      { label: "Node 4", url: "https://allo.info/account/5PBRG5UQEJSTS7UACFBLFKIJYTLYKOJZXJQIGZFBQANKMU54FOIFYNQO54" },
    ],
    count: 4,
  },
  {
    name: "Canton Validator",
    network: "Canton",
    type: "Validator",
    logo: "/logos/canton.svg",
    description:
      "Canton Network validator supporting the enterprise-grade blockchain for synchronized financial markets. Hosts the full-genesis Canton Coin indexing pipeline and scan endpoint powering CCScan (ccscan.xyz).",
    links: [
      { label: "CCScan", url: "https://ccscan.xyz" },
      { label: "CantonScan", url: "https://www.cantonscan.com/party/blueprint-validator-1::1220daab58adcae026bd2ca7ad95014f678bda3ce2a6f91b744cf3ec3d87f09deeac" },
    ],
  },
]

interface Project {
  title: string
  subtitle: string
  description: string
  tech: string[]
  url: string
}

const projects: Project[] = [
  {
    title: "CCScan",
    subtitle: "Canton Network Explorer & Chain API",
    description:
      "Full-history Canton Network explorer and chain API — every Canton Coin transaction since genesis, served from a custom indexer that transforms the Super Validator Scan API's global feed into a normalized per-party PostgreSQL index (324M+ rows, seconds behind chain head) on Blueprint validator infrastructure. 20 public REST endpoints with deterministic keyset cursors, trigram party search, live Scan pass-through for balances and ANS names, metered anonymous-to-enterprise key tiers, and Stripe billing.",
    tech: ["Canton", "Python", "Flask", "PostgreSQL", "OpenAPI 3.1", "Stripe", "REST API", "Vanilla JS"],
    url: "https://ccscan.xyz",
  },
  {
    title: "agtop",
    subtitle: "Terminal UI for AI Agent Monitoring",
    description:
      "Process monitor for AI coding agents — like top, but for Claude Code, OpenAI Codex, Aider, Block Goose, and Google Gemini. Reads /proc plus on-disk session transcripts to surface CPU, RSS, in-flight tools and subagents, token usage, estimated cost, and context-window fill. Native FFI on macOS and Windows, with distribution via Cargo, Homebrew, apt, winget, AUR, FreeBSD pkg, and npm.",
    tech: ["Rust", "Ratatui", "sysinfo", "Cargo", "FFI", "TUI", "Cross-Platform"],
    url: "https://github.com/MBrassey/agtop",
  },
  {
    title: "CC Ledger",
    subtitle: "Canton Network Infrastructure API",
    description:
      "Full-stack Canton blockchain platform with 14 REST endpoints, 14 MCP tools, and 7 immutable action types (attest, transfer, lock, mint, settle). Self-service API key registration, CCL rewards token economy, and a gRPC ledger connection to Canton MainNet. Approved by the Canton Foundation as a featured Canton Network application — listed in the official Canton app directory.",
    tech: ["Canton", "Daml", "Spring Boot", "Java 21", "PostgreSQL", "gRPC", "MCP", "OpenAPI 3.1"],
    url: "https://ccledger.theblueprint.xyz",
  },
  {
    title: "Solentic",
    subtitle: "First Agentic Solana Staking Infrastructure",
    description:
      "The only native Solana staking platform purpose-built for AI agents. 30 REST endpoints, 26 MCP tools, A2A agent card with 13 skills, and custom OpenAPI 3.1 spec. Zero-custody architecture returning unsigned transactions for client-side signing. On-chain memo attribution, SHA-256 source verification, and ~6% APY with Jito MEV boost. Compatible with Claude, LangChain, CrewAI, ElizaOS, OpenClaw, and any HTTP-capable agent.",
    tech: ["Solana", "TypeScript", "MCP", "OpenAPI 3.1", "A2A", "Jito MEV", "REST API"],
    url: "https://solentic.theblueprint.xyz",
  },
  {
    title: "Base Dashboard",
    subtitle: "Web3 Explorer & Wallet Tools",
    description:
      "Base-native wallet dashboard with MetaMask, Coinbase Wallet, WalletConnect v2, Brave/Phantom injected, and Safe support. Basename + avatar resolution via direct L2 Resolver reads, send flow for native ETH and ERC-20s (wallet-signed, no CDP key), QR-based receive modal, NFT and token galleries with client-side spam heuristics, and Coinbase identity socials.",
    tech: ["Next.js 16", "React 19", "wagmi", "viem", "Alchemy SDK", "OnchainKit", "TypeScript"],
    url: "https://base.brassey.io",
  },
  {
    title: "TossUp",
    subtitle: "Decentralized Betting Platform",
    description:
      "Fully decentralized betting platform using Chainlink VRF for provably fair, verifiable on-chain randomness. Solidity smart contracts on Ethereum handle wagers and payouts end-to-end, while the React + Web3.js frontend is pinned to IPFS and served through Fleek for fully decentralized hosting, with Truffle driving contract compilation, testing, and deployment.",
    tech: ["Solidity", "Chainlink VRF", "IPFS", "React", "Web3.js", "Truffle"],
    url: "https://mbrassey-toss-up.on.fleek.co",
  },
  {
    title: "Waviii",
    subtitle: "ERC-20 Token Ecosystem",
    description:
      "Fully decentralized ERC-20 token deployed to Ethereum Mainnet with integrated Web3 wallet, swap, and CoinGecko-backed price dashboard. Fixed 1/100 ETH peg enforced by a mint-on-swap contract, unified buy/sell card with approve→sell state machine, activity table pulling Transfer events directly from chain, EIP-1193 MetaMask integration with chain guard, and a single WalletProvider React context as the app's source of truth.",
    tech: ["Solidity", "React", "Web3.js", "OpenZeppelin", "CoinGecko", "Chart.js", "Vercel"],
    url: "https://waviii.io",
  },
]

const experience = [
  {
    title: "Engineering Manager",
    company: "Blueprint, Inc",
    location: "Remote | NYC, NY",
    period: "2023 — Present",
    description:
      "Lead for blockchain infrastructure and staking operations at Blueprint, a Hivemind Capital venture. Operating and maintaining profitable validator fleets across Solana, Ethereum, Avalanche, Algorand, Audius, Canton, Tezos, Polkadot, XDC, and Babylon — monitoring consensus health, responding to network events, and ensuring maximum uptime across 50+ nodes.",
    highlights: [
      "Operating profitable mainnet validator fleets across 8 distinct L1s with $500M+ staked AUM — Solana (Jito), Ethereum (MEV-boosted), Avalanche (8-node fleet for AVAX One treasury), Algorand, Audius (17 nodes), Canton, XDC, and Babylon (Bitcoin staking)",
      "Built deploy, upgrade, identity migration, and resync primitives for AI tooling — enabling Claude Code and OpenClaw agents to manage validator lifecycle operations",
      "Designed and implemented microservice architecture with unified blockchain gateway aggregating data across 25+ protocols via custom OpenAPI specification",
      "Built hybrid infrastructure from the ground up: on-premises bare-metal servers, cloud instances, and third-party RPC providers — driving substantial cost savings by migrating Solana and archival nodes from cloud to bare-metal",
      "Developed custom Node Exporter and Grafana metrics for real-time monitoring of peer count, block height, validator version, uptime, skip rate, and resource utilization across all fleets",
      "Built Solentic (solentic.theblueprint.xyz) — the first agentic Solana staking infrastructure — exposing 30 REST endpoints and 26 MCP tools for programmatic stake/unstake, real-time APY breakdowns including Jito MEV, on-chain memo attribution, SHA-256 source verification, and zero-custody unsigned transaction flow",
      "Built CCScan (ccscan.xyz) — full-history Canton Network explorer and chain API: a custom indexer ingesting the Super Validator Scan API global feed into a 324M+ row per-party PostgreSQL index on Blueprint validator infrastructure, orchestrated behind 20 public REST endpoints with metered, Stripe-billed API key tiers and an OpenAPI 3.1 spec",
      "Built CC Ledger (14 REST endpoints, 14 MCP tools for Canton)",
    ],
  },
  {
    title: "Senior Wallet Operations Engineer",
    company: "Bittrex, Inc",
    location: "Remote | Seattle, WA",
    period: "2021 — 2023",
    description:
      "Highly performant Wallet Operations Engineer responsible for maintaining wallet uptime within one of the world's largest cryptocurrency wallet infrastructures. Operating within a CI/CD pipeline, contributed code deployed to production daily.",
    highlights: [
      "Maintained over 200 cryptocurrency wallets — managed deposits, withdrawals, and address functionalities",
      "Integrated native blockchains with multiple asset support, onboarded dependent assets across 250+ cryptocurrency projects",
      "Closely monitored and prepared various blockchain components for hard-forks and network updates",
      "Wrote custom Alpine & Ubuntu Dockerfiles to install node/wallet software from source",
      "Created specifications around fee structures and methods of interacting with blockchains",
      "Performed funds swaps for tokens moving to mainnet or between various blockchains",
      "Worked directly with coin dev teams and stakeholders to ensure key performance and uphold profitable business relationships",
    ],
  },
  {
    title: "Operations Center Administrator",
    company: "Taos, an IBM company",
    location: "Remote | Culver City, CA",
    period: "2015 — 2021",
    description:
      "Lead Systems Administrator via Taos/IBM (MSP). Responsible for the automation and success of monthly patching for over 900 Windows and Linux systems.",
    highlights: [
      "Effective contributor to Ansible codebase via GitHub Enterprise for daily continuous integration",
      "Maintained 98+% security compliance across over 900 Windows/Unix systems",
      "Utilized automation technologies to deploy, patch, and configure VMs and instances",
      "Developed script-based solutions to simplify and automate administrative tasks",
      "Recognized by staff as a key component in the retainment of the term contract",
    ],
  },
  {
    title: "Systems Engineer",
    company: "FLEXTECHS",
    location: "On Site | Boise, ID",
    period: "2013 — 2015",
    description:
      "Configured and installed web servers, domain controllers, desktop nodes, and network equipment for various endpoint locations. Headed physical bare-metal datacenter deployments.",
    highlights: [
      "Led a team of technicians, triaging tasks and delegating work on a daily basis",
      "Developed menu-driven bash scripts to automate spreadsheet and config file generation",
      "Created Docker containers to containerize web applications and setup auto-deployments",
      "Maintained and upgraded physical server and network equipment at on-site locations",
    ],
  },
  {
    title: "Founder & CEO",
    company: "EcoServer, LLC",
    location: "Remote | Romoland, CA",
    period: "2009 — 2013",
    description:
      "Established a directly solar-powered website hosting platform by colocating server equipment in a solar-powered data center facility. Integrated WHMCS & cPanel for VPS hosting deployment. Later sold entity to Viridio.",
    highlights: [
      "Deployed physical bare-metal server, security, and networking infrastructure",
      "Maintained full-stack client applications utilizing HTML/CSS, JavaScript, PHP, and MySQL",
      "Developed Docker containers for automated deployments via DockerHub, GitHub, and Jenkins",
      "Scripted automatic application backups and handled client applications from wireframing to production",
    ],
  },
]

const certifications = [
  {
    name: "Blockchain Architect",
    issuer: "Blockchain Council",
    verifyUrl: "https://www.credential.net/44a73119-b770-4a10-901c-7aa6508d5c65",
  },
  {
    name: "Full Stack Software Developer",
    issuer: "University of Arizona",
    verifyUrl: "https://www.linkedin.com/in/mbrassey/overlay/1613176532570/single-media-viewer/?profileId=ACoAADGbAe0Bym7la1XJIANHyWfMdb4dt4P_3BI",
  },
  {
    name: "Blockchain Developer",
    issuer: "Dapp University",
    verifyUrl: "https://www.linkedin.com/in/mbrassey/details/featured/1635483692387/single-media-viewer/?profileId=ACoAADGbAe0Bym7la1XJIANHyWfMdb4dt4P_3BI",
  },
  {
    name: "Linux+ & LPIC Certified",
    issuer: "CompTIA / LPI",
    verifyUrl: "https://www.credly.com/badges/e397f724-7e4d-45a0-b648-a0a35c2ba48a",
  },
]

const recommendations = [
  {
    quote:
      "Matt has been an integral part of the Wallet Operations team for the last two years and has consistently demonstrated his ability to efficiently manage and maintain complex wallet infrastructure and integrate new blockchain projects. His strong technical knowledge allows him to implement innovative solutions and significantly improve our operational processes.",
    author: "Artem Tarasov",
    title: "Lead Engineer",
    profileUrl: "https://www.linkedin.com/in/artem-tarasov-07907091/",
    image: "/artem.jpeg",
  },
  {
    quote:
      "I worked with Matt for two years and it was an absolute pleasure. His work ethic set the bar for the team. He is an outstanding Blockchain Wallet Engineer. He knocked all of his assigned projects out of the park. He is excellent at writing clear and precise technical documentation. Last, but not least, he was always available to troubleshoot issues with fellow engineers no matter what his workload was like at the time.",
    author: "Scott Sisco",
    title: "Linux Operations Engineer",
    profileUrl: "https://www.linkedin.com/in/scott-sisco-b079053a/",
    image: "/scott.jpeg",
  },
  {
    quote:
      "Matt is a hard worker and was able to produce great code in a neat and timely manner. His contributions to our projects were beyond valuable, he shows a great understanding of the technologies we used within our full stack web app.",
    author: "Ryan Brown",
    title: "Full Stack Web Developer",
    profileUrl: "https://www.linkedin.com/in/ryan-brown-83760479/",
    image: "/ryan.jpeg",
  },
  {
    quote:
      "It was awesome to watch the project come together thanks to Matt's ability to translate wireframed concepts into reality, and deep knowledge of the technologies our app is built upon.",
    author: "Matthew Ondrovic",
    title: "Full Stack Web Developer",
    profileUrl: "https://www.linkedin.com/in/matthew-ondrovic-a43826131/",
    image: "/matthew.jpeg",
  },
]

// =========================================================
// COMPONENTS
// =========================================================

function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let animId = 0
    let w = 0
    let h = 0
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []

    const init = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      particles.length = 0
      const count = Math.min(55, Math.floor(w / 22))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
        })
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        a.x += a.vx
        a.y += a.vy
        if (a.x < 0 || a.x > w) a.vx *= -1
        if (a.y < 0 || a.y > h) a.vy *= -1

        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(75, 127, 155, 0.3)"
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 150) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(75, 127, 155, ${(1 - d / 150) * 0.1})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(render)
    }

    init()
    render()
    window.addEventListener("resize", init)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", init)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.35 }} />
}

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  label,
}: {
  end: number
  suffix?: string
  prefix?: string
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4B7F9B]">
        {prefix}
        <CountUp start={0} end={isInView ? end : 0} duration={2.5} separator="," useEasing enableScrollSpy scrollSpyOnce />
        {suffix}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.2em]">{label}</div>
    </div>
  )
}

const codeLines = [
  { type: "txt", text: "● I'll fix rewards accounting on the Solana fleet — Jito MEV tips aren't included in the APY gauge." },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Read(src/validators/solana.ts)" },
  { type: "out", text: "  ⎿  Read 47 lines (ctrl+o to expand)" },
  { type: "blank", text: "" },
  { type: "think", text: "✻ Thinking…" },
  { type: "blank", text: "" },
  { type: "txt", text: "● The exporter only counts base inflation rewards. Pulling Jito tips per epoch and folding them into the gauge." },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(src/validators/solana.ts)" },
  { type: "out", text: "  ⎿  Updated src/validators/solana.ts with 14 additions and 3 removals" },
  { type: "ctx", text: "       12    import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';" },
  { type: "del", text: "       13 -  import { getValidatorInfo } from '../utils';" },
  { type: "add", text: "       13 +  import { ValidatorMetrics } from '../metrics/prometheus';" },
  { type: "add", text: "       14 +  import { JitoClient } from '@jito-foundation/sdk';" },
  { type: "ctx", text: "       15" },
  { type: "ctx", text: "       16    export async function getRewards(voteAccount: string) {" },
  { type: "ctx", text: "       17      const conn = new Connection(process.env.SOLANA_RPC!);" },
  { type: "del", text: "       18 -    const rewards = await conn.getInflationReward([voteAccount]);" },
  { type: "del", text: "       19 -    return { amount: rewards[0]?.amount ?? 0 };" },
  { type: "add", text: "       18 +    const epoch = await conn.getEpochInfo();" },
  { type: "add", text: "       19 +    const [inflation, jito] = await Promise.all([" },
  { type: "add", text: "       20 +      conn.getInflationReward([voteAccount], epoch.epoch - 1)," },
  { type: "add", text: "       21 +      JitoClient.getMevReward(voteAccount, epoch.epoch - 1)," },
  { type: "add", text: "       22 +    ]);" },
  { type: "add", text: "       23 +    const base = (inflation[0]?.amount ?? 0) / LAMPORTS_PER_SOL;" },
  { type: "add", text: "       24 +    return {" },
  { type: "add", text: "       25 +      epoch: epoch.epoch," },
  { type: "add", text: "       26 +      baseReward: base," },
  { type: "add", text: "       27 +      jitoMev: jito.lamports / LAMPORTS_PER_SOL," },
  { type: "add", text: "       28 +      totalApy: ValidatorMetrics.calculateAPY(base + jito.lamports)," },
  { type: "add", text: "       29 +    };" },
  { type: "ctx", text: "       30    }" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(npm run build 2>&1 | tail -3)" },
  { type: "out", text: "  ⎿  ✓ Compiled successfully" },
  { type: "out", text: "     Tests: 24 passed, 0 failed" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update Todos" },
  { type: "out", text: "  ⎿  ☒ Fold Jito MEV tips into the APY gauge" },
  { type: "todo", text: "     ☒ Rebuild and test the exporter" },
  { type: "todo", text: "     ☐ Roll Avalanche fleet to v1.13.2" },
  { type: "todo", text: "     ☐ Check cc-indexer cursor lag" },
  { type: "blank", text: "" },
  { type: "txt", text: "● Rolling the Avalanche fleet next — va-1 first, health-gated before the rest follow." },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(ssh avax-va-1 'avalanchego --version')" },
  { type: "out", text: "  ⎿  avalanche/1.13.1 [network=mainnet]" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(infra/avalanche/compose.yaml)" },
  { type: "out", text: "  ⎿  Updated infra/avalanche/compose.yaml with 1 addition and 1 removal" },
  { type: "del", text: "        7 -    image: avaplatform/avalanchego:v1.13.1" },
  { type: "add", text: "        7 +    image: avaplatform/avalanchego:v1.13.2" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(docker compose up -d avax-node && curl -s :9650/ext/health | jq .healthy)" },
  { type: "out", text: "  ⎿  Container avax-va-1  Started" },
  { type: "out", text: "     true" },
  { type: "blank", text: "" },
  { type: "think", text: "✻ Thinking…" },
  { type: "blank", text: "" },
  { type: "txt", text: "● va-1 is healthy on v1.13.2. Now checking the Canton indexer's cursor before advancing the fleet." },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(curl -s https://ccscan.xyz/api/overview | jq '{head_seq, latest_round}')" },
  { type: "out", text: "  ⎿  {" },
  { type: "out", text: "       \"head_seq\": 321752023," },
  { type: "out", text: "       \"latest_round\": 103884" },
  { type: "out", text: "     }" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Read(cc-indexer/app.py)" },
  { type: "out", text: "  ⎿  Read 412 lines (ctrl+o to expand)" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(cc-indexer/app.py)" },
  { type: "out", text: "  ⎿  Updated cc-indexer/app.py with 6 additions and 2 removals" },
  { type: "ctx", text: "       82    def insert_batch(cur, rows):" },
  { type: "del", text: "       83 -      for r in rows:" },
  { type: "del", text: "       84 -          cur.execute(\"INSERT INTO cc_party_tx VALUES (%s,%s,%s)\", r)" },
  { type: "add", text: "       83 +      psycopg2.extras.execute_values(" },
  { type: "add", text: "       84 +          cur," },
  { type: "add", text: "       85 +          \"INSERT INTO cc_party_tx (party_id, seq, roles) VALUES %s\"," },
  { type: "add", text: "       86 +          rows," },
  { type: "add", text: "       87 +          page_size=1000," },
  { type: "add", text: "       88 +      )" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(docker compose logs --tail=2 cc-indexer)" },
  { type: "out", text: "  ⎿  cc-indexer  | ingested page=1000 head=321752023 lag=2s" },
  { type: "out", text: "     cc-indexer  | ingested page=1000 head=321752841 lag=1s" },
  { type: "blank", text: "" },
  { type: "txt", text: "● Fleet is green — 50 nodes reporting, indexer at chain head. Epoch review complete." },
  { type: "blank", text: "" },
  { type: "blank", text: "" },
]

function CodeStream() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<typeof codeLines>([])

  useEffect(() => {
    // Reduced motion: render a static transcript, no timers
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLines(codeLines.slice(0, 44))
      return
    }

    let timeout: ReturnType<typeof setTimeout>
    let idx = 0

    const step = () => {
      const line = codeLines[idx % codeLines.length]
      idx++

      setLines((prev) => {
        const next = [...prev, line]
        // Keep a rolling window so DOM doesn't grow forever
        if (next.length > 120) return next.slice(next.length - 120)
        return next
      })

      // Auto-scroll within container only
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      })

      let delay: number
      if (line.type === "txt") {
        delay = Math.random() * 900 + 1400
      } else if (line.type === "think") {
        delay = Math.random() * 900 + 1500
      } else if (line.type === "cmd") {
        delay = Math.random() * 500 + 600
      } else if (line.type === "out") {
        delay = Math.random() * 250 + 180
      } else if (line.type === "todo") {
        delay = Math.random() * 80 + 90
      } else if (line.type === "blank") {
        delay = Math.random() * 150 + 100
      } else {
        delay = Math.random() * 45 + 30
      }

      timeout = setTimeout(step, delay)
    }

    timeout = setTimeout(step, 800)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div ref={containerRef} className="font-mono text-[11px] leading-[1.8] whitespace-pre px-6 pt-8 h-full overflow-hidden">
      {lines.map((line, i) => {
        if (line.type === "txt") {
          return <div key={i} className="text-slate-300/80 mt-1 whitespace-pre-wrap">{line.text}</div>
        }
        if (line.type === "cmd") {
          return <div key={i} className="text-slate-100/90 mt-1 font-semibold">{line.text}</div>
        }
        if (line.type === "out") {
          return <div key={i} className="text-slate-500/60">{line.text}</div>
        }
        if (line.type === "think") {
          return <div key={i} className="text-slate-500/70 italic">{line.text}</div>
        }
        if (line.type === "todo") {
          const done = line.text.includes("☒")
          return (
            <div key={i} className={done ? "text-emerald-400/45 line-through" : "text-slate-400/60"}>
              {line.text}
            </div>
          )
        }
        if (line.type === "add") {
          return <div key={i} className="bg-emerald-500/10 text-emerald-400/70 pl-1">{line.text}</div>
        }
        if (line.type === "del") {
          return <div key={i} className="bg-red-500/8 text-red-400/45 pl-1">{line.text}</div>
        }
        if (line.type === "blank") {
          return <div key={i} className="h-4" />
        }
        return <div key={i} className="text-slate-600/35 pl-1">{line.text}</div>
      })}
    </div>
  )
}

// =========================================================
// LIVE CANTON TELEMETRY (ccscan.xyz public API, anonymous tier)
// =========================================================

type CantonOverview = { head: number; round: number; at: number }
let cantonCurrent: CantonOverview | null = null
let cantonRate = 0
const cantonListeners = new Set<() => void>()
let cantonStarted = false

async function cantonPoll() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return
  try {
    const res = await fetch("https://ccscan.xyz/api/overview")
    if (!res.ok) return
    const j = await res.json()
    if (typeof j.head_seq !== "number") return
    const now = Date.now()
    if (cantonCurrent && j.head_seq > cantonCurrent.head) {
      const dt = (now - cantonCurrent.at) / 1000
      if (dt > 1) cantonRate = Math.min((j.head_seq - cantonCurrent.head) / dt, 500)
    }
    if (!cantonCurrent || j.head_seq >= cantonCurrent.head) {
      cantonCurrent = { head: j.head_seq, round: j.latest_round ?? 0, at: now }
      cantonListeners.forEach((l) => l())
    }
  } catch {
    // Silent: telemetry is progressive enhancement only
  }
}

function cantonSubscribe(fn: () => void) {
  cantonListeners.add(fn)
  if (!cantonStarted) {
    cantonStarted = true
    cantonPoll()
    window.setTimeout(cantonPoll, 4000)
    window.setInterval(cantonPoll, 12000)
  }
  return () => {
    cantonListeners.delete(fn)
  }
}

function CantonLive({ variant }: { variant: "hero" | "card" }) {
  const [display, setDisplay] = useState<number | null>(null)
  const [round, setRound] = useState<number>(0)

  useEffect(() => {
    const sync = () => {
      if (cantonCurrent) {
        setDisplay(cantonCurrent.head)
        setRound(cantonCurrent.round)
      }
    }
    const unsub = cantonSubscribe(sync)
    sync()

    let raf = 0
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tick = () => {
        if (cantonCurrent) {
          const projected = Math.floor(
            cantonCurrent.head + cantonRate * ((Date.now() - cantonCurrent.at) / 1000),
          )
          setDisplay((d) => (d === projected ? d : projected))
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    return () => {
      unsub()
      cancelAnimationFrame(raf)
    }
  }, [])

  if (display === null) return null
  const txs = display.toLocaleString("en-US")
  const rnd = round.toLocaleString("en-US")

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-wrap items-center justify-start sm:justify-center gap-x-2.5 gap-y-1 font-mono text-[11px] sm:text-xs pt-8"
      >
        <span className="status-dot" style={{ width: 6, height: 6 }} />
        <span className="text-emerald-400 text-[10px] tracking-[0.25em]">LIVE</span>
        <span className="text-slate-500">canton mainnet</span>
        <span className="text-[#4B7F9B] tabular-nums">{txs}</span>
        <span className="text-slate-500">tx indexed</span>
        <span className="text-slate-600 hidden sm:inline">·</span>
        <span className="text-slate-500 hidden sm:inline">round</span>
        <span className="text-[#4B7F9B] tabular-nums hidden sm:inline">{rnd}</span>
        <span className="text-slate-600 hidden md:inline">· via ccscan.xyz</span>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
      <span className="status-dot" style={{ width: 6, height: 6 }} />
      <span className="text-emerald-400 text-[10px] tracking-wider">LIVE</span>
      <span className="text-[#4B7F9B] tabular-nums">{txs}</span>
      <span className="text-slate-500">tx indexed · round</span>
      <span className="text-[#4B7F9B] tabular-nums">{rnd}</span>
    </div>
  )
}

// =========================================================
// SCROLL PROGRESS
// =========================================================

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 30, mass: 0.4 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[45] origin-left bg-gradient-to-r from-[#4B7F9B]/30 via-[#4B7F9B] to-[#6ba3bf]"
    />
  )
}

// =========================================================
// COMMAND PALETTE (⌘K)
// =========================================================

function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) {
      setCopied(false)
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const goTo = (id: string) => {
    onOpenChange(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }
  const openUrl = (url: string) => {
    onOpenChange(false)
    window.open(url, "_blank", "noopener,noreferrer")
  }
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("matt@brassey.io")
      setCopied(true)
      window.setTimeout(() => onOpenChange(false), 900)
    } catch {
      onOpenChange(false)
    }
  }

  const itemClass =
    "flex items-center gap-3 mx-2 px-3 py-2.5 rounded text-sm text-slate-400 cursor-pointer data-[selected=true]:bg-[#4B7F9B]/10 data-[selected=true]:text-[#4B7F9B]"

  return (
    <CmdK.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
      contentClassName="fixed z-[81] top-[14%] left-1/2 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-[#1F1D20] bg-[#0a0b0d]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
    >
      <div className="flex items-center gap-3 border-b border-[#1F1D20] px-4">
        <span className="font-mono text-[#4B7F9B] text-sm">&gt;</span>
        <CmdK.Input
          placeholder="type a command or search…"
          className="h-12 flex-1 bg-transparent font-mono text-sm text-slate-200 placeholder:text-slate-600 outline-none border-0 focus:ring-0"
        />
        <kbd className="rounded border border-[#1F1D20] px-1.5 py-0.5 font-mono text-[10px] text-slate-600">esc</kbd>
      </div>
      <CmdK.List className="max-h-[min(56vh,400px)] overflow-y-auto overscroll-contain py-2">
        <CmdK.Empty className="px-4 py-8 text-center font-mono text-xs text-slate-600">
          no matches found
        </CmdK.Empty>
        <CmdK.Group heading="Navigate">
          {navItems.map((item, i) => (
            <CmdK.Item key={item.id} onSelect={() => goTo(item.id)} className={itemClass}>
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              <span className="flex-1">{item.label}</span>
              <span className="font-mono text-[10px] text-slate-600">0{i + 1}</span>
            </CmdK.Item>
          ))}
        </CmdK.Group>
        <CmdK.Group heading="Projects">
          {projects.map((p) => (
            <CmdK.Item key={p.title} onSelect={() => openUrl(p.url)} className={itemClass}>
              <Code2 className="h-3.5 w-3.5 opacity-50" />
              <span className="flex-1">{p.title}</span>
              <ArrowUpRight className="h-3 w-3 opacity-40" />
            </CmdK.Item>
          ))}
        </CmdK.Group>
        <CmdK.Group heading="Connect">
          <CmdK.Item onSelect={() => openUrl("mailto:matt@brassey.io")} className={itemClass}>
            <Mail className="h-3.5 w-3.5 opacity-50" />
            <span className="flex-1">Email me</span>
          </CmdK.Item>
          <CmdK.Item onSelect={copyEmail} className={itemClass}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 opacity-50" />}
            <span className="flex-1">{copied ? "copied to clipboard" : "Copy email address"}</span>
            <span className="font-mono text-[10px] text-slate-600">matt@brassey.io</span>
          </CmdK.Item>
          <CmdK.Item onSelect={() => openUrl("https://github.com/mbrassey")} className={itemClass}>
            <Github className="h-3.5 w-3.5 opacity-50" />
            <span className="flex-1">GitHub</span>
            <ArrowUpRight className="h-3 w-3 opacity-40" />
          </CmdK.Item>
          <CmdK.Item onSelect={() => openUrl("https://www.linkedin.com/in/mbrassey/")} className={itemClass}>
            <Linkedin className="h-3.5 w-3.5 opacity-50" />
            <span className="flex-1">LinkedIn</span>
            <ArrowUpRight className="h-3 w-3 opacity-40" />
          </CmdK.Item>
          <CmdK.Item
            onSelect={() => openUrl("https://docs.google.com/document/d/1xYCsndvFjoaK9GJdLL7boj6F7U3c1lCFUtgf8wepmio")}
            className={itemClass}
          >
            <FileText className="h-3.5 w-3.5 opacity-50" />
            <span className="flex-1">View resume</span>
            <ArrowUpRight className="h-3 w-3 opacity-40" />
          </CmdK.Item>
        </CmdK.Group>
      </CmdK.List>
    </CmdK.Dialog>
  )
}

// =========================================================
// WAKATIME (lazy-mounted on approach)
// =========================================================

function WakaTimeChart() {
  const ref = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true)
          ob.disconnect()
        }
      },
      { rootMargin: "600px" },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative w-full" style={{ maxWidth: "100%" }}>
      <div className="h-[300px] sm:h-[400px] md:h-[600px] lg:h-[769px]">
        {load ? (
          <object
            data="https://wakatime.com/share/@532855a8-3081-4600-a53d-4262beb65d14/f2004230-ef8c-43f6-a706-5e2934626e2c.svg"
            type="image/svg+xml"
            title="Monthly coding activity chart"
            className="absolute w-full h-full"
            style={{ backgroundColor: "transparent", maxWidth: "1048px", margin: "0 auto", left: 0, right: 0 }}
          >
            Coding activity chart
          </object>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-600">
            loading activity…
          </div>
        )}
      </div>
    </div>
  )
}

// =========================================================
// FOOTER TECH MARKS (inline — no icon CDN)
// =========================================================

const footerTech: { label: string; path: string }[] = [
  {
    label: "Ethereum",
    path: "M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z",
  },
  {
    label: "JavaScript",
    path: "M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z",
  },
  {
    label: "React",
    path: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z",
  },
  {
    label: "Node.js",
    path: "M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z",
  },
  {
    label: "Docker",
    path: "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z",
  },
  {
    label: "Git",
    path: "M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187",
  },
]

// =========================================================
// ANIMATION VARIANTS
// =========================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// =========================================================
// MAIN PAGE
// =========================================================

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.15, rootMargin: "-80px 0px" },
    )

    const sectionEls = document.querySelectorAll("section[id]")
    sectionEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Escape closes the mobile menu; lock body scroll while it is open
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [isMenuOpen])

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#000102] text-slate-200 scan-lines overflow-x-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:border focus:border-[#4B7F9B]/40 focus:bg-[#0a0b0d] focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-[#4B7F9B]"
      >
        skip to content
      </a>
      <ScrollProgress />
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
      <ParticleNetwork />

      {/* ==================== ORBITAL NAV ==================== */}
      <nav className="orbital-nav" aria-label="Section navigation">
        {navItems.map((item) => (
          <Link key={item.id} href={`#${item.id}`} title={item.label} aria-label={item.label}>
            <div className={`orbital-dot ${activeSection === item.id ? "active" : ""}`} />
          </Link>
        ))}
      </nav>

      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#1F1D20]/50 bg-[#000102]/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="#" className="text-lg font-bold">
            <span className="text-[#4B7F9B]">brassey</span>
            <span className="text-slate-500">.io</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className={`text-xs uppercase tracking-wider transition-colors ${
                  activeSection === item.id ? "text-[#4B7F9B]" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              aria-label="Open command menu"
              className="hidden lg:inline-flex items-center gap-1 rounded border border-[#1F1D20] px-2 py-1 font-mono text-[10px] text-slate-500 transition-colors hover:border-[#4B7F9B]/40 hover:text-[#4B7F9B]"
            >
              <CommandIcon className="h-3 w-3" />K
            </button>
            <button
              className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Open navigation menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE MENU ==================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#000102]/98 backdrop-blur-xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex flex-col h-full">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-[#1F1D20]/50">
                <span className="text-lg font-bold">
                  <span className="text-[#4B7F9B]">brassey</span>
                  <span className="text-slate-500">.io</span>
                </span>
                <button
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 flex flex-col justify-center px-8 gap-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`#${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-xl text-slate-300 hover:text-[#4B7F9B] transition-colors border-b border-[#1F1D20]/30"
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Social links at bottom */}
              <div className="px-8 pb-8">
                <div className="flex items-center justify-center gap-8 py-4 border-t border-[#1F1D20]/50">
                  <Link
                    href="https://github.com/mbrassey"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/mbrassey/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link
                    href="mailto:matt@brassey.io"
                    aria-label="Email matt@brassey.io"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </Link>
                </div>
                <p className="text-center text-[10px] text-slate-600 font-mono">
                  matt@brassey.io
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main">
        {/* ==================== HERO ==================== */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center pt-14">
          <div className="absolute inset-0 grid-bg" style={{ maskImage: "linear-gradient(to right, transparent 10%, black 60%)", WebkitMaskImage: "linear-gradient(to right, transparent 10%, black 60%)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000102] via-transparent to-[#000102]" />

          {/* Claude Code streaming diff background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            <div className="absolute left-0 top-0 bottom-0 w-[70%] sm:w-[55%] overflow-hidden opacity-[0.25] sm:opacity-[0.22]" style={{ maskImage: "linear-gradient(to right, black 20%, transparent 85%)", WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 85%)" }}>
              <CodeStream />
            </div>
          </div>

          <div className="relative z-10 container px-4 md:px-6 text-left sm:text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5"
            >
              <span className="status-dot" style={{ width: 6, height: 6 }} />
              <span className="text-emerald-400 text-xs tracking-wider">ENGINEERING MANAGER, STAKING</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter"
            >
              Matt <span className="gradient-text">Brassey</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <p className="text-lg sm:text-xl md:text-2xl text-[#4B7F9B]">
                Engineering Manager, Staking — Blockchain Infrastructure Architect
              </p>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                Commanding 50+ validators across 25+ protocols with $500M+ staked AUM. Building the decentralized future from
                bare-metal to smart contracts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center"
            >
              <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90 text-black font-semibold w-full sm:w-auto" asChild>
                <Link href="#infrastructure">
                  View Infrastructure <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B] hover:text-black hover:border-[#4B7F9B] transition-all w-full sm:w-auto"
                asChild
              >
                <Link
                  href="https://docs.google.com/document/d/1xYCsndvFjoaK9GJdLL7boj6F7U3c1lCFUtgf8wepmio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" /> View Resume
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-12 sm:pt-16 max-w-3xl mx-auto"
            >
              <AnimatedCounter end={50} suffix="+" label="Active Nodes" />
              <AnimatedCounter end={25} suffix="+" label="Protocols" />
              <AnimatedCounter end={16} suffix="+" label="Years Experience" />
              <AnimatedCounter end={500} suffix="M+" prefix="$" label="AUM" />
            </motion.div>

            <CantonLive variant="hero" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-8 rounded-full border border-[#1F1D20] flex items-start justify-center p-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-[#4B7F9B]" />
            </motion.div>
          </motion.div>
        </section>

        {/* ==================== PROFILE ==================== */}
        <section className="relative py-12 sm:py-20">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-4xl mx-auto pt-8 sm:pt-12">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full md:w-auto md:flex-shrink-0"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#1F1D20] breathe-border md:w-80 md:h-80">
                  <img
                    src="/mbrassey.jpg"
                    alt="Matt Brassey"
                    className="w-full h-full object-cover"
                    width={320}
                    height={320}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000102] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 font-mono text-[10px] text-[#4B7F9B]/80">
                    <div><span className="text-emerald-400/70">$</span> whoami</div>
                    <div className="text-[#4B7F9B]/60">matt_brassey : eng_manager_staking : blueprint</div>
                    <div>
                      <span className="text-emerald-400/70">$</span>{" "}
                      <span className="inline-block w-[5px] h-[7px] bg-[#4B7F9B] align-middle" style={{ animation: "blink-cursor 1s step-end infinite" }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-left space-y-4"
              >
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Engineering Manager of Staking at{" "}
                  <span className="text-[#4B7F9B]">Blueprint</span>, a{" "}
                  <span className="text-[#4B7F9B]">Hivemind Capital</span>{" "}venture. I operate profitable validator
                  fleets across Solana, Ethereum, Avalanche, Algorand, Audius, Canton, Tezos, and Polkadot — 50+ nodes with
                  $500M+ staked AUM on hybrid bare-metal and cloud infrastructure I built from the ground up. I designed
                  a unified blockchain gateway aggregating live and historical data across 25+ protocols through a
                  custom OpenAPI specification, and built the deploy, upgrade, and resync primitives that power
                  AI-driven validator operations.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="https://github.com/mbrassey"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/mbrassey/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link
                    href="mailto:matt@brassey.io"
                    aria-label="Email matt@brassey.io"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== INFRASTRUCTURE COMMAND ==================== */}
        <section id="infrastructure" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-6xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Network className="h-3 w-3" />
                  <span>// infrastructure</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Infrastructure Command</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Real-time validator and node operations across multiple blockchain networks. Deploying, monitoring,
                  upgrading &amp; maintaining profitable mainnet validators and data RPC nodes.
                </p>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {infrastructureNodes.map((node, i) => (
                  <motion.div
                    key={i}
                    variants={slideUp}
                    className="group relative p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer hover:border-[#4B7F9B]/30 transition-colors duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {node.logo && (
                          <img
                            src={node.logo}
                            alt={node.network}
                            className="w-6 h-6 protocol-logo"
                            width={24}
                            height={24}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="status-dot" />
                          <span className="text-emerald-400 text-[10px] uppercase tracking-wider">Live</span>
                        </div>
                      </div>
                      {node.count && (
                        <span className="text-[#4B7F9B]/60 text-xs font-mono">&times;{node.count}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="border-[#4B7F9B]/20 text-[#4B7F9B] text-[10px] px-2 py-0"
                      >
                        {node.network}
                      </Badge>
                      <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px] px-2 py-0">
                        {node.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#4B7F9B] transition-colors">
                      {node.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">{node.description}</p>
                    <div className="space-y-2 mt-auto">
                      {node.network === "Canton" && <CantonLive variant="card" />}
                      {node.metric && (
                        <div className="text-sm font-mono text-[#4B7F9B]">{node.metric}</div>
                      )}
                      {node.links && node.links.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {node.links.map((link, j) => (
                            <Link
                              key={j}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-500 hover:text-[#4B7F9B] transition-colors flex items-center gap-1 border border-[#1F1D20] rounded px-2 py-0.5 hover:border-[#4B7F9B]/30"
                            >
                              {link.label} <ArrowUpRight className="h-2.5 w-2.5" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== AI DEVELOPMENT ==================== */}
        <section id="ai" className="relative py-16 md:py-24 overflow-hidden">
          <div className="section-divider" />

          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#4B7F9B]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#4B7F9B]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-[#4B7F9B]" />
          </div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto pt-12 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Terminal className="h-3 w-3" />
                  <span>// ai-development</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  The <span className="gradient-text">1000x</span> Developer
                </h2>
                <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg">
                  16 years of battle-tested engineering provides the wisdom and architectural judgment that transforms
                  AI from a tool into a force multiplier. As an elite AI operator and cutting-edge technology adopter,
                  I combine deep infrastructure expertise with 1000x development velocity — the experience to know
                  what to build, and the AI mastery to ship it in days instead of months.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                <motion.div variants={slideUp} className="flex flex-col gap-6">
                  <div className="flex-1 p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur space-y-4 holo-shimmer hover:border-[#4B7F9B]/30 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#4B7F9B]/10">
                        <Terminal className="h-5 w-5 text-[#4B7F9B]" />
                      </div>
                      <h3 className="text-lg font-bold">AI-Orchestrated Engineering</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      As operator and commander of elite AI agent fleets, I orchestrate specialized agents across
                      every layer of the stack — infrastructure provisioning, smart contract development,
                      frontend engineering, API design, security auditing, and automated testing. I practice compound
                      engineering where every code review, bug fix, and deployment compounds into persistent rules
                      that apply to all future work. I build custom MCP servers and author agent-facing runbooks
                      that encode operational knowledge, and design deterministic workflows where agents execute
                      against well-defined specifications rather than open-ended prompts.
                    </p>
                  </div>

                  <div className="flex-1 p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur space-y-4 holo-shimmer hover:border-[#4B7F9B]/30 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#4B7F9B]/10">
                        <Zap className="h-5 w-5 text-[#4B7F9B]" />
                      </div>
                      <h3 className="text-lg font-bold">Experience + Velocity = Elite Operator</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      16 years of engineering — from managing 900+ servers at IBM to maintaining 200+ wallets
                      at Bittrex to running $500M+ in staked validator infrastructure — provides the experience
                      that separates an elite AI operator from someone just prompting. Cloud-to-bare-metal migrations,
                      custom Grafana monitoring pipelines, automated node provisioning with AWS launch templates,
                      and Dockerized blockchain deployments from source — all encoded into persistent agent
                      rules and deterministic runbooks so every deployment compounds on the last. Experience is the
                      compass; AI is the engine.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={slideUp}>
                  <div className="rounded-lg border border-[#1F1D20] bg-[#1F1D20] overflow-hidden flex flex-col h-full hover:border-[#4B7F9B]/30 transition-colors duration-300">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1F1D20] bg-[#1a1a1e]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-slate-700/50 flex items-center justify-center">
                          <Terminal className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-[10px] sm:text-[11px] font-mono truncate">matt@blueprint:~/ai-command-center</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-slate-700/50 cursor-default">
                          <div className="w-2.5 h-[1.5px] bg-slate-500" />
                        </div>
                        <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-slate-700/50 cursor-default">
                          <div className="w-2.5 h-2.5 border border-slate-500 rounded-[1px]" />
                        </div>
                        <div className="w-6 h-5 flex items-center justify-center rounded-sm hover:bg-red-500/30 cursor-default group">
                          <X className="h-3 w-3 text-slate-500 group-hover:text-red-400" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-1 text-[11px] sm:text-[12px] leading-relaxed flex-1 overflow-x-auto">
                      <div>
                        <span className="text-slate-600">&gt;</span>{" "}
                        <span className="text-slate-300">/security-review ccledger</span>
                      </div>
                      <div className="pt-1.5 text-slate-300/90">
                        ● I&apos;ll audit the API surface, auth chain, contracts, and rate limiting.
                      </div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Bash</span>
                        <span className="text-slate-400">(curl -s …/openapi.json | jq &apos;.paths | length&apos;)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ 14</div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Explore</span>
                        <span className="text-slate-400">(Audit Spring Security auth chain)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ Done (23 tool uses · 41.2k tokens)</div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Explore</span>
                        <span className="text-slate-400">(Audit Daml contract permissions)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ Done (17 tool uses · 28.9k tokens)</div>
                      <div className="pt-1.5 text-slate-300/90">
                        ● Audit clean — <span className="text-emerald-400">0 critical, 0 high, 0 medium</span>.
                      </div>
                      <div className="text-slate-500 pl-4">SQL injection: none — parameterized throughout</div>
                      <div className="text-slate-500 pl-4">API keys: SHA-256 hashed at rest · rate limits enforced</div>
                      <div className="text-slate-500 pl-4">Headers: HSTS, CSP, X-Frame-Options verified</div>

                      <div className="pt-4">
                        <span className="text-slate-600">&gt;</span>{" "}
                        <span className="text-slate-300">implement attest-mutual per SPEC.md</span>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Read</span>
                        <span className="text-slate-400">(SPEC.md)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ Read 214 lines (ctrl+o to expand)</div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Update</span>
                        <span className="text-slate-400">(daml/CcAction.daml)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ Updated CcAction.daml with 31 additions</div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Update</span>
                        <span className="text-slate-400">(api/ActionController.java)</span>
                      </div>
                      <div className="text-slate-500 pl-4">⎿ Updated ActionController.java with 58 additions and 4 removals</div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Bash</span>
                        <span className="text-slate-400">(./gradlew test --tests &apos;*AttestMutual*&apos;)</span>
                      </div>
                      <div className="text-slate-500 pl-4">
                        ⎿ <span className="text-emerald-400">7 tests completed, 7 passed</span>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-slate-100 font-semibold">● Update Todos</span>
                      </div>
                      <div className="text-emerald-400/50 line-through pl-4">⎿ ☒ AttestMutual choice + MCP tool</div>
                      <div className="text-emerald-400/50 line-through pl-8">☒ Flyway V14__attest_mutual.sql</div>
                      <div className="text-emerald-400/50 line-through pl-8">☒ Integration tests (7/7)</div>

                      <div className="pt-3">
                        <span className="text-slate-600">&gt;</span>{" "}
                        <span className="inline-block w-[6px] h-[11px] bg-[#4B7F9B] align-middle" style={{ animation: "blink-cursor 1s step-end infinite" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={slideUp} className="flex flex-wrap gap-3 sm:justify-center mt-12">
                {["Claude Code", "OpenClaw", "Cursor", "GitHub Copilot", "v0.dev", "Claude AI", "MCP Protocol"].map(
                  (tool) => (
                    <Badge key={tool} variant="outline" className="border-[#4B7F9B]/20 text-[#4B7F9B]/70 px-4 py-1.5">
                      {tool}
                    </Badge>
                  ),
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==================== EXPERIENCE ==================== */}
        <section id="experience" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-4xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <GitBranch className="h-3 w-3" />
                  <span>// experience</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Experience</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  16+ years of engineering — from founding a hosting company to managing $500M+ in blockchain staking
                  infrastructure.
                </p>
              </motion.div>

              <div className="space-y-8">
                {experience.map((role, i) => (
                  <motion.div key={i} variants={slideUp} className="relative pl-8 sm:pl-10 group">
                    <div className="absolute left-0 top-1 w-10 flex justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#4B7F9B]/30 border-2 border-[#4B7F9B]" style={{ animation: "breathe-dot 4s ease-in-out infinite" }} />
                    </div>
                    {i < experience.length - 1 && (
                      <div className="absolute left-0 top-5 w-10 bottom-0 flex justify-center">
                        <div className="w-px bg-gradient-to-b from-cyan-400/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/60 backdrop-blur hover:border-[#4B7F9B]/30 transition-colors duration-300">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold">{role.title}</h3>
                          <p className="text-[#4B7F9B] text-sm">{role.company}</p>
                          <p className="text-slate-600 text-xs">{role.location}</p>
                        </div>
                        <span className="text-sm text-slate-500 font-mono mt-1 md:mt-0 flex-shrink-0 transition-colors group-hover:text-[#4B7F9B]">
                          {role.period}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-4 text-sm leading-relaxed">{role.description}</p>
                      <ul className="space-y-1.5">
                        {role.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-slate-400">
                            <ChevronRight className="h-4 w-4 text-[#4B7F9B]/50 flex-shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== EXPERTISE ==================== */}
        <section id="expertise" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-6xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Layers className="h-3 w-3" />
                  <span>// expertise</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Technical Expertise</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Specialized knowledge across the full blockchain infrastructure stack.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-3">
                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6 hover:border-[#4B7F9B]/30 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4B7F9B]/10"><Server className="h-5 w-5 text-[#4B7F9B]" /></div>
                    <h3 className="text-lg font-bold">Backend &amp; Infrastructure</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Multi-Chain Protocols</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Validator ops: Solana, Ethereum, Avalanche, Algorand, Audius, Canton, Tezos, Polkadot/Kusama.
                        Wallet integration across L2s (Optimism, Base, Arbitrum), 100+ ERC-20/SPL/BEP tokens, Bitcoin,
                        Cardano, Cosmos, NEAR, Aptos, Hedera, ZK chains (Aleo, zkSync).
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">API &amp; Microservices</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Node.js, Express, Python (Flask + waitress), OpenAPI specification, RESTful design, metered
                        API-key tiers with Stripe billing, GraphQL, WebSockets, JWT authentication, Infura, Alchemy,
                        QuickNode, RapidAPI.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Data Engineering</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        On-chain data extraction, full-genesis Canton Coin indexer (324M+ row normalized per-party
                        PostgreSQL, keyset pagination, pg_trgm search), custom ETH2 indexer with Redis,
                        MongoDB/MySQL/MsSQL, time-series analytics, chain data snapshots, archival &amp; structured
                        historical data.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Systems &amp; CLI Tooling</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Rust, Ratatui TUI, Cargo, sysinfo, /proc parsing, native FFI (libSystem dylib on macOS,
                        NtQuerySystemInformation on Windows), cross-platform packaging via Homebrew, AUR, apt,
                        winget, FreeBSD pkg, and npm shims.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6 hover:border-[#4B7F9B]/30 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4B7F9B]/10"><Code2 className="h-5 w-5 text-[#4B7F9B]" /></div>
                    <h3 className="text-lg font-bold">Frontend &amp; Web3</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Smart Contracts &amp; Web3</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Solidity, Daml (Canton), Hardhat, Truffle, Ethers.js, Web3.js, Wagmi, Alchemy SDK, OnchainKit,
                        WalletConnect, MetaMask SDK, IPFS/Filecoin, Chainlink VRF, gRPC. DeFi: AAVE, Uniswap, SushiSwap.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Modern Stack</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Next.js, React, TypeScript, Spring Boot, Java 21, Node.js, React Hook Form, TanStack Query,
                        Vite, Server Components, OpenAPI 3.1, MCP servers, A2A agent cards, C#.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">UI/UX &amp; Tooling</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Tailwind CSS, ShadCN UI, Radix UI, Framer Motion, Recharts, responsive layouts, dark mode
                        theming, Flyway migrations, PostgreSQL, v0.dev, Vercel, Remix IDE.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">AI Agent Integration</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        MCP server design (stdio &amp; HTTP transports), A2A agent cards with declared skills,
                        zero-custody unsigned transaction flows, tool-call schema design for Claude / LangChain /
                        CrewAI / ElizaOS / OpenClaw, on-chain memo attribution, SHA-256 source verification.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6 hover:border-[#4B7F9B]/30 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10"><Database className="h-5 w-5 text-emerald-400" /></div>
                    <h3 className="text-lg font-bold">DevOps &amp; Operations</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-emerald-400 text-sm mb-1.5">Infrastructure</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Bare-metal servers, cloud provisioning, Proxmox virtualization, Docker, Ansible, AWS launch
                        templates, physical datacenter deployments, networking.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 text-sm mb-1.5">Blockchain Operations</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Full-node deployment, validator setup, network upgrades, RPC endpoints, consensus monitoring,
                        archival nodes, snapshot automation, checkpoint &amp; genesis sync.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 text-sm mb-1.5">Observability</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Custom Grafana dashboards, Prometheus metrics, custom Node Exporter metrics, alert management,
                        CI/CD pipelines, AWS (EC2, RDS, S3, SSM, CloudWatch, CLI), Git, Vim, VS Code.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 text-sm mb-1.5">Release Engineering</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        GitHub Actions CI matrices, multi-arch prebuilt binaries (linux x86_64/aarch64, macOS
                        Intel/Apple Silicon, Windows), package distribution via crates.io, Homebrew tap, AUR,
                        signed apt repo (GPG dearmor), winget, FreeBSD pkg, npm shims with SHA256SUMS verification,
                        semantic versioning, conventional commits.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== PROJECTS ==================== */}
        <section id="projects" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-6xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Code2 className="h-3 w-3" />
                  <span>// projects</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Featured Projects</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Decentralized applications and blockchain platforms built with cutting-edge technology.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, i) => (
                  <motion.div key={i} variants={slideUp} className={`h-full ${i === 0 ? "md:col-span-2" : ""}`}>
                    <Link href={project.url} target="_blank" rel="noopener noreferrer" className="block group h-full">
                      <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer card-lift h-full flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-[#4B7F9B] transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-[#4B7F9B]/70">{project.subtitle}</p>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-[#4B7F9B] transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
                        {project.title === "CCScan" && <CantonLive variant="card" />}
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tech.map((t) => (
                            <Badge key={t} variant="outline" className="border-slate-700 text-slate-500 text-[10px] px-2 py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== CERTIFICATIONS ==================== */}
        <section id="credentials" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-4xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Award className="h-3 w-3" />
                  <span>// certifications</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Certifications</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Professional credentials and industry certifications.
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {certifications.map((cert, i) => {
                  const CardWrapper = cert.verifyUrl ? Link : "div"
                  const wrapperProps = cert.verifyUrl
                    ? { href: cert.verifyUrl, target: "_blank" as const, rel: "noopener noreferrer" }
                    : {}
                  return (
                  <motion.div key={i} variants={slideUp}>
                    <CardWrapper {...wrapperProps} className="block group h-full">
                      <div className="p-5 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer card-lift text-center space-y-3 breathe-border cursor-pointer h-full flex flex-col items-center justify-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#4B7F9B]/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-[#4B7F9B]" />
                        </div>
                        <h3 className="font-bold text-sm group-hover:text-[#4B7F9B] transition-colors">{cert.name}</h3>
                        <p className="text-xs text-slate-500">{cert.issuer}</p>
                        {cert.verifyUrl && (
                          <span className="text-[10px] text-slate-600 group-hover:text-[#4B7F9B] transition-colors inline-flex items-center gap-1">
                            Verify <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </CardWrapper>
                  </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== RECOMMENDATIONS ==================== */}
        <section id="recommendations" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-5xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Users className="h-3 w-3" />
                  <span>// recommendations</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Colleague Feedback</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  What colleagues and collaborators have to say.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    variants={slideUp}
                    className="relative p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/60 backdrop-blur holo-shimmer card-lift"
                  >
                    <div className="absolute -top-3 left-4 text-3xl text-[#4B7F9B]/30 font-serif">&ldquo;</div>
                    <p className="text-slate-300 italic text-sm leading-relaxed mb-6 pt-2">{rec.quote}</p>
                    <div className="flex items-center gap-3">
                      <Link
                        href={rec.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-10 h-10 rounded-full overflow-hidden border border-[#4B7F9B]/20 hover:border-[#4B7F9B]/50 transition-colors flex-shrink-0"
                      >
                        <img src={rec.image} alt={rec.author} className="w-full h-full object-cover" width={40} height={40} />
                      </Link>
                      <div>
                        <Link
                          href={rec.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm hover:text-[#4B7F9B] transition-colors"
                        >
                          {rec.author}
                        </Link>
                        <p className="text-xs text-slate-500">{rec.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== CODING ACTIVITY ==================== */}
        <section id="activity" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-5xl mx-auto pt-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="text-left sm:text-center space-y-4 mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Activity className="h-3 w-3" />
                  <span>// activity</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Coding Activity</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Development activity tracked in real-time.
                </p>
              </motion.div>

              <motion.div variants={slideUp}>
                <div className="rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur overflow-hidden breathe-border">
                  <div className="flex items-center justify-between p-4 border-b border-[#1F1D20]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#4B7F9B]" />
                      <span className="text-sm text-slate-300">Monthly Coding Stats</span>
                    </div>
                    <Link
                      href="https://github.com/mbrassey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-[#4B7F9B] transition-colors flex items-center gap-1"
                    >
                      <Github className="h-3 w-3" /> GitHub <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <WakaTimeChart />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==================== CONTACT ==================== */}
        <section id="contact" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-3xl mx-auto pt-12 text-left sm:text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Mail className="h-3 w-3" />
                  <span>// contact</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Let&apos;s Connect</h2>
                <p className="text-slate-400 text-lg">
                  Interested in blockchain infrastructure, validator operations, or distributed systems?
                  Let&apos;s talk.
                </p>
              </motion.div>

              <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90 text-black font-semibold w-full sm:w-auto" asChild>
                  <Link href="mailto:matt@brassey.io">
                    <Mail className="mr-2 h-5 w-5" /> Email Me
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B] hover:text-black hover:border-[#4B7F9B] transition-all font-semibold w-full sm:w-auto" asChild>
                  <Link href="https://www.linkedin.com/in/mbrassey/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" /> LinkedIn
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B] hover:text-black hover:border-[#4B7F9B] transition-all font-semibold w-full sm:w-auto" asChild>
                  <Link href="https://github.com/mbrassey" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" /> GitHub
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-[#1F1D20] py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <p className="text-sm text-slate-600">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> <span className="text-[#4B7F9B]">brassey</span>.io
          </p>
          <ul className="flex items-center gap-5" aria-label="Built with">
            {footerTech.map((t) => (
              <li key={t.label} title={t.label}>
                <svg
                  role="img"
                  aria-label={t.label}
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-slate-600 hover:fill-[#4B7F9B] transition-colors"
                >
                  <path d={t.path} />
                </svg>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
    </MotionConfig>
  )
}
