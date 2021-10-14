module.exports = {
  siteMetadata: {
    siteUrl: "https://www.yourdomain.tld",
    title: "ISnackable's Blog",
    description: 'This is my awesome blog I made from scratch!',
    // algolia: {
    //   appId: process.env.ALGOLIA_APP_ID ? process.env.ALGOLIA_APP_ID : "",
    //   searchOnlyApiKey: process.env.ALGOLIA_SEARCH_ONLY_API_KEY
    //     ? process.env.ALGOLIA_SEARCH_ONLY_API_KEY
    //     : "",
    //   indexName: process.env.ALGOLIA_INDEX_NAME ? process.env.ALGOLIA_INDEX_NAME : ""
    // },
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    "gatsby-transformer-remark",
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
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
  ],
};
