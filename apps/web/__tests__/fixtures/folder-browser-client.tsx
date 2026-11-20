import { ThemeProvider } from "@repo/design-system/providers/theme";
import { createRoot } from "react-dom/client";
import { Folder } from "../../app/(main)/[locale]/(home)/components/folder";

const container = document.querySelector("#folder-fixture");
if (container) {
  createRoot(container).render(
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <div className="flex w-full justify-end px-8 pt-[170px] pb-[360px] xl:justify-center">
        <div className="h-[90px] w-[90px] xl:h-[180px] xl:w-[200px]">
          <Folder label="Selected work">
            {[
              ["Project", "A selected project", "/en/projects/one"],
              ["Article", "Building a thoughtful interface", "/en/blog/two"],
              [
                "Project",
                "A very long unbreakable title: abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
                "/en/projects/three",
              ],
            ].map(([type, title, href]) => (
              <a className="hero-folder-card" href={href} key={href}>
                <span className="hero-folder-card-meta">{type}</span>
                <span className="hero-folder-card-title">{title}</span>
                <span className="hero-folder-card-summary">
                  An existing content summary, rendered as real text.
                </span>
              </a>
            ))}
          </Folder>
        </div>
      </div>
    </ThemeProvider>
  );
}
