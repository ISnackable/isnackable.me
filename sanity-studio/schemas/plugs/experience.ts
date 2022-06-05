/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { GrUserWorker } from "react-icons/gr";

export default {
  name: "experience",
  title: "Experience",
  icon: GrUserWorker,
  type: "object",
  fields: [
    {
      name: "content",
      type: "array",
      of: [
        {
          name: "experience",
          title: "Experience",
          icon: GrUserWorker,
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              description: "Give a short description of your experience.",
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
                title: `Experience: ${disabled ? "DISABLED" : title}`,
              };
            },
          },
        },
      ],
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
        title: `Experience: ${disabled ? "DISABLED" : title}`,
      };
    },
  },
};
