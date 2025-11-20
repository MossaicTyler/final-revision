import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reknur - Curated Excellence in Luxury Goods",
    short_name: "Reknur",
    description:
      "Discover exceptional, handcrafted plushies items curated for those who appreciate quality and craftsmanship.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181B",
    icons: [
      {
        src: "/icon-192.jpg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
