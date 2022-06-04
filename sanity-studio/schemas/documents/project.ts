/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export default {
  name: "project",
  title: "Project",
  type: "document",
  initialValue: () => ({
    author: {
      // You may want to change this to your user ID
      _ref: "4a55f40a-2011-4ee8-8bab-45bac88f88df",
      _type: "reference",
    },
  }),
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Titles should be catchy, descriptive, and not too long",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Some frontends will require a slug to be set to be able to show the project",
      options: {
        source: "title",
        maxLength: 96,
      },
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      description:
        "Description should be descriptive on what the project is about",
    },
    {
      title: "Project URL",
      name: "projectUrl",
      type: "url",
      description: "The link to the project",
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: { type: "author" },
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "mainImage",
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      });
    },
  },
};
