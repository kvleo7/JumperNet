import type { NextConfig } from "next";

// Indirizzo del backend Express visto dal server Next.js
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  // Permette di aprire il sito in dev da altri PC (rete locale o tunnel)
  allowedDevOrigins: [
    "192.168.*.*",
    "172.20.10.*",
    "10.*.*.*",
    "*.devtunnels.ms",
    "*.ngrok-free.app",
    "*.trycloudflare.com",
  ],

  // Con NEXT_PUBLIC_API_URL vuota il browser chiama /api/... sullo stesso
  // indirizzo del sito e Next.js inoltra la richiesta al backend:
  // così basta condividere un solo link (porta 3000).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
