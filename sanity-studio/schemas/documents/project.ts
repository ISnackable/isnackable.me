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
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Titles should be catchy, descriptive, and not too long",
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
      name: "mainImage",
      title: "Main Image",
      type: "mainImage",
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
    },
  },
};
