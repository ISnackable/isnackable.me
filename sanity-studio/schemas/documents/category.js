import { BiCategoryAlt } from "react-icons/bi";

export default {
  name: "category",
  title: "Category",
  type: "document",
  icon: BiCategoryAlt,
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
    },
  ],
};
