import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  dest: "public",
  fallbacks: {
    image: "/logo.png",
    document: "/offline", 
  },
  workboxOptions: {
    disableDevLogs: true,
  },

});

export default {
  ...withPWA,
  reactStrictMode: true,
};