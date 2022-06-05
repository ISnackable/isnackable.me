/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { AiFillRocket } from "react-icons/ai";

export default {
  name: "hero",
  title: "Hero",
  icon: AiFillRocket,
  type: "object",
  fields: [
    {
      name: "heading",
      title: "Heading",
      type: "string",
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "text",
      description:
        "Give a short tag line to describe the the page. This will be displayed in the header of the page.",
    },
    {
      name: "heroImage",
      title: "Hero image",
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
