/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export default {
  widgets: [
    { name: "structure-menu" },
    {
      name: "project-info",
      options: {
        data: [
          {
            title: "GitHub repo",
            value: "https://github.com/ISnackable/isnackable.me/",
            category: "Code",
          },
          {
            title: "Frontend",
            value: "https://isnackable.me",
            category: "apps",
          },
        ],
      },
    },
    { name: "project-users", layout: { height: "auto" } },
    {
      name: "document-list",
      options: {
        title: "Recent blog posts",
        order: "_createdAt desc",
        types: ["post"],
      },
      layout: { width: "medium" },
    },
  ],
};
