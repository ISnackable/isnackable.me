/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";

const imageStyle = {
  width: "auto",
  height: "auto",
  maxWidth: "100%",
  maxHeight: "90vh",
};

const ExternalImagePreview = ({ value }) => {
  const { url } = value;
  if (!url) {
    return <p>Missing URL for Image link</p>;
  }

  return <img src={url} alt="" style={imageStyle} />;
};

export default ExternalImagePreview;
