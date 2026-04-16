// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     typedRoutes: true
//   }
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild',
      'node_modules/sharp',
    ],
  },
};

export default nextConfig;