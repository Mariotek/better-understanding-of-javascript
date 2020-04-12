module.exports = {
  globDirectory: "HTML/",
  globPatterns: ["**/*.{html,svg,png,json,js,css,xml,ico,woff,txt,jpg}"],
  swDest: "HTML/sw.js",
  skipWaiting: true,
  clientsClaim: true,
  navigateFallback: "/HTML/index.html",
  // cleanupOutdatedCaches: true,
  runtimeCaching: [
    // {
    //   urlPattern: "/",
    //   handler: "NetworkFirst",
    //   options: {
    //     networkTimeoutSeconds: 10,
    //     cacheName: "app-cache",
    //     expiration: {
    //       maxEntries: 5,
    //       maxAgeSeconds: 60,
    //     },
    //     // Configure background sync.
    //     backgroundSync: {
    //       name: "my-queue-name",
    //       options: {
    //         maxRetentionTime: 60 * 60,
    //       },
    //     },
    //   },
    // },
    {
      // Match any request that ends with .png, .jpg, .jpeg or .svg.
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

      // Apply a cache-first strategy.
      handler: "CacheFirst",

      options: {
        // Use a custom cache name.
        cacheName: "images",

        // Only cache 10 images.
        expiration: {
          maxEntries: 20,
        },
      },
    },
  ],
};
