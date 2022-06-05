/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";

import DefaultSource from "part:@sanity/form-builder/input/image/asset-source-default";
import { MediaEditor } from "sanity-plugin-asset-source-ogimage";
import ogImageLayout from "../../src/components/ogImageLayout";

export default {
  title: "Open Graph",
  name: "openGraph",
  type: "object",
  fields: [
    {
      title: "SEO title",
      name: "seoTitle",
      type: "string",
      description: "Heads up! This will override the page title.",
      validation: (Rule) =>
        Rule.max(60).warning("Should be under 60 characters"),
    },
    {
      title: "SEO description",
      name: "seoDescription",
      type: "text",
      validation: (Rule) =>
        Rule.max(155).warning("Should be under 155 characters"),
    },
    {
      title: "SEO image",
      description: "Facebook recommends 1200x630 (will be auto resized)",
      name: "seoImage",
      type: "image",
      options: {
        sources: [
          DefaultSource,
          {
            name: "sharing-image",
            title: "Generate sharing image",
            component: (props) => (
              <MediaEditor
                // It's vital to forward props to MediaEditor
                {...props}
                // Our custom layouts
                layouts={[ogImageLayout]}
                // See dialog section below
                dialog={{
                  title: "Create sharing image",
                }}
              />
            ),
            icon: () => <div>🎨</div>,
          },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: "seoTitle",
    },
    prepare({ title }) {
      return {
        title,
      };
    },
  },
};
