import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir ngrok en desarrollo
  allowedDevOrigins: ['culminate-friend-coming.ngrok-free.dev'],
  
  // Configurar Turbopack
  turbopack: {},
  
  // Configuración de webpack (opcional)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;