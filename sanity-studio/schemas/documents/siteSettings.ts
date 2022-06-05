/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export default {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  __experimental_actions: ["update", /* 'create', 'delete', */ "publish"],
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      description: "Website title",
    },
    {
      name: "description",
      type: "text",
      title: "Description",
      description:
        "Describe your portfolio for search engines and social media.",
    },
    {
      name: "keywords",
      type: "array",
      title: "Keywords",
      description: "Add keywords that describes your portfolio.",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
    {
      name: "author",
      type: "reference",
      description: "Publish an author and set a reference to them here.",
      title: "Author",
      to: [{ type: "author" }],
    },
    {
      title: "Open graph",
      name: "openGraph",
      description:
        "These will be the default meta tags on all pages that have not set their own",
      type: "openGraph",
    },
    {
      type: "color",
      name: "primaryColor",
      title: "Primary brand color",
      description:
        "Used to generate the primary accent color for websites, press materials, etc",
    },
    {
      type: "color",
      name: "secondaryColor",
      title: "Secondary brand color",
      description:
        "Used to generate the secondary accent color for websites, press materials, etc",
    },
  ],
};
