import S from "@sanity/desk-tool/structure-builder";

export default S.listItem()
  .title("Author")
  .schemaType("author")
  .child(S.documentTypeList("author").title("Author"));
