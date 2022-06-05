/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";
import { MediaEditor } from "sanity-plugin-asset-source-ogimage";
import ogImageLayout from "../components/ogImageLayout";

export default {
  name: "sharing-image",
  title: "Generate image",
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
};
