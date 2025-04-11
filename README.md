# brassey.io - Portfolio Website

A modern, responsive portfolio website showcasing blockchain infrastructure and engineering expertise. Built with Next.js 15, React 19, and TypeScript.

![brassey.io](public/mbrassey.jpg)

## 🚀 Live Site

Visit the live site at [brassey.io](https://brassey.io)

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15**: Modern React framework with App Router for server components and routing
- **React 19**: Latest React library for building user interfaces
- **TypeScript**: Type-safe JavaScript for better developer experience and code quality

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **ShadCN UI**: High-quality, accessible, and customizable component library
- **Radix UI**: Unstyled, accessible UI components (powering ShadCN)
- **Lucide React**: Beautiful, consistent SVG icons
- **Framer Motion**: Advanced animation library for React
- **Font Awesome**: Icon set for tech logos displayed in footer
- **JetBrains Mono**: Mono-spaced font from Google Fonts
- **next-themes**: Theme management (dark mode) for Next.js

### State Management & Client Data
- **React Context**: Context API for state management
- **TanStack Query**: Data fetching and state management
- **SWR**: React Hooks for data fetching
- **Zustand**: Lightweight state management
- **Redux Toolkit**: Comprehensive state management (as needed)

### Form Handling
- **React Hook Form**: Performant, flexible form validation
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Connect React Hook Form with Zod

### UI Components & Utilities
- **Embla Carousel**: Lightweight carousel component
- **React Day Picker**: Date picker component
- **Vaul**: Drawer component for React
- **React Resizable Panels**: Resizable panel groups
- **Recharts**: Charting library for React
- **Sonner**: Toast notifications for React
- **Input-OTP**: One-time password input component
- **clsx/tailwind-merge**: Utility for conditional CSS class joining
- **class-variance-authority**: CSS variants with type safety

### Web3 Integrations
- **Ethers.js**: Ethereum wallet implementation
- **Web3.js**: Ethereum JavaScript API
- **Wagmi**: React hooks for Ethereum
- **Alchemy SDK**: Blockchain API integrations
- **OnchainKit**: Base blockchain identity components
- **WalletConnect**: Connect to mobile wallets
- **MetaMask SDK**: Browser extension wallet integration
- **IPFS/Filecoin**: Decentralized storage
- **The Graph**: Indexing protocol for querying networks
- **Chainlink VRF**: Verifiable random functions
- **OpenSea SDK**: NFT marketplace integration
- **Alchemy/Quicknode**: RPC providers

### Build & Development
- **Vite**: Fast development server and bundler
- **Incremental Static Regeneration**: Next.js feature for static page updates
- **Server Components**: React components that render on the server
- **TypeScript**: Static type checking
- **Tailwind CSS plugins**: Additional Tailwind functionality
- **PostCSS**: CSS transformer

## 🏗️ Architecture

The website follows the modern Next.js App Router architecture:

```
app/                  # Next.js App Router structure
├── layout.tsx        # Root layout with metadata and providers
├── page.tsx          # Main landing page
├── icon.tsx          # Dynamic favicon generator
└── globals.css       # Global styles

components/           # React components
├── ui/               # ShadCN UI components
│   ├── button.tsx    # Button component
│   └── card.tsx      # Card component
└── theme-provider.tsx # Theme provider for dark mode

lib/                  # Utility functions and shared logic
├── utils.ts          # Helper functions
└── animations.ts     # Framer Motion animations

hooks/                # Custom React hooks
```

## 📱 Features

- **Responsive Design**: Mobile-first approach for all screen sizes
- **Dark Mode**: Default dark theme with custom styling
- **Animations**: Smooth, performant animations with Framer Motion
- **Interactive UI**: Modern, interactive user interface
- **Web3 Integration**: Showcases blockchain projects and experiences
- **Accessibility**: Built with accessibility in mind
- **SEO Optimized**: Meta tags and structured data for search engines
- **Performance Optimized**: Fast load times and optimized assets

## 🖼️ Projects Showcase

The website features several blockchain projects:

1. **Base**: Web3 dashboard for Base blockchain with wallet connectivity
2. **Waviii**: ERC-20 token platform with wallet and exchange functionality
3. **TossUp**: Decentralized betting platform using Chainlink VRF
4. **Audius**: Node operator for decentralized music platform

## 🚀 Deployment

The website is deployed on Vercel, leveraging:

- **CI/CD**: Automatic deployments on push to main
- **Edge Functions**: Global distribution for fast access
- **Analytics**: Performance and usage metrics
- **Domain Management**: Custom domain with SSL

## 📈 Performance

The website is optimized for performance:

- **Core Web Vitals**: Optimized for key metrics
- **Lazy Loading**: Images and components load as needed
- **Code Splitting**: Only load what's necessary
- **Asset Optimization**: Compressed images and optimized fonts

## 🧰 DevOps Integration

The project implements modern DevOps practices:

- **Git Workflow**: Version control with GitHub
- **GitHub Actions**: CI/CD automation
- **Infrastructure as Code**: Deployment configuration
- **Monitoring**: Performance and error tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/brassey.io.git
   cd brassey.io
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 License

This project is proprietary and owned by Matt Brassey.

## 👨‍💻 Author

**Matt Brassey** - Engineering Manager specializing in blockchain infrastructure and Web3 technology.

- GitHub: [mbrassey](https://github.com/mbrassey)
- LinkedIn: [mbrassey](https://www.linkedin.com/in/mbrassey/)
- Email: [matt@brassey.io](mailto:matt@brassey.io)
