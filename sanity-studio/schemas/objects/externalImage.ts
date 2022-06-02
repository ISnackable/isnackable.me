/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import ExternalImagePreview from "../previews/externalImage";

export default {
  name: "externalImage",
  title: "External Image",
  type: "object",
  fields: [
    {
      name: "url",
      type: "url",
      description: "Visit an raw image link in a browser and copy the URL.",
    },
    {
      title: "Alt Text",
      name: "alt",
      type: "string",
    },
    {
      title: "Caption",
      name: "caption",
      type: "string",
    },
  ],
  preview: {
    select: { url: "url" },
    component: ExternalImagePreview,
  },
};
