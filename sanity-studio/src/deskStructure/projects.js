import S from "@sanity/desk-tool/structure-builder";

export default S.listItem()
  .title("Project")
  .schemaType("project")
  .child(S.documentTypeList("project").title("Project"));
