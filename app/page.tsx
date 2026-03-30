"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  ChevronRight,
  Clock,
  Code2,
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
}

const infrastructureNodes: InfraNode[] = [
  {
    name: "Solana Firedancer Validator",
    network: "Solana",
    type: "Validator",
    description:
      "High-performance bare-metal validator running Firedancer client. AMD EPYC 9654 (96 cores, 192 threads), 768GB DDR5, dual 3.84TB NVMe, 10Gbps dedicated.",
    links: [
      { label: "Blueprint Status", url: "https://solana.theblueprint.xyz" },
      { label: "SolanaBeach", url: "https://solanabeach.io/validator/528hi3StRe7uGjt99d35myh95JPc2MqBEHTPYcEhqMg5" },
    ],
    metric: "~6% APY",
  },
  {
    name: "Ethereum Whale Validators",
    network: "Ethereum",
    type: "Validator",
    description:
      "Two enterprise-grade beacon chain validators with MEV boost. Running Geth execution client, Prysm beacon chain client, and Prysm validator client.",
    links: [
      { label: "Validator 1", url: "https://beaconcha.in/validator/0xa2397591c0af340e609253f2a18296e5a5a92895a5018871e907a693743f303a0e7d756caa889a471e04ea8ff438c0fe" },
      { label: "Validator 2", url: "https://beaconcha.in/validator/0x9869101897319059e08373a1980da6d0eff082a40eab64ae144cb31baab6122f6de15ee91ed71bd4e2a620a8f4ca5046" },
    ],
    count: 2,
  },
  {
    name: "Avalanche Validators",
    network: "Avalanche",
    type: "Validator",
    description:
      "Fleet of 8 Avalanche validators under infrastructure contract with Hivemind Capital Partners. Operating and maintaining all validators that the AVAX One treasury stakes to for rewards. Supporting 13.9M+ AVAX holdings.",
    links: [
      { label: "AVAX One Analytics", url: "https://analytics-avaxone.theblueprint.xyz" },
      { label: "Avascan", url: "https://avascan.info/staking/validator/NodeID-P3ZnA1PbneZG67Da7JG3cgxaurZa881J6/history" },
      { label: "Node 1", url: "https://subnets.avax.network/validators/NodeID-2vzqhwQuGsyHsK5MpsZ5Z6ie4bqWqJnn9" },
      { label: "Node 2", url: "https://subnets.avax.network/validators/NodeID-E3ZcXuHiZnwRNEQpwqS6NYEMnWkM7gxcj" },
      { label: "Node 3", url: "https://subnets.avax.network/validators/NodeID-N4bXacP2FXEKEwH9ZspMmoCfiQ2ceyTZT" },
      { label: "Node 4", url: "https://subnets.avax.network/validators/NodeID-8bmVx6ShttTjzYRsRGjCpHRj3wBjTiF18" },
      { label: "Node 5", url: "https://subnets.avax.network/validators/NodeID-BSDn9cwxnNdJLjNj1pHKt6yek96fYKRSr" },
      { label: "Node 6", url: "https://subnets.avax.network/validators/NodeID-Jpcaak8drpqDFD57xDGy9iRuifSZapx8X" },
      { label: "Node 7", url: "https://subnets.avax.network/validators/NodeID-KFpMCbqT4su6Ejo2TLFZs7s1u1C47FPrw" },
    ],
    metric: "$139M+ NAV",
    count: 8,
  },
  {
    name: "Audius Validators",
    network: "Audius",
    type: "Validator",
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
    description:
      "Canton Network validator supporting the enterprise-grade blockchain for synchronized financial markets.",
    links: [
      { label: "CantonScan", url: "https://www.cantonscan.com/party/blueprint-validator-1::1220daab58adcae026bd2ca7ad95014f678bda3ce2a6f91b744cf3ec3d87f09deeac" },
    ],
  },
  {
    name: "Chainlink Operator",
    network: "Ethereum",
    type: "Oracle Node",
    description:
      "Chainlink oracle node operator providing decentralized data feeds to smart contracts on Ethereum.",
    links: [
      { label: "GitHub", url: "https://github.com/MBrassey/chainlink" },
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
    title: "CC Ledger",
    subtitle: "Canton Network Infrastructure API",
    description:
      "Full-stack Canton blockchain platform with 15 REST endpoints, 15 MCP tools, and 7 immutable action types (attest, transfer, lock, mint, settle). Custom OpenAPI 3.1 spec, self-service API key registration, CCL rewards token economy, and AI agent integration via MCP server. Built with Spring Boot, Java 21, PostgreSQL 16, Flyway migrations, and gRPC ledger connection to Canton MainNet.",
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
      "Comprehensive Web3 dashboard for Base L2 blockchain with wallet connectivity via MetaMask, Coinbase, and WalletConnect. NFT gallery, OnchainKit identity & socials, token balances, and ENS resolution.",
    tech: ["Next.js", "Wagmi", "Alchemy SDK", "OnchainKit", "TypeScript"],
    url: "https://base.brassey.io",
  },
  {
    title: "TossUp",
    subtitle: "Decentralized Betting Platform",
    description:
      "Fully decentralized betting platform using Chainlink VRF for verifiable randomness, Ethereum smart contracts, and IPFS for decentralized storage with a React frontend.",
    tech: ["Solidity", "Chainlink VRF", "IPFS", "React", "Web3.js", "Truffle"],
    url: "https://mbrassey-toss-up.on.fleek.co",
  },
  {
    title: "Waviii",
    subtitle: "ERC-20 Token Ecosystem",
    description:
      "Fully decentralized ERC-20 token with integrated wallet, exchange, and real-time price charts. Built with OpenZeppelin, RESTful APIs, and deployed across Heroku, GH-Pages, and IPFS via Fleek.",
    tech: ["Solidity", "React", "Web3.js", "OpenZeppelin", "DeFi", "IPFS"],
    url: "https://waviii.io",
  },
]

const experience = [
  {
    title: "Engineering Manager",
    company: "Blueprint, inc (hivemind.capital venture)",
    location: "Remote | NYC, NY",
    period: "2023 — 2025",
    description:
      "Lead for blockchain infrastructure at Blueprint, a Hivemind Capital venture startup specializing in blockchain services. Personally designed and built the entire backend for the flagship blockchain wallet portfolio and financial analytics product.",
    highlights: [
      "Designed and implemented robust microservice architecture with unified blockchain gateway aggregating data across 25+ protocols via standardized OpenAPI specification",
      "Orchestrated creation and oversight of comprehensive blockchain infrastructure — design, testing, and deployment of fleets of full nodes and profitable validators across multiple protocols",
      "Operation of profitable mainnet validators for several distinct L1s with $500M+ AUM",
      "Built hybrid infrastructure from the ground up: on-premises bare-metal servers, cloud instances, and third-party RPC providers — driving substantial cost savings by migrating Solana and archival Ethereum/Avalanche/Algorand from cloud to bare-metal",
      "Developed custom Node Exporter and Grafana metrics for real-time visibility into peer count, block height, validator version, uptime, and resource utilization",
      "Created custom ETH2 indexer using Redis for bidirectional mapping between ETH1 deposit addresses and ETH2 validator public keys",
      "Developed AWS launch templates for 10+ blockchain nodes with unique specifications",
      "Built CC Ledger (Canton DApp) and Solentic — the first agent-facing Solana staking platform",
    ],
  },
  {
    title: "Senior Wallet Operations Engineer",
    company: "Bittrex, inc",
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
    company: "Taos, an IBM company (at Sony Pictures Entertainment)",
    location: "Remote | Culver City, CA",
    period: "2015 — 2021",
    description:
      "Lead Systems Administrator at Sony Pictures Entertainment via Taos/IBM (MSP). Responsible for the automation and success of monthly patching for over 900 Windows and Linux systems.",
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
    name: "Certified Blockchain Architect",
    issuer: "The Blockchain Council",
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
    verifyUrl: "http://verify.comptia.org/",
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
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const start = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, end])

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4B7F9B]">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.2em]">{label}</div>
    </div>
  )
}

