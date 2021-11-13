const { parseISO, isFuture } = require("date-fns");

async function createNotePostPages(
  pathPrefix = "/note",
  graphql,
  actions,
  reporter
) {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allSanityNote(filter: { slug: { current: { ne: "null" } } }) {
        edges {
          node {
            id
            publishedAt
            slug {
              current
            }
            description
          }
        }
      }
    }
  `);

  if (result.errors) throw result.errors;

  const noteEdges = (result.data.allSanityNote || {}).edges || [];
  noteEdges
    .filter((edge) => !isFuture(parseISO(edge.node.publishedAt))) // should validate publishedAt before parsing
    .forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating note post page: ${path}`);
      createPage({
        path,
        component: require.resolve("./src/templates/note-post.tsx"),
        context: { id },
      });
    });
}

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
            description
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
        component: require.resolve("./src/templates/blog-post.tsx"),
        context: { id },
      });
    });
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  await createNotePostPages("/note", graphql, actions, reporter);
  await createBlogPostPages("/blog", graphql, actions, reporter);
};
