import S from "@sanity/desk-tool/structure-builder";

import author from "./authors";
import blog from "./blog";
import categories from "./categories";
import projects from "./projects";

// Hide document types that we already have a structure definition for
const hiddenDocTypes = (listItem) =>
  !["author", "post", "category", "project"].includes(listItem.getId());

export default () =>
  S.list()
    .title("Content")
    .items([
      author,
      blog,
      categories,
      projects,
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ]);
