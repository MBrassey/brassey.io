import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000102] text-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[#1F1D20] bg-[#1F1D20]/60 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#1F1D20] bg-[#0a0b0d]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          <span className="ml-2 font-mono text-[10px] text-slate-500">matt@brassey.io:~</span>
        </div>
        <div className="p-6 font-mono text-sm space-y-3">
          <div className="text-slate-500">
            <span className="text-emerald-400">$</span> curl -I brassey.io/…
          </div>
          <div className="text-red-400/90">HTTP/2 404 — route not found</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The path you requested doesn&apos;t exist on this host. Every other route on this box is monitored — this
            one just isn&apos;t wired up.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded border border-[#4B7F9B]/30 px-3 py-1.5 font-mono text-xs text-[#4B7F9B] transition-colors hover:bg-[#4B7F9B] hover:text-black"
            >
              cd ~/
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
