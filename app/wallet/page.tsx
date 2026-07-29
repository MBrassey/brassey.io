import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  KeyRound,
  Layers,
  LifeBuoy,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react"
import { WalletDemo } from "@/components/wallet-demo"

export const metadata: Metadata = {
  title: "Solana DeFi Wallet | Matt Brassey",
  description:
    "A browser-native, self-custody Solana wallet — passkey-bound key management (WebAuthn PRF), BIP39 recovery, and a portable non-custodial vault. Live wireframe demo.",
}

const architecture = [
  {
    icon: KeyRound,
    title: "Passkey-bound key storage",
    body: "The ed25519 wallet seed is AES-GCM-encrypted under a wrapping key derived from a WebAuthn passkey's PRF extension and persisted in IndexedDB, so every signature requires a live hardware or biometric passkey gesture — only your passkey can spend. Keys are decrypted only inside a scoped withKeypair() boundary and zeroed from memory immediately after use.",
    tags: ["WebAuthn PRF", "AES-GCM", "IndexedDB"],
  },
  {
    icon: LifeBuoy,
    title: "BIP39 recovery",
    body: "24-word mnemonic backup as a direct 32-byte-entropy encoding of the wallet seed (seed ↔ mnemonic, then Keypair.fromSeed), plus an optional user recovery passphrase that encrypts a second in-browser backup — two independent recovery paths, neither of which exposes the key to any server.",
    tags: ["BIP39", "24 words", "ed25519"],
  },
  {
    icon: Server,
    title: "Portable vault, hard non-custodial invariant",
    body: "A passkey-encrypted server-side vault lets a user restore their wallet on a new device or browser. The invariant is enforced server-side: only PRF-mode-wrapped blobs are ever accepted for upload, so the platform stores only ciphertext it structurally cannot open — portability without custody.",
    tags: ["opaque ciphertext", "server-enforced"],
  },
  {
    icon: RefreshCw,
    title: "Rotation & step-up",
    body: "Authenticated key rotation with takeover protection — a stale or compromised session elsewhere can't survive a security change — and a step-up recovery and re-enrollment ceremony for the passphrase-vault path.",
    tags: ["takeover protection", "step-up auth"],
  },
  {
    icon: Layers,
    title: "Envelope-encryption discipline",
    body: "Per-item data-encryption keys wrapped by a master key (AES-GCM with HKDF-derived subkeys), versioned so the decrypt path is never removed under key rotation.",
    tags: ["DEK / KEK", "HKDF", "versioned"],
  },
  {
    icon: ShieldCheck,
    title: "Security-audited",
    body: "The full wallet surface has been through repeated fresh-eyes security audits — key exposure, fund loss, rotation-takeover, vault-overwrite — with findings triaged and closed. No path to key disclosure or unauthorized spend.",
    tags: ["audited", "fail-closed"],
  },
]

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#000102] text-slate-200 scan-lines">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#000102]/85 backdrop-blur">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto flex h-14 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#4B7F9B] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> brassey.io
          </Link>
          <span className="font-mono text-[11px] text-slate-600">// personal-project</span>
        </div>
      </header>

      <main className="container px-4 md:px-6 max-w-6xl mx-auto py-14 md:py-20 space-y-16 md:space-y-24">
        <section className="text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#4B7F9B]/20 bg-[#4B7F9B]/5 text-[#4B7F9B] text-xs">
            <Lock className="h-3 w-3" />
            <span>// solana-defi-wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Solana <span className="gradient-text">DeFi Wallet</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base sm:text-lg">
            A browser-native, self-custody wallet where the private key never leaves the user&apos;s device and the
            server can never spend or decrypt it — with recoverability and cross-device portability layered on
            without breaking that guarantee. Solo-designed and built, from the WebAuthn key ceremony to the swap
            surface below.
          </p>
        </section>

        <section aria-label="Live wallet demo" className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Live demo</h2>
            <span className="font-mono text-[11px] text-slate-500">
              wireframe preview · live market data
            </span>
          </div>
          <WalletDemo />
        </section>

        <section aria-label="Security architecture" className="space-y-6">
          <div className="text-left space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Security architecture</h2>
            <p className="text-slate-400 max-w-3xl text-sm sm:text-base">
              Non-custodial wallet engineering — self-custody key management on Solana with WebAuthn.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {architecture.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.title}
                  className="p-6 rounded-lg glass-pane holo-shimmer hover:border-[#4B7F9B]/30 transition-colors duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#4B7F9B]/10">
                      <Icon className="h-5 w-5 text-[#4B7F9B]" />
                    </div>
                    <h3 className="text-base font-bold">{a.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{a.body}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#4B7F9B]/20 text-[#4B7F9B]/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-6 rounded-lg border border-[#4B7F9B]/25 bg-[#4B7F9B]/[0.05]">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <span className="text-[#4B7F9B] font-semibold">The distinctive engineering:</span> reconciling three
              normally-conflicting requirements — true self-custody, real recoverability, and seamless cross-device
              use — by making the server a store of opaque, passkey-wrapped ciphertext rather than a custodian.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08]">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto py-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#4B7F9B] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
          </Link>
          <span className="font-mono text-[11px] text-slate-600">brassey.io/wallet</span>
        </div>
      </footer>
    </div>
  )
}