const codeLines = [
  { type: "cmd", text: "● Read(src/validators/solana.ts)" },
  { type: "out", text: "  ⎿  Read 47 lines (1ms)" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(src/validators/solana.ts)" },
  { type: "out", text: "  ⎿  Added 14 lines, removed 3 lines" },
  { type: "ctx", text: "      12  import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';" },
  { type: "del", text: "      13 -import { getValidatorInfo } from '../utils';" },
  { type: "add", text: "      13 +import { ValidatorMetrics } from '../metrics/prometheus';" },
  { type: "add", text: "      14 +import { JitoClient } from '@jito-foundation/sdk';" },
  { type: "ctx", text: "      15" },
  { type: "ctx", text: "      16  export async function getRewards(voteAccount: string) {" },
  { type: "ctx", text: "      17    const conn = new Connection(process.env.SOLANA_RPC!);" },
  { type: "del", text: "      18 -  const rewards = await conn.getInflationReward([voteAccount]);" },
  { type: "del", text: "      19 -  return { amount: rewards[0]?.amount ?? 0 };" },
  { type: "add", text: "      18 +  const epoch = await conn.getEpochInfo();" },
  { type: "add", text: "      19 +  const [inflation, jito] = await Promise.all([" },
  { type: "add", text: "      20 +    conn.getInflationReward([voteAccount], epoch.epoch - 1)," },
  { type: "add", text: "      21 +    JitoClient.getMevReward(voteAccount, epoch.epoch - 1)," },
  { type: "add", text: "      22 +  ]);" },
  { type: "add", text: "      23 +  const base = (inflation[0]?.amount ?? 0) / LAMPORTS_PER_SOL;" },
  { type: "add", text: "      24 +  return {" },
  { type: "add", text: "      25 +    epoch: epoch.epoch," },
  { type: "add", text: "      26 +    baseReward: base," },
  { type: "add", text: "      27 +    jitoMev: jito.lamports / LAMPORTS_PER_SOL," },
  { type: "add", text: "      28 +    totalApy: ValidatorMetrics.calculateAPY(base + jito)," },
  { type: "add", text: "      29 +  };" },
  { type: "ctx", text: "      30  }" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(npm run build 2>&1 | tail -5)" },
  { type: "out", text: "  ⎿  ✓ Compiled successfully" },
  { type: "out", text: "     ○  (Static)  prerendered as static content" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Read(src/infra/deploy-avax.ts)" },
  { type: "out", text: "  ⎿  Read 38 lines (1ms)" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(src/infra/deploy-avax.ts)" },
  { type: "out", text: "  ⎿  Added 18 lines, removed 4 lines" },
  { type: "del", text: "       1 -const nodeId = process.argv[2];" },
  { type: "del", text: "       2 -console.log('deploying ' + nodeId);" },
  { type: "add", text: "       1 +import { AvalancheSDK } from '@avalabs/sdk';" },
  { type: "add", text: "       2 +import { loadConfig } from '../config';" },
  { type: "add", text: "       3 +" },
  { type: "add", text: "       4 +const config = loadConfig('avalanche');" },
  { type: "add", text: "       5 +const sdk = new AvalancheSDK({ rpc: config.rpcUrl });" },
  { type: "ctx", text: "       6" },
  { type: "del", text: "       4 -async function deploy() {" },
  { type: "del", text: "       5 -  // placeholder" },
  { type: "add", text: "       7 +async function addValidator(nodeID: string) {" },
  { type: "add", text: "       8 +  const tx = await sdk.pchain.buildAddValidatorTx({" },
  { type: "add", text: "       9 +    nodeID," },
  { type: "add", text: "      10 +    stakeAmount: config.minStake," },
  { type: "add", text: "      11 +    delegationFeeRate: 200_000," },
  { type: "add", text: "      12 +    rewardAddresses: [config.treasury]," },
  { type: "add", text: "      13 +  });" },
  { type: "add", text: "      14 +  const signed = await tx.sign(config.signerKey);" },
  { type: "add", text: "      15 +  const txId = await sdk.pchain.issueTx(signed);" },
  { type: "add", text: "      16 +  console.log('Validator added:', txId);" },
  { type: "ctx", text: "      17  }" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(docker compose up -d avalanche-node)" },
  { type: "out", text: "  ⎿  Container avax-validator-1 Started" },
  { type: "out", text: "     Container avax-validator-1 Healthy" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(src/indexer/eth2-redis.ts)" },
  { type: "out", text: "  ⎿  Added 12 lines, removed 3 lines" },
  { type: "ctx", text: "       7  import Redis from 'ioredis';" },
  { type: "del", text: "       8 -import { BeaconClient } from './beacon';" },
  { type: "add", text: "       8 +import { createBeaconClient } from './beacon';" },
  { type: "ctx", text: "       9" },
  { type: "del", text: "      10 -const redis = new Redis();" },
  { type: "add", text: "      10 +const redis = new Redis(process.env.REDIS_URL!);" },
  { type: "add", text: "      11 +const beacon = createBeaconClient(process.env.BEACON_RPC!);" },
  { type: "ctx", text: "      12" },
  { type: "ctx", text: "      13  export async function indexDeposit(eth1Addr: string) {" },
  { type: "del", text: "      14 -  const pk = await beacon.getPubkey(eth1Addr);" },
  { type: "add", text: "      14 +  const validators = await beacon.getStateValidators({" },
  { type: "add", text: "      15 +    filters: { status: 'active' }," },
  { type: "add", text: "      16 +  });" },
  { type: "add", text: "      17 +  const matched = validators.filter(" },
  { type: "add", text: "      18 +    v => v.validator.depositAddress === eth1Addr" },
  { type: "add", text: "      19 +  );" },
  { type: "add", text: "      20 +  for (const v of matched) {" },
  { type: "add", text: "      21 +    await redis.hset('eth1:eth2', eth1Addr, v.validator.pubkey);" },
  { type: "add", text: "      22 +    await redis.hset('eth2:eth1', v.validator.pubkey, eth1Addr);" },
  { type: "add", text: "      23 +  }" },
  { type: "ctx", text: "      24  }" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Update(src/metrics/node-exporter.ts)" },
  { type: "out", text: "  ⎿  Added 11 lines, removed 2 lines" },
  { type: "del", text: "       1 -import { collectDefaultMetrics } from 'prom-client';" },
  { type: "add", text: "       1 +import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';" },
  { type: "ctx", text: "       2" },
  { type: "del", text: "       3 -collectDefaultMetrics();" },
  { type: "add", text: "       3 +const registry = new Registry();" },
  { type: "add", text: "       4 +collectDefaultMetrics({ register: registry });" },
  { type: "add", text: "       5 +" },
  { type: "add", text: "       6 +export const blockHeight = new Gauge({" },
  { type: "add", text: "       7 +  name: 'validator_block_height'," },
  { type: "add", text: "       8 +  help: 'Current block height'," },
  { type: "add", text: "       9 +  labelNames: ['chain', 'node_id']," },
  { type: "add", text: "      10 +  registers: [registry]," },
  { type: "add", text: "      11 +});" },
  { type: "blank", text: "" },
  { type: "cmd", text: "● Bash(npm run build && npm run test)" },
  { type: "out", text: "  ⎿  ✓ Compiled successfully" },
  { type: "out", text: "     Tests: 24 passed, 0 failed" },
  { type: "out", text: "     ✓ All checks passed" },
]

function CodeStream() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<typeof codeLines>([])

  useEffect(() => {
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
      if (line.type === "cmd") {
        delay = Math.random() * 2000 + 1500
      } else if (line.type === "out") {
        delay = Math.random() * 400 + 200
      } else if (line.type === "blank") {
        delay = Math.random() * 300 + 100
      } else {
        delay = Math.random() * 80 + 30
      }

      timeout = setTimeout(step, delay)
    }

    timeout = setTimeout(step, 800)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div ref={containerRef} className="font-mono text-[11px] leading-[1.8] whitespace-pre px-6 pt-8 h-full overflow-hidden">
      {lines.map((line, i) => {
        if (line.type === "cmd") {
          return <div key={i} className="text-[#4B7F9B]/80 mt-2 font-bold">{line.text}</div>
        }
        if (line.type === "out") {
          return <div key={i} className="text-slate-500/60">{line.text}</div>
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
// ANIMATION VARIANTS
// =========================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

// =========================================================
// MAIN PAGE
// =========================================================

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-[#000102] text-slate-200 scan-lines">
      <ParticleNetwork />

      {/* ==================== ORBITAL NAV ==================== */}
      <nav className="orbital-nav" aria-label="Section navigation">
        {navItems.map((item) => (
          <Link key={item.id} href={`#${item.id}`} title={item.label}>
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

          <nav className="hidden md:flex items-center gap-6">
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

          <button
            className="md:hidden text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
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
            className="fixed inset-0 z-50 bg-[#000102]/98 backdrop-blur-xl md:hidden"
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
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/mbrassey/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="mailto:matt@brassey.io" className="text-slate-500 hover:text-[#4B7F9B] transition-colors">
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

      <main>
        {/* ==================== HERO ==================== */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center pt-14">
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000102] via-transparent to-[#000102]" />

          {/* Claude Code streaming diff background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-[55%] overflow-hidden opacity-[0.22]" style={{ maskImage: "linear-gradient(to right, black 30%, transparent 95%)", WebkitMaskImage: "linear-gradient(to right, black 30%, transparent 95%)" }}>
              <CodeStream />
            </div>
          </div>

          <div className="relative z-10 container px-4 md:px-6 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5"
            >
              <span className="status-dot" style={{ width: 6, height: 6 }} />
              <span className="text-emerald-400 text-xs tracking-wider">ALL SYSTEMS OPERATIONAL</span>
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
                Engineering Manager, Staking &mdash; Blockchain Infrastructure Architect
              </p>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                Commanding 50+ validators across 25+ protocols with $500M+ AUM. Building the decentralized future from
                bare-metal to smart contracts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B] text-black font-semibold" asChild>
                <Link href="#infrastructure">
                  View Infrastructure <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                asChild
              >
                <Link
                  href="https://docs.google.com/document/d/1Dpr80YVKB8gVMqLhfATrwvSWXX9PPRkTcwx9W2EodbM"
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
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
        <section className="relative py-20">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-4xl mx-auto pt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
            >
              <div className="relative flex-shrink-0">
                <div className="w-56 h-56 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-[#4B7F9B]/20 shadow-[0_0_40px_rgba(75,127,155,0.1)]">
                  <img
                    src="/mbrassey.jpg"
                    alt="Matt Brassey"
                    className="w-full h-full object-cover"
                    width={320}
                    height={320}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000102] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 font-mono text-[10px] text-[#4B7F9B]/80">
                    <div>
                      <span className="text-emerald-400/70">$</span> whoami
                      <span className="inline-block w-[5px] h-[8px] bg-[#4B7F9B] ml-0.5 animate-pulse align-baseline" />
                    </div>
                    <div className="text-[#4B7F9B]/60">matt_brassey : eng_manager_staking : blueprint</div>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left space-y-4">
                <p className="text-slate-300 text-lg leading-relaxed">
                  Engineering Manager of Staking at{" "}
                  <span className="text-[#4B7F9B]">Blueprint</span>, a{" "}
                  <span className="text-[#4B7F9B]">Hivemind Capital</span> venture. I&apos;ve designed and built a robust
                  microservice architecture with a unified blockchain gateway that aggregates data from managed nodes
                  and third-party APIs &mdash; delivering accurate live and historical block, balance, staked balance,
                  NFT balance, and transaction data across 25+ protocols through a standardized OpenAPI spec of my
                  design. I built the hybrid bare-metal and cloud infrastructure from the ground up to power it all.
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <Link
                    href="https://github.com/mbrassey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/mbrassey/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-[#4B7F9B] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="mailto:matt@brassey.io" className="text-slate-500 hover:text-[#4B7F9B] transition-colors">
                    <Mail className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Network className="h-3 w-3" />
                  <span>infrastructure</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Infrastructure Command</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Real-time validator and node operations across multiple blockchain networks. Deploying, monitoring,
                  upgrading &amp; maintaining profitable mainnet validators and data RPC nodes.
                </p>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {infrastructureNodes.map((node, i) => (
                  <motion.div
                    key={i}
                    variants={slideUp}
                    className="group relative p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer card-lift overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="status-dot" />
                        <span className="text-emerald-400 text-[10px] uppercase tracking-wider">Live</span>
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
                    <div className="space-y-2">
                      {node.metric && (
                        <div className="text-sm font-mono text-[#4B7F9B]">{node.metric}</div>
                      )}
                      {node.links && node.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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
        <section id="ai" className="relative py-24 overflow-hidden">
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Terminal className="h-3 w-3" />
                  <span>ai-development</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  The <span className="gradient-text">1000x</span> Developer
                </h2>
                <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg">
                  16 years of battle-tested engineering provides the wisdom and architectural judgment that transforms
                  AI from a tool into a force multiplier. As an elite AI operator and cutting-edge technology adopter,
                  I combine deep infrastructure expertise with 1000x development velocity &mdash; the experience to know
                  what to build, and the AI mastery to ship it in days instead of months.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div variants={slideUp} className="space-y-6">
                  <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur space-y-4 holo-shimmer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#4B7F9B]/10">
                        <Terminal className="h-5 w-5 text-[#4B7F9B]" />
                      </div>
                      <h3 className="text-lg font-bold">Claude Code &amp; OpenClaw</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      As operator and commander of elite AI agent fleets, I orchestrate specialized agents across every
                      layer of the application stack &mdash; from infrastructure provisioning and smart contract
                      development to frontend engineering, API design, and automated testing. I design custom OpenAPI 3.1
                      specifications and build MCP servers from scratch &mdash; CC Ledger exposes 15 MCP tools for
                      Canton blockchain operations, and Solentic provides 26 MCP tools with an A2A agent card for
                      autonomous Solana staking. Each agent brings deep domain expertise; I provide the architectural
                      vision, quality standards, and integration strategy that transforms raw AI capability into
                      production-ready systems shipping at institutional scale.
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur space-y-4 holo-shimmer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#4B7F9B]/10">
                        <Zap className="h-5 w-5 text-[#4B7F9B]" />
                      </div>
                      <h3 className="text-lg font-bold">Wisdom + Velocity = Elite Operator</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      16 years of extreme DevOps and engineering &mdash; from founding a solar-powered hosting company
                      and managing 900+ servers at Sony Pictures to running $500M+ in validator infrastructure &mdash;
                      provides the hard-won wisdom and guidance that separates an elite AI operator from someone just
                      prompting. Combined with 5+ years of blockchain-focused development and relentless adoption of
                      cutting-edge tooling, every AI-generated artifact is vetted against production-grade standards
                      born from real-world failures and victories. Experience is the compass; AI is the engine.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={slideUp}>
                  <div className="rounded-lg border border-[#1F1D20] bg-[#1F1D20] overflow-hidden h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1F1D20] bg-[#1a1a1e]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-slate-700/50 flex items-center justify-center">
                          <Terminal className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">matt@blueprint:~/ai-command-center</span>
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
                    <div className="p-4 sm:p-5 space-y-3 text-[11px] sm:text-[13px] flex-1 overflow-x-auto">
                      <div>
                        <span className="text-emerald-400">$</span>{" "}
                        <span className="text-[#4B7F9B]">claude</span>{" "}
                        <span className="text-slate-300">deploy solana-validator --firedancer --bare-metal</span>
                      </div>
                      <div className="text-slate-500 pl-4 space-y-0.5">
                        <div>Provisioning AMD EPYC 9654 node... <span className="text-emerald-400">&#10003;</span></div>
                        <div>Configuring Firedancer client... <span className="text-emerald-400">&#10003;</span></div>
                        <div>Validator live on mainnet <span className="text-emerald-400">&#10003;</span></div>
                      </div>

                      <div className="pt-2">
                        <span className="text-emerald-400">$</span>{" "}
                        <span className="text-[#4B7F9B]">openclaw</span>{" "}
                        <span className="text-slate-300">audit status --verbose</span>
                      </div>
                      <div className="text-slate-500 pl-4 space-y-0.5">
                        <div className="text-slate-400">&#9679; 7 Explore agents launched</div>
                        <div>&#9500;&#9472;&#9472; Canton/Daml specialist <span className="text-emerald-400">&#9679;</span> contracts+integration</div>
                        <div>&#9500;&#9472;&#9472; Spring Security specialist <span className="text-emerald-400">&#9679;</span> auth chain</div>
                        <div>&#9500;&#9472;&#9472; Database specialist <span className="text-emerald-400">&#9679;</span> schema+migrations</div>
                        <div>&#9500;&#9472;&#9472; Billing/economics specialist <span className="text-emerald-400">&#9679;</span> money flows</div>
                        <div>&#9500;&#9472;&#9472; OpenAPI+MCP spec validator <span className="text-emerald-400">&#9679;</span> validating</div>
                        <div>&#9500;&#9472;&#9472; Agent discovery+docs auditor <span className="text-emerald-400">&#9679;</span> auditing</div>
                        <div>&#9492;&#9472;&#9472; DevOps+deployment specialist <span className="text-emerald-400">&#9679;</span> infra</div>
                      </div>

                      <div className="pt-2">
                        <span className="text-emerald-400">$</span>{" "}
                        <span className="text-[#4B7F9B]">claude</span>{" "}
                        <span className="text-slate-300">build canton-ledger --full-stack --mcp</span>
                      </div>
                      <div className="text-slate-500 pl-4 space-y-0.5">
                        <div>Generating Daml contracts... <span className="text-emerald-400">&#10003;</span></div>
                        <div>Spring Boot API scaffold... <span className="text-emerald-400">&#10003;</span></div>
                        <div>MCP tool integration... <span className="text-emerald-400">&#10003;</span></div>
                        <div>Deployed &#8594; <span className="text-[#4B7F9B]">ccledger.theblueprint.xyz</span></div>
                      </div>

                      <div className="pt-2">
                        <span className="text-emerald-400">$</span>{" "}
                        <span className="typing-cursor text-slate-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={slideUp} className="flex flex-wrap gap-3 justify-center mt-12">
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <GitBranch className="h-3 w-3" />
                  <span>experience</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Experience</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  16+ years of engineering &mdash; from founding a hosting company to managing $500M+ in blockchain
                  infrastructure.
                </p>
              </motion.div>

              <div className="space-y-8">
                {experience.map((role, i) => (
                  <motion.div key={i} variants={slideUp} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-10 flex justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#4B7F9B]/30 border-2 border-[#4B7F9B] shadow-[0_0_12px_rgba(34,211,238,0.3)]" />
                    </div>
                    {i < experience.length - 1 && (
                      <div className="absolute left-0 top-5 w-10 bottom-0 flex justify-center">
                        <div className="w-px bg-gradient-to-b from-cyan-400/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/60 backdrop-blur">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold">{role.title}</h3>
                          <p className="text-[#4B7F9B] text-sm">{role.company}</p>
                          <p className="text-slate-600 text-xs">{role.location}</p>
                        </div>
                        <span className="text-sm text-slate-500 font-mono mt-1 md:mt-0 flex-shrink-0">
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Layers className="h-3 w-3" />
                  <span>expertise</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Technical Expertise</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Specialized knowledge across the full blockchain infrastructure stack.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-3">
                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4B7F9B]/10"><Server className="h-5 w-5 text-[#4B7F9B]" /></div>
                    <h3 className="text-lg font-bold">Backend &amp; Infrastructure</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Multi-Chain Protocols</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Most EVM chains (Ethereum, Polygon, Avalanche, Arbitrum) &amp; Layer 2s, L1 protocols (Solana,
                        Cardano, Cosmos, NEAR), ZK chains (Aleo, zkSync), Algorand, Aptos, Bitcoin, Hedera, Tezos, Canton.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">API &amp; Microservices</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Node.js, Express, OpenAPI specification, RESTful design, GraphQL, WebSockets, JWT authentication,
                        Infura, Alchemy, QuickNode, RapidAPI.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Data Engineering</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        On-chain data extraction, custom ETH2 indexer with Redis, MongoDB/MySQL/MsSQL, time-series
                        analytics, chain data snapshots, archival &amp; structured historical data.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4B7F9B]/10"><Code2 className="h-5 w-5 text-[#4B7F9B]" /></div>
                    <h3 className="text-lg font-bold">Frontend &amp; Web3</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Smart Contract Interaction</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Solidity, Hardhat, Truffle, Ethers.js, Web3.js, Wagmi, Alchemy SDK, OnchainKit, WalletConnect,
                        MetaMask SDK, IPFS/Filecoin, Chainlink VRF. AAVE, Balancer, Uniswap, SushiSwap, PancakeSwap.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">Modern Stack</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Next.js, React, TypeScript, React Hook Form, TanStack Query, Vite, Server Components,
                        Incremental Static Regeneration, C#.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[#4B7F9B] text-sm mb-1.5">UI/UX &amp; Tooling</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Tailwind CSS, ShadCN UI, Radix UI, responsive layouts, dark mode theming, v0.dev AI design,
                        Vercel, Remix IDE.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={slideUp} className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer space-y-6">
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Code2 className="h-3 w-3" />
                  <span>projects</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Projects</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Decentralized applications and blockchain platforms built with cutting-edge technology.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, i) => (
                  <motion.div key={i} variants={slideUp}>
                    <Link href={project.url} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur holo-shimmer card-lift h-full space-y-4">
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
                        <div className="flex flex-wrap gap-2">
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Award className="h-3 w-3" />
                  <span>certifications</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Certifications</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Professional credentials and industry certifications.
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {certifications.map((cert, i) => (
                  <motion.div
                    key={i}
                    variants={slideUp}
                    className="cert-card p-5 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur text-center space-y-3"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#4B7F9B]/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-[#4B7F9B]" />
                    </div>
                    <h3 className="font-bold text-sm">{cert.name}</h3>
                    <p className="text-xs text-slate-500">{cert.issuer}</p>
                    {cert.verifyUrl && (
                      <Link
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-600 hover:text-[#4B7F9B] transition-colors inline-flex items-center gap-1"
                      >
                        Verify <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </motion.div>
                ))}
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Users className="h-3 w-3" />
                  <span>recommendations</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Colleague Feedback</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  What colleagues and collaborators have to say.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    variants={slideUp}
                    className="relative p-6 rounded-lg border border-[#1F1D20] bg-[#1F1D20]/60 backdrop-blur"
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
              <motion.div variants={slideUp} className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Activity className="h-3 w-3" />
                  <span>activity</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Coding Activity</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  Development activity tracked in real-time.
                </p>
              </motion.div>

              <motion.div variants={slideUp}>
                <div className="rounded-lg border border-[#1F1D20] bg-[#1F1D20]/80 backdrop-blur overflow-hidden">
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
                  <div className="relative w-full" style={{ maxWidth: "100%" }}>
                    <div className="h-[300px] sm:h-[400px] md:h-[600px] lg:h-[769px]">
                      <object
                        data="https://wakatime.com/share/@532855a8-3081-4600-a53d-4262beb65d14/f2004230-ef8c-43f6-a706-5e2934626e2c.svg"
                        type="image/svg+xml"
                        className="absolute w-full h-full"
                        style={{ backgroundColor: "transparent", maxWidth: "1048px", margin: "0 auto", left: 0, right: 0 }}
                      >
                        Coding activity chart
                      </object>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==================== CONTACT ==================== */}
        <section id="contact" className="relative py-16 md:py-24">
          <div className="section-divider" />
          <div className="container px-4 md:px-6 max-w-3xl mx-auto pt-12 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={slideUp} className="space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
                  <Mail className="h-3 w-3" />
                  <span>contact</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Let&apos;s Connect</h2>
                <p className="text-slate-400 text-lg">
                  Interested in blockchain infrastructure, validator operations, or decentralized systems?
                  Let&apos;s talk.
                </p>
              </motion.div>

              <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B] text-black font-semibold" asChild>
                  <Link href="mailto:matt@brassey.io">
                    <Mail className="mr-2 h-5 w-5" /> Email Me
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B]/10" asChild>
                  <Link href="https://www.linkedin.com/in/mbrassey/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" /> LinkedIn
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B]/10" asChild>
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
            &copy; 2025 <span className="text-[#4B7F9B]">brassey</span>.io
          </p>
          <ul className="dev-icons">
            <li className="list-inline-item"><i className="fab fa-ethereum"></i></li>
            <li className="list-inline-item"><i className="fab fa-js-square"></i></li>
            <li className="list-inline-item"><i className="fab fa-react"></i></li>
            <li className="list-inline-item"><i className="fab fa-node-js"></i></li>
            <li className="list-inline-item"><i className="fab fa-docker"></i></li>
            <li className="list-inline-item"><i className="fab fa-git"></i></li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
