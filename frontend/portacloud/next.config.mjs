import nextPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  runtimeCaching,
  fallbacks: {
    document: "/offline.html", 
  },
});

export default {
  ...withPWA,
  reactStrictMode: true,
};