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
  Clock,
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

  const socialIconsVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
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
        "Matt has been an integral part of the Wallet Operations team for the last two years and has consistently demonstrated his ability to efficiently manage and maintain complex wallet infrastructure and integrate new blockchain projects. His strong technical knowledge allows him to implement innovative solutions and significantly improve our operational processes.",
      author: "Artem Tarasov",
      title: "Lead Engineer",
      profileUrl: "https://www.linkedin.com/in/artem-tarasov-07907091/",
      image: "/artem.jpeg?height=80&width=80",
    },
    {
      quote:
        "I worked with Matt for two years and it was an absolute pleasure. His work ethic set the bar for the team. He is an outstanding Blockchain Wallet Engineer. He knocked all of his assigned projects out of the park. He is excellent at writing clear and precise technical documentation. Last, but not least, he was always available to troubleshoot issues with fellow engineers no matter what his workload was like at the time.",
      author: "Scott Sisco",
      title: "Linux Operations Engineer",
      profileUrl: "https://www.linkedin.com/in/scott-sisco-b079053a/",
      image: "/scott.jpeg?height=80&width=80",
    },
    {
      quote:
        "Matt is a hard worker and was able to produce great code in a neat and timely manner. His contributions to our projects were beyond valuable, showing a great understanding of the technologies we used within our full stack web app.",
      author: "Ryan Brown",
      title: "Full Stack Web Developer",
      profileUrl: "https://www.linkedin.com/in/ryan-brown-83760479/",
      image: "/ryan.jpeg?height=80&width=80",
    },
    {
      quote:
        "It was awesome to watch the project come together thanks to Matt's ability to translate wireframed concepts into reality and his deep knowledge of the technologies our app is built upon.",
      author: "Matthew Ondrovic",
      title: "Full Stack Web Developer",
      profileUrl: "https://www.linkedin.com/in/matthew-ondrovic-a43826131/",
      image: "/matthew.jpeg?height=80&width=80",
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

          {/* Mobile Header Right Section */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Social Icons - Only visible when menu is open */}
            {isMenuOpen && (
              <div className="flex items-center gap-3 mr-2 animate-fade-in">
                <Link
                  href="https://github.com/mbrassey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#4B7F9B] transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link
                  href="https://www.linkedin.com/in/mbrassey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#4B7F9B] transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="mailto:matt@brassey.io" className="text-gray-400 hover:text-[#4B7F9B] transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#expertise">
              Expertise
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#projects">
              Projects
            </Link>
            <Link className="text-sm font-medium hover:text-[#4B7F9B] transition-colors" href="#coding-time">
              Coding Time
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
                href="#coding-time"
                onClick={() => setIsMenuOpen(false)}
              >
                Coding Time <ChevronRight className="h-4 w-4" />
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
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid Pattern - Only visible on right side with fade in middle */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 bg-gradient-to-l from-100% via-30% to-transparent"></div>

            {/* Code Animation - Only visible on left side */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 left-0 right-1/2 overflow-hidden">
                <div className="relative h-[200%]">
                  {/* First copy of the code */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: "-50%" }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 40,
                      ease: "linear",
                      repeatType: "loop",
                    }}
                    className="absolute top-0 left-0 w-full text-[#4B7F9B] font-mono text-xs sm:text-sm whitespace-pre leading-tight opacity-30"
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
                  {/* Second copy of the code (identical) to create seamless loop */}
                  <motion.div
                    initial={{ y: "-50%" }}
                    animate={{ y: "-100%" }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 40,
                      ease: "linear",
                      repeatType: "loop",
                    }}
                    className="absolute top-0 left-0 w-full text-[#4B7F9B] font-mono text-xs sm:text-sm whitespace-pre leading-tight opacity-30"
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
              </div>
            </div>
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#000102]/80 via-[#000102]/30 to-[#000102]/80 z-0"></div>

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
                <span className="text-[#4B7F9B]">Blockchain</span> Infrastructure &{" "}
                <span className="text-[#4B7F9B]">Engineering</span>
              </h1>
              <p className="text-xl text-gray-400">
                Building decentralized infrastructure with blockchain expertise, from node operations to cross-chain
                data aggregation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90" asChild>
                  <Link href="#expertise">
                    View my Skillsets <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                  asChild
                >
                  <Link
                    href="https://docs.google.com/document/d/1T7uHv2RcH_wzERwJKoahqh9ODKdaJ48ci40nKEBViNY"
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Technical Skillsets</h2>
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
                        <h4 className="font-mono text-[#4B7F9B]">Multi-Chain Infrastructure</h4>
                        <p className="text-gray-400 text-sm">
                          EVM chains (Ethereum, Polygon, Avalanche, Arbitrum), L1 protocols (Solana, Cardano, Cosmos,
                          NEAR), ZK chains (Aleo, zkSync), Custom node configuration, Consensus management, Chain data
                          indexing
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">API & Microservices</h4>
                        <p className="text-gray-400 text-sm">
                          Express/Node.js, OpenAPI specification, RESTful design, GraphQL endpoints, WebSockets, JWT
                          authentication, Rate limiting, API gateways
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Data Engineering</h4>
                        <p className="text-gray-400 text-sm">
                          On-chain data extraction, Block explorers, MongoDB/MySQL/MsSQL, Redis caching, Time-series
                          analytics, Real-time metrics, Data archiving strategies
                        </p>
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
                        <p className="text-gray-400 text-sm">
                          Ethers.js, Web3.js, WalletConnect, MetaMask SDK, IPFS/Filecoin, The Graph, Chainlink VRF,
                          OpenSea SDK, Supabase
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Modern Frontend Stack</h4>
                        <p className="text-gray-400 text-sm">
                          React/Next.js, TypeScript, React Hook Form, Vite, Server Components, Incremental Static
                          Regeneration
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">UI/UX Architecture</h4>
                        <p className="text-gray-400 text-sm">
                          Tailwind CSS, ShadCN UI, Responsive layouts, Dark mode theming, Animation libraries, v0.dev AI
                          design
                        </p>
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
                        <h4 className="font-mono text-[#4B7F9B]">Infrastructure Management</h4>
                        <p className="text-gray-400 text-sm">
                          Bare-metal servers, Cloud provisioning, Proxmox virtualization, Docker containerization
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Blockchain Operations</h4>
                        <p className="text-gray-400 text-sm">
                          Full-node deployment, Validator setup, Network upgrades, RPC endpoint configuration, Consensus
                          monitoring, Archival node management, Snapshot automation
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[#4B7F9B]">Monitoring & Observability</h4>
                        <p className="text-gray-400 text-sm">
                          Grafana dashboards, Prometheus metrics, Node Exporter customization, Alert management, Log
                          aggregation, Performance benchmarking, Health checks
                        </p>
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
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Blockchain solutions & Dapps</p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2">
                {[
                  {
                    title: "Bina",
                    description:
                      "Decentralized exchange and blockchain portfolio wrapper with comprehensive user authentication, including Supabase integration, 2FA, password reset, and signup capabilities. Features robust security measures and state management.",
                    tech: ["React", "Vite", "TypeScript", "Supabase", "2FA", "Redux", "Web3.js"],
                    image: "/bina.png?height=300&width=500",
                    demoUrl: "https://bina-demo-omega.vercel.app/",
                  },
                  {
                    title: "Waviii",
                    description:
                      "ERC-20 token platform with integrated wallet and exchange functionality. Features MetaMask integration, real-time price charts, and transaction history tracking. Built with OpenZeppelin and React.",
                    tech: ["Solidity", "Ethereum", "React", "Web3.js", "MetaMask", "OpenZeppelin", "DeFi"],
                    image: "/waviii.png?height=300&width=500",
                    demoUrl: "https://waviii.io/",
                  },
                  {
                    title: "TossUp",
                    description:
                      "Decentralized betting platform using Chainlink's VRF for verifiable randomness. Implements Ethereum smart contracts and IPFS for decentralized storage. Provides trustless gambling experience.",
                    tech: ["Solidity", "React", "Web3.js", "IPFS", "Chainlink VRF", "MetaMask", "Smart Contracts"],
                    image: "/tossup.png?height=300&width=500",
                    demoUrl: "https://mbrassey-toss-up.on.fleek.co/",
                  },
                  {
                    title: "Audius",
                    description:
                      "Node operator for decentralized music platform, managing 17 nodes on Solana-based sidechain. Earns 13,000+ AUDIO tokens weekly by hosting music and media content. Supports Web3 music ecosystem.",
                    tech: ["Node Operation", "Ethereum", "Solana", "Bare Metal Servers", "Web3", "Content Delivery"],
                    image: "/audius.png?height=300&width=500",
                    demoUrl:
                      "https://dashboard-audius-org.ipns.dweb.link/#/nodes/operator/0x68f656d19AC6d14dF209B1dd6E543b2E81d53D7B/",
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
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: "center 10%" }}
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

        {/* Coding Time Section */}
        <section id="coding-time" className="w-full py-20 bg-[#000102] border-t border-[#1F1D20]">
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
                  <span>// coding-time</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Coding Activity</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  My recent development activity tracked with VS Code.
                </p>
              </motion.div>

              <motion.div variants={slideUp} className="w-full">
                <Card className="bg-[#1F1D20]/50 backdrop-blur border-[#1F1D20] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-4">
                      <Clock className="h-5 w-5 text-[#4B7F9B]" />
                      <h3 className="text-lg font-mono text-white">Monthly Coding Stats</h3>
                    </div>
                    <div className="w-full overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: "100%" }}>
                        <div className="h-[300px] sm:h-[400px] md:h-[600px] lg:h-[769px]">
                          <object
                            data="https://wakatime.com/share/@532855a8-3081-4600-a53d-4262beb65d14/f2004230-ef8c-43f6-a706-5e2934626e2c.svg"
                            type="image/svg+xml"
                            className="absolute w-full h-full"
                            style={{
                              backgroundColor: "transparent",
                              maxWidth: "1048px",
                              margin: "0 auto",
                              left: "0",
                              right: "0",
                            }}
                          >
                            Coding activity chart
                          </object>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end p-4">
                      <Link
                        href="https://github.com/mbrassey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#4B7F9B] hover:text-[#4B7F9B]/80 transition-colors flex items-center"
                      >
                        <Github className="mr-1 h-4 w-4" />
                        <span>View GitHub Profile</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="recommendations" className="w-full py-20 bg-[#1F1D20]/20 border-t border-[#1F1D20]">
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Feedback</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Comments from colleagues and clients</p>
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
          <div className="container px-4 md:px-6 pb-16">
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
                  Hi, I'm <span className="text-[#4B7F9B]">Matt Brassey</span>. As Engineering Manager @ Blueprint, I've
                  built a comprehensive microservice architecture with a unified blockchain gateway, aggregating data
                  from managed nodes and third-party APIs. It delivers real-time and historical blockchain data across
                  25+ protocols, powered by a hybrid infrastructure of bare-metal servers, cloud instances & Web3
                  providers. I lead automation of full-node deployments, monitoring, upgrades, performance optimization,
                  archival storage, and indexing solutions.
                </p>
                <p className="text-lg text-gray-400">
                  Previously, I managed 200+ wallets at a top exchange, integrating L1 & L2 protocols, securing
                  transactions, and optimizing API servers. With expertise in Staking, Validator Operations, and Web3, I
                  drive innovation in decentralized infrastructure.
                </p>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-mono text-[#4B7F9B]">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Blockchain Architecture",
                      "Node Infrastructure",
                      "Smart Contracts",
                      "System Design",
                      "Team Leadership",
                      "Technical Strategy",
                      "Security",
                      "Microservices Architecture",
                      "Full-Node Deployment",
                      "Blockchain API Integration",
                      "Monitoring & Observability",
                      "Staking & Validator Operations",
                    ].map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-[#1F1D20]/50 border-[#1F1D20] text-gray-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-3">
                  <h3 className="text-xl font-bold font-mono text-[#4B7F9B]">AI Proficiency</h3>
                  <p className="text-gray-400">
                    Years of experience wielding Cursor, GitHub Copilot, Claude, and v0.dev for solving complex computer
                    science problems with consistent and verifiable AI code generation that is vetted, coherent, and
                    ready to ship.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#4B7F9B] text-[#4B7F9B] hover:bg-[#4B7F9B]/10"
                    asChild
                  >
                    <Link
                      href="https://docs.google.com/document/d/1T7uHv2RcH_wzERwJKoahqh9ODKdaJ48ci40nKEBViNY"
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
                    src="/mbrassey.jpg?height=400&width=400"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000102] via-transparent to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 font-mono text-xs text-[#4B7F9B] opacity-70">
                    <div className="typing-effect">
                      <span>$ whoami</span>
                      <br />
                      <span>matt_brassey : engineering_manager : blueprint</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-mono">Connect</h2>
                <p className="text-xl text-gray-400">Ways to contact me</p>
              </motion.div>

              <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#4B7F9B] hover:bg-[#4B7F9B]/90" asChild>
                  <Link href="mailto:matt@brassey.io">
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
                  <Link href="https://www.linkedin.com/in/mbrassey/" target="_blank" rel="noopener noreferrer">
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
                  <Link href="https://github.com/mbrassey" target="_blank" rel="noopener noreferrer">
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
          <ul className="dev-icons">
            <li className="list-inline-item" data-name="Ethereum">
              <i className="fab fa-ethereum"></i>
            </li>
            <li className="list-inline-item" data-name="JavaScript">
              <i className="fab fa-js-square"></i>
            </li>
            <li className="list-inline-item" data-name="React">
              <i className="fab fa-react"></i>
            </li>
            <li className="list-inline-item" data-name="Node.js">
              <i className="fab fa-node-js"></i>
            </li>
            <li className="list-inline-item" data-name="NPM">
              <i className="fab fa-npm"></i>
            </li>
            <li className="list-inline-item" data-name="Git">
              <i className="fab fa-git"></i>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

