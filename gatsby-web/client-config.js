module.exports = {
  sanity: {
    projectId:
      process.env.SANITY_STUDIO_API_PROJECT_ID || "<#< sanity.projectId >#>",
    dataset: process.env.SANITY_STUDIO_API_DATASET || "<#< sanity.dataset >#>",
  },
};
