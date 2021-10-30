const { parseISO, isFuture } = require("date-fns");

// async function createProjectPages(
//   pathPrefix = "/",
//   graphql,
//   actions,
//   reporter
// ) {
//   const { createPage } = actions;
//   const result = await graphql(`
//     {
//       allSanityProject(
//         filter: { slug: { current: { ne: null } }, page: { id: { ne: null } } }
//       ) {
//         edges {
//           node {
//             id
//             slug {
//               current
//             }
//           }
//         }
//       }
//     }
//   `);

//   if (result.errors) throw result.errors;

//   const projectEdges = (result.data.allSanityProject || {}).edges || [];
//   projectEdges.forEach((edge) => {
//     const { id, slug = {} } = edge.node;
//     const path = [pathPrefix, slug.current, "/"].join("");
//     reporter.info(`Creating project page: ${path}`);
//     createPage({
//       path,
//       component: require.resolve("./src/templates/project.js"),
//       context: { id },
//     });
//   });
// }

async function createBlogPostPages(
  pathPrefix = "/blog",
  graphql,
  actions,
  reporter
) {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allSanityPost(filter: { slug: { current: { ne: "null" } } }) {
        edges {
          node {
            id
            publishedAt
            slug {
              current
            }
          }
        }
      }
    }
  `);

  if (result.errors) throw result.errors;

  const postEdges = (result.data.allSanityPost || {}).edges || [];
  postEdges
    .filter((edge) => !isFuture(parseISO(edge.node.publishedAt))) // should validate publishedAt before parsing
    .forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating blog post page: ${path}`);
      createPage({
        path,
        component: require.resolve("./src/templates/blog-post.js"),
        context: { id },
      });
    });
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  // await createProjectPages("/projects", graphql, actions, reporter);
  await createBlogPostPages("/blog", graphql, actions, reporter);
};
