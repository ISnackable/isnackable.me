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
