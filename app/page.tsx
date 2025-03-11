"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Database,
  FileText,
  Github,
  Linkedin,
  Mail,
  Menu,
  Server,
  X,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [text, setText] = useState("")
  const fullText = "Senior Blockchain Engineer"

  useEffect(() => {
    setIsMounted(true)

    let i = 0
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  if (!isMounted) {
    return null
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Recommendations data with manual profile URLs and images
  const recommendations = [
    {
      quote:
        "One of the most technically proficient blockchain engineers I've worked with. Their architecture decisions saved us months of development time.",
      author: "Sarah Chen",
      title: "CTO, DeFi Protocol",
      profileUrl: "https://linkedin.com/in/sarahchen",
      image: "/placeholder.svg?height=80&width=80", // Replace with actual image path
    },
    {
      quote:
        "Exceptional ability to translate complex blockchain concepts into practical solutions. A true asset to any development team.",
      author: "Michael Rodriguez",
      title: "Lead Developer, Ethereum Foundation",
      profileUrl: "https://linkedin.com/in/michaelrodriguez",
      image: "/placeholder.svg?height=80&width=80", // Replace with actual image path
    },
    {
      quote:
        "Their smart contract auditing expertise identified critical vulnerabilities that could have cost us millions. Meticulous and thorough.",
      author: "Aisha Johnson",
      title: "Security Lead, Blockchain Security Firm",
      profileUrl: "https://linkedin.com/in/aishajohnson",
      image: "/placeholder.svg?height=80&width=80", // Replace with actual image path
    },
    {
      quote:
        "Not just a developer, but a visionary who understands both the technical and business implications of blockchain technology.",
      author: "David Park",
      title: "Founder, Web3 Startup",
      profileUrl: "https://linkedin.com/in/davidpark",
      image: "/placeholder.svg?height=80&width=80", // Replace with actual image path
    },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#000102] text-white">
      <header className="sticky top-0 z-40 w-full border-b border-[#1F1D20] bg-[#000102]/95 backdrop-blur supports-[backdrop-filter]:bg-[#000102]/60">
        <div className="container flex h-16 items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <span className="font-mono text-xl">
              <span className="text-[#4B7F9B]">brassey</span>.io
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#expertise">
              Expertise
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#projects">
              Projects
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#recommendations">
              Recommendations
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#about">
              About
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#contact">
              Contact
            </Link>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[#1F1D20]"
          >
            <nav className="container py-4 flex flex-col gap-4">
              <Link
                className="flex w-full justify-between items-center text-sm font-medium hover:text-[#4B7F9B] transition-colors"
                href="#expertise"
                onClick={() => setIsMenuOpen(false)}
              >
                Expertise <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex w-full justify-between items-center text-sm font-medium hover:text-[#4B7F9B] transition-colors"
                href="#projects"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex w-full justify-between items-center text-sm font-medium hover:text-[#4B7F9B] transition-colors"
                href="#recommendations"
                onClick={() => setIsMenuOpen(false)}
              >
                Recommendations <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex w-full justify-between items-center text-sm font-medium hover:text-[#4B7F9B] transition-colors"
                href="#about"
                onClick={() => setIsMenuOpen(false)}
              >
                About <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                className="flex w-full justify-between items-center text-sm font-medium hover:text-[#4B7F9B] transition-colors"
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          {/* Code Animation Background - Now covers the entire section */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 60,
                ease: "linear",
              }}
              className="text-[#4B7F9B] font-mono text-xs sm:text-sm whitespace-pre leading-tight w-full"
            >
              {`
function deploySmartContract(bytecode, abi, args) {
  const contract = new web3.eth.Contract(abi);
  return contract.deploy({
    data: bytecode,
    arguments: args
  }).send({
    from: account,
    gas: 1500000,
    gasPrice: '30000000000'
  });
}

async function verifyTransaction(txHash) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);
  if (!receipt) return { status: 'pending' };
  
  const block = await web3.eth.getBlock(receipt.blockNumber);
  const confirmations = 
    await web3.eth.getBlockNumber() - receipt.blockNumber;
  
  return {
    status: receipt.status ? 'confirmed' : 'failed',
    blockNumber: receipt.blockNumber,
    timestamp: block.timestamp,
    confirmations
  };
}

class BlockchainNode {
  constructor(network, nodeUrl) {
    this.network = network;
    this.web3 = new Web3(nodeUrl);
    this.connected = false;
  }
  
  async connect() {
    try {
      await this.web3.eth.net.isListening();
      this.connected = true;
      console.log(\`Connected to \${this.network}\`);
      return true;
    } catch (error) {
      console.error(\`Failed to connect: \${error.message}\`);
      return false;
    }
  }
  
  async getLatestBlock() {
    if (!this.connected) await this.connect();
    return this.web3.eth.getBlock('latest');
  }
}

function createWallet(entropy) {
  const wallet = ethers.Wallet.createRandom(entropy);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

async function estimateGas(txData) {
  try {
    const gas = await web3.eth.estimateGas(txData);
    const gasPrice = await web3.eth.getGasPrice();
    const gasCost = web3.utils.fromWei(
      (gas * gasPrice).toString(), 
      'ether'
    );
    
    return {
      gas,
      gasPrice,
      gasCost,
      totalCost: gasCost
    };
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw new Error('Transaction would fail');
  }
}

class SmartContractEvent {
  constructor(contract, eventName) {
    this.contract = contract;
    this.eventName = eventName;
    this.listeners = [];
  }
  
  subscribe(callback) {
    this.listeners.push(callback);
    this.contract.events[this.eventName]((error, event) => {
      if (error) {
        console.error(\`Event error: \${error}\`);
        return;
      }
      
      this.listeners.forEach(listener => {
        listener(event.returnValues);
      });
    });
  }
  
  unsubscribe(callback) {
    this.listeners = this.listeners.filter(
      listener => listener !== callback
    );
  }
}

async function signMessage(message, privateKey) {
  const web3 = new Web3();
  const signature = web3.eth.accounts.sign(
    message, 
    privateKey
  );
  return signature;
}

function verifySignature(message, signature, address) {
  const web3 = new Web3();
  const recovered = web3.eth.accounts.recover(
    message,
    signature
  );
  return recovered.toLowerCase() === address.toLowerCase();
}
      `}
            </motion.div>
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000102]/80 via-[#000102]/40 to-[#000102]/80 z-0"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-3xl mx-auto text-center space-y-8"
            >
              <div className="inline-block mx-auto bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-4">
                <span className="mr-2">$</span>
                <span className="typing-cursor">{text}</span>
                <span className="animate-blink">_</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none font-mono">
                <span className="text-[#4B7F9B]">Blockchain</span> Architecture &{" "}
                <span className="text-[#4B7F9B]">Engineering</span>
              </h1>
              <p className="text-xl text-gray-400">
                Building decentralized systems with security, scalability, and performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90" asChild>
                  <Link href="#expertise">
                    View My Expertise <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                  asChild
                >
                  <Link
                    href="https://docs.google.com/document/d/your-resume-id"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Resume
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="expertise" className="w-full py-20 border-t border-[#1F1D20] bg-[#000102]">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto space-y-12"
            >
              <motion.div variants={slideUp} className="text-center space-y-4">
                <div className="inline-block mx-auto bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-2">
                  <span>// expertise</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Technical Expertise</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Specialized knowledge across the blockchain technology stack
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-3">
                {/* Backend */}
                <motion.div variants={slideUp} className="flex flex-col space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-[#1F1D20] text-[#4B7F9B]">
                      <Server className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-mono">Backend</h3>
                  </div>

                  <Card className="flex-1 bg-[#1F1D20]/50 backdrop-blur border-[#1F1D20] hover:border-[#4B7F9B]/40 transition-colors">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Blockchain Core</h4>
                        <p className="text-gray-400 text-sm">Ethereum, Solana, Polkadot, Layer 2 solutions</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Smart Contracts</h4>
                        <p className="text-gray-400 text-sm">Solidity, Rust, ERC standards, security auditing</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Consensus</h4>
                        <p className="text-gray-400 text-sm">PoW, PoS, DPoS, Byzantine fault tolerance</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Frontend */}
                <motion.div variants={slideUp} className="flex flex-col space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-[#1F1D20] text-[#4B7F9B]">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-mono">Frontend</h3>
                  </div>

                  <Card className="flex-1 bg-[#1F1D20]/50 backdrop-blur border-[#1F1D20] hover:border-[#4B7F9B]/40 transition-colors">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Web3 Integration</h4>
                        <p className="text-gray-400 text-sm">ethers.js, web3.js, wallet integration</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">DApp Development</h4>
                        <p className="text-gray-400 text-sm">React, Next.js, TypeScript, state management</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">UI/UX Design</h4>
                        <p className="text-gray-400 text-sm">Responsive interfaces, blockchain data visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* DevOps */}
                <motion.div variants={slideUp} className="flex flex-col space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-[#1F1D20] text-[#4B7F9B]">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-mono">DevOps</h3>
                  </div>

                  <Card className="flex-1 bg-[#1F1D20]/50 backdrop-blur border-[#1F1D20] hover:border-[#4B7F9B]/40 transition-colors">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Node Infrastructure</h4>
                        <p className="text-gray-400 text-sm">Validator setup, RPC endpoints, monitoring</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">CI/CD Pipeline</h4>
                        <p className="text-gray-400 text-sm">Smart contract testing, automated security scanning</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Security</h4>
                        <p className="text-gray-400 text-sm">Key management, audit preparation, compliance</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="projects" className="w-full py-20 bg-[#1F1D20]/20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto space-y-12"
            >
              <motion.div variants={slideUp} className="text-center space-y-4">
                <div className="inline-block mx-auto bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-2">
                  <span>// projects</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Featured Projects</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Blockchain solutions I've architected and delivered
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2">
                {[
                  {
                    title: "DeFi Lending Protocol",
                    description: "Decentralized lending platform with automated interest rate adjustments.",
                    tech: ["Solidity", "Ethereum", "React"],
                    image: "/placeholder.svg?height=300&width=500",
                    demoUrl: "https://defi-lending-demo.example.com",
                  },
                  {
                    title: "NFT Marketplace",
                    description: "High-performance NFT marketplace with royalty enforcement.",
                    tech: ["Rust", "Solana", "Next.js"],
                    image: "/placeholder.svg?height=300&width=500",
                    demoUrl: "https://nft-marketplace-demo.example.com",
                  },
                  {
                    title: "DAO Governance System",
                    description: "Sophisticated governance framework for decentralized organizations.",
                    tech: ["Solidity", "Polygon", "Vue.js"],
                    image: "/placeholder.svg?height=300&width=500",
                    demoUrl: "https://dao-governance-demo.example.com",
                  },
                  {
                    title: "Cross-Chain Bridge",
                    description: "Secure bridge for asset transfers between blockchain networks.",
                    tech: ["Rust", "Substrate", "React"],
                    image: "/placeholder.svg?height=300&width=500",
                    demoUrl: "https://cross-chain-bridge-demo.example.com",
                  },
                ].map((project, index) => (
                  <motion.div
                    key={index}
                    variants={slideUp}
                    className="group overflow-hidden rounded-md border border-[#1F1D20] bg-[#1F1D20]/50 backdrop-blur hover:bg-[#1F1D20]/80 transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden border-b border-[#1F1D20] relative group">
                      <Link
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                      >
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="object-cover transition-all duration-500 group-hover:scale-105 h-full w-full"
                          width={500}
                          height={300}
                        />
                        <div className="absolute inset-0 bg-[#4B7F9B]/0 group-hover:bg-[#4B7F9B]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="bg-[#000102]/80 text-white px-3 py-1 rounded-md text-sm font-mono">
                            View Demo
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold font-mono group-hover:text-[#4B7F9B] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-400">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-[#000102]/50 border-[#4B7F9B]/30 text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="recommendations" className="w-full py-20 bg-[#000102] border-t border-[#1F1D20]">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto space-y-12"
            >
              <motion.div variants={slideUp} className="text-center space-y-4">
                <div className="inline-block mx-auto bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-2">
                  <span>// recommendations</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">What Others Say</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Feedback from colleagues and clients</p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    variants={slideUp}
                    className="relative p-6 border border-[#1F1D20] rounded-md bg-[#1F1D20]/30 backdrop-blur"
                  >
                    <div className="absolute -top-3 -left-1 text-[#4B7F9B] text-4xl font-mono">"</div>
                    <div className="pt-4 pb-6">
                      <p className="text-gray-300 italic">{recommendation.quote}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Profile Image */}
                      <Link
                        href={recommendation.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-10 w-10 rounded-full overflow-hidden border border-[#4B7F9B]/30 hover:border-[#4B7F9B] transition-colors"
                      >
                        <img
                          src={recommendation.image || "/placeholder.svg"}
                          alt={`${recommendation.author}'s profile`}
                          className="h-full w-full object-cover"
                          width={40}
                          height={40}
                        />
                      </Link>
                      <div>
                        <Link
                          href={recommendation.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-[#4B7F9B] transition-colors"
                        >
                          {recommendation.author}
                        </Link>
                        <p className="text-sm text-gray-400">{recommendation.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="w-full py-20 bg-[#000102]">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto grid gap-12 md:grid-cols-2 items-center"
            >
              <motion.div variants={slideUp} className="space-y-6">
                <div className="inline-block bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-2">
                  <span>// about</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">About Me</h2>
                <p className="text-lg text-gray-400">
                  With over 10 years in software engineering and 5+ years specializing in blockchain technologies, I've
                  led teams building cutting-edge decentralized applications and infrastructure.
                </p>
                <p className="text-lg text-gray-400">
                  My career began in traditional backend development before transitioning to distributed systems. When
                  blockchain emerged, I recognized its transformative potential and pivoted to focus exclusively on this
                  technology.
                </p>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-mono text-[#4B7F9B]">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Blockchain Architecture",
                      "Smart Contracts",
                      "System Design",
                      "Team Leadership",
                      "Technical Strategy",
                      "Security",
                    ].map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-[#1F1D20]/50 border-[#1F1D20] text-gray-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                    asChild
                  >
                    <Link
                      href="https://docs.google.com/document/d/your-resume-id"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Full Resume
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={slideUp} className="relative mx-auto aspect-square max-w-md">
                <div className="absolute inset-0 rounded-full bg-[#4B7F9B]/10 blur-3xl" />
                <div className="relative mx-auto aspect-square overflow-hidden rounded-md border-2 border-[#4B7F9B]/30 shadow-xl">
                  <img
                    alt="Professional headshot"
                    className="h-full w-full object-cover"
                    src="/placeholder.svg?height=400&width=400"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000102] via-transparent to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 font-mono text-xs text-[#4B7F9B] opacity-70">
                    <div className="typing-effect">
                      <span>$ whoami</span>
                      <br />
                      <span>blockchain_engineer</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="w-full py-20 bg-[#1F1D20]/20 border-t border-[#1F1D20]">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-3xl mx-auto text-center space-y-8"
            >
              <motion.div variants={slideUp} className="space-y-4">
                <div className="inline-block mx-auto bg-[#1F1D20] rounded-lg p-1 px-3 text-xs font-mono text-[#4B7F9B] mb-2">
                  <span>// contact</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Get In Touch</h2>
                <p className="text-xl text-gray-400">Interested in collaborating on blockchain projects?</p>
              </motion.div>

              <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90" asChild>
                  <Link href="mailto:your.email@example.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Me
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                  asChild
                >
                  <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                  asChild
                >
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#1F1D20] py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2025 <span className="text-[#4B7F9B]">brassey</span>.io
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5 text-gray-500 hover:text-[#4B7F9B] transition-colors" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 text-gray-500 hover:text-[#4B7F9B] transition-colors" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="mailto:your.email@example.com">
              <Mail className="h-5 w-5 text-gray-500 hover:text-[#4B7F9B] transition-colors" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

