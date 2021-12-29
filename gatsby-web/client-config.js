module.exports = {
  sanity: {
    projectId:
      process.env.GATSBY_SANITY_STUDIO_API_PROJECT_ID ||
      "<#< sanity.projectId >#>",
    dataset:
      process.env.GATSBY_SANITY_STUDIO_API_DATASET || "<#< sanity.dataset >#>",
  },
};
