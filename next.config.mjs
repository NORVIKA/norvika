/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "norvika.ca" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "lepimentszechuan.com" },
      { protocol: "https", hostname: "www.vergerfrancoislegault.ca" },
    ],
  },
};

export default nextConfig;
