/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export default {
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    {
      name: "label",
      type: "string",
    },
    {
      name: "heading",
      type: "string",
      title: "Heading",
    },
    {
      name: "tagline",
      type: "text",
    },
    {
      name: "mainImage",
      type: "mainImage",
    },
  ],
  preview: {
    select: {
      title: "heading",
      subtitle: "label",
      disabled: "disabled",
    },
    prepare({ title, disabled }) {
      return {
        title: `Hero: ${disabled ? "DISABLED" : title}`,
      };
    },
  },
};
