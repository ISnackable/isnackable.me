// Load variables from `.env` as soon as possible
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const clientConfig = require("./client-config");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  siteMetadata: {
    title: "ISnackable, Cybersecurity",
    titleTemplate: "%s — ISnackable, Cybersecurity",
    description: "A personal site",
    siteUrl: "https://www.isnackable.me",
    image: "icons/icon-512x512.png", // Path to your image you placed in the 'static' folder
    twitterUsername: "@ISnackable",
  },
  plugins: [
    {
      resolve: "gatsby-source-sanity",
      options: {
        ...clientConfig.sanity,
        token: process.env.SANITY_READ_TOKEN,
        watchMode: !isProd,
        overlayDrafts: !isProd && process.env.SANITY_READ_TOKEN,
      },
    },
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    //
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "ISnackable Personal Site",
        short_name: "ISnackable",
        start_url: "/",
        background_color: "#141414",
        theme_color: "#ffffff",
        display: "standalone",
        lang: "en",
        icon: `src/images/icon.png`,
        icons: [
          {
            src: "icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        icon_options: {
          purpose: `any maskable`,
        },
      },
    },
    "gatsby-plugin-offline",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
  ],
};
