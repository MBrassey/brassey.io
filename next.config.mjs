let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Godot web exports are hosted from /public/godot and framed same-origin.
  // The exported engine uses JavaScriptBridge.eval (real eval) to talk to its
  // host, so that path needs its own permissive CSP; everything else keeps the
  // strict one. Scoped to /godot only.
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      // SAMEORIGIN, not DENY, so this site can frame its own /godot bundles.
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]
    const godotCsp = [
      "default-src 'self'",
      "connect-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'self'",
    ].join("; ")
    return [
      {
        source: "/godot/:path*",
        headers: [
          ...base,
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Security-Policy", value: godotCsp },
        ],
      },
      { source: "/((?!godot/).*)", headers: base },
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
