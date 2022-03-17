import "ace-builds/src-noconflict/mode-assembly_x86";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-diff";
import "ace-builds/src-noconflict/mode-dockerfile";
import "ace-builds/src-noconflict/mode-graphqlschema";
import "ace-builds/src-noconflict/mode-lua";
import "ace-builds/src-noconflict/mode-nginx";
import "ace-builds/src-noconflict/mode-powershell";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-swift";

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */
export default {
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    {
      title: "Block",
      type: "block",
      // Styles let you set what your user can mark up blocks with. These
      // correspond with HTML tags, but you can set any title or value
      // you want and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting by editors.
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Inline Code", value: "code" },
          { title: "Underline", value: "underline" },
          { title: "Strike", value: "strike-through" },
          // { title: 'Highlight', value: 'highlight' }
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            name: "link",
            type: "object",
            title: "External link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
              },
              {
                title: "Open in new tab",
                name: "blank",
                type: "boolean",
              },
            ],
          },
          {
            name: "internalLink",
            type: "object",
            title: "Internal link",
            fields: [
              {
                name: "reference",
                type: "reference",
                title: "Reference",
                to: [
                  { type: "post" },
                  // other types you may want to link to
                ],
              },
            ],
          },
        ],
      },
    },
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    { type: "break" },
    {
      type: "figure",
    },
    {
      title: "Code Block",
      name: "code",
      type: "code",
      options: {
        lanugage: "javascript",
        languageAlternatives: [
          { title: "Nasm", value: "nasm", mode: "assembly_x86" },
          { title: "Batch file", value: "batchfile" },
          { title: "Bash", value: "bash", mode: "sh" },
          { title: "C", value: "c", mode: "c_cpp" },
          { title: "C++", value: "cpp", mode: "c_cpp" },
          { title: "C#", value: "csharp" },
          { title: "CSS", value: "css" },
          { title: "Diff", value: "diff", mode: "diff" }, // use custom renderer on frontend
          { title: "Docker", value: "docker", mode: "dockerfile" },
          { title: "Go", value: "golang" },
          { title: "GraphQL", value: "graphql", mode: "graphqlschema" },
          { title: "GROQ", value: "groq" },
          { title: "HTTP", value: "http" },
          { title: "HTML", value: "html" },
          { title: "Java", value: "java" },
          { title: "JavaScript", value: "javascript" },
          { title: "JSON", value: "json" },
          { title: "JSX", value: "jsx" },
          { title: "Lua", value: "lua", mode: "lua" },
          { title: "Markdown", value: "markdown" },
          { title: "MySQL", value: "mysql" },
          { title: "Nginx", value: "nginx", mode: "nginx" },
          { title: "PHP", value: "php" },
          { title: "Plain text", value: "text" },
          { title: "Powershell", value: "powershell", mode: "powershell" },
          { title: "Python", value: "python" },
          { title: "Regex", value: "regex", mode: "text" },
          { title: "Ruby", value: "ruby" },
          { title: "Rust", value: "rust", mode: "rust" },
          { title: "SASS", value: "sass" },
          { title: "SCSS", value: "scss" },
          { title: "sh", value: "sh" },
          { title: "Swift", value: "swift", mode: "swift" },
          { title: "TSX", value: "tsx" },
          { title: "TypeScript", value: "typescript" },
          { title: "XML", value: "xml" },
          { title: "YAML", value: "yaml" },
        ],
        theme: "tomorrow",
        withFilename: true,
      },
    },
    { type: "externalImage" },
  ],
};
