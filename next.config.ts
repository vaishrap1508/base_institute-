import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  latex: true,
});

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  allowedDevOrigins: ['192.168.1.28'],
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './src/mdx-components.tsx',
    },
  },
  devIndicators: false,
};

export default withNextra(nextConfig);
