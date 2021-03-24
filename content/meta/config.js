const colors = require("../../src/styles/colors");

module.exports = {
  siteTitle: "ISnackable's Blog", // <title>
  shortSiteTitle: "ISnackable", // <title> ending for posts and pages
  siteDescription: "A blog site created with GatsbyJS.",
  siteUrl: "https://isnackable.github.io/",
  pathPrefix: "/isnackable.github.io",
  siteImage: "preview.jpg",
  siteLanguage: "en",
  // author
  authorName: "ISnackable",
  authorTwitterAccount: "",
  // info
  infoTitle: "ISnackable",
  infoTitleNote: "Personal blog",
  // manifest.json
  manifestName: "ISnackable's Blog",
  manifestShortName: "ISnackable", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.background,
  manifestThemeColor: colors.background,
  manifestDisplay: "standalone",
  // contact
  contactEmail: "REDACTED",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/ISnackable" },
    { name: "twitter", url: "https://twitter.com/#" },
    { name: "linkedin", url: "https://linkedin.com/in/#" }
  ]
};
