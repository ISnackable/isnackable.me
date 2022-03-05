import type { NextPage } from "next";
import type { AllSanityPost, Body } from "../../@types/sanity";
import { useEffect, useState } from "react";
import throttle from "lodash/throttle";
import { Text } from "@mantine/core";
import styles from "./tableofcontent.module.css";

interface Props {
  post: AllSanityPost;
}

interface Headings {
  _key: string;
  title: string;
  items: [NestedHeadings?];
}

interface NestedHeadings {
  _key: string;
  title: string;
}

const throttleMs = 100;

const getNestedHeadings = (headings: Body[]) => {
  const nestedHeadings: Headings[] = [];

  headings.forEach((block) => {
    const { _key, children, style } = block;
    const title = children !== undefined ? children[0].text : "";

    if (style === "h2") {
      nestedHeadings.push({ _key, title, items: [] });
    } else if (style === "h3" && nestedHeadings.length > 0) {
      nestedHeadings[nestedHeadings.length - 1].items.push({
        _key,
        title
      });
    }
  });

  return nestedHeadings;
};

const TableOfContent: NextPage<Props> = (props) => {
  const { post } = props;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const nestedHeadings = getNestedHeadings(post.body);

  const actionSectionScrollSpy = throttle(() => {
    const sections = document.getElementsByClassName("blog-h");

    let prevBBox: DOMRect | null = null;
    let currentSectionId = activeSection;

    for (let i = 0; i < sections.length; ++i) {
      const section = sections[i];
      if (!section || !(section instanceof Element)) continue;

      if (!currentSectionId) {
        currentSectionId = section.getAttribute("data-id");
      }

      const bbox = section.getBoundingClientRect();
      const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0;
      const offset = Math.max(150, prevHeight / 4);

      // GetBoundingClientRect returns values relative to viewport
      if (bbox.top - offset < 0) {
        currentSectionId = section.getAttribute("data-id");

        prevBBox = bbox;
        continue;
      }

      // No need to continue loop, if last element has been detected
      break;
    }

    setActiveSection(currentSectionId);
  }, throttleMs);

  useEffect(() => {
    window.addEventListener("scroll", actionSectionScrollSpy);

    actionSectionScrollSpy();

    return () => {
      window.removeEventListener("scroll", actionSectionScrollSpy);
    };
  }, [actionSectionScrollSpy]);

  return (
    <aside className={styles.toc}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 1.5C0 1.22386 0.223858 1 0.5 1H2.5C2.77614 1 3 1.22386 3 1.5C3 1.77614 2.77614 2 2.5 2H0.5C0.223858 2 0 1.77614 0 1.5ZM4 1.5C4 1.22386 4.22386 1 4.5 1H14.5C14.7761 1 15 1.22386 15 1.5C15 1.77614 14.7761 2 14.5 2H4.5C4.22386 2 4 1.77614 4 1.5ZM4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5C12 4.77614 11.7761 5 11.5 5H4.5C4.22386 5 4 4.77614 4 4.5ZM0 7.5C0 7.22386 0.223858 7 0.5 7H2.5C2.77614 7 3 7.22386 3 7.5C3 7.77614 2.77614 8 2.5 8H0.5C0.223858 8 0 7.77614 0 7.5ZM4 7.5C4 7.22386 4.22386 7 4.5 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H4.5C4.22386 8 4 7.77614 4 7.5ZM4 10.5C4 10.2239 4.22386 10 4.5 10H11.5C11.7761 10 12 10.2239 12 10.5C12 10.7761 11.7761 11 11.5 11H4.5C4.22386 11 4 10.7761 4 10.5ZM0 13.5C0 13.2239 0.223858 13 0.5 13H2.5C2.77614 13 3 13.2239 3 13.5C3 13.7761 2.77614 14 2.5 14H0.5C0.223858 14 0 13.7761 0 13.5ZM4 13.5C4 13.2239 4.22386 13 4.5 13H14.5C14.7761 13 15 13.2239 15 13.5C15 13.7761 14.7761 14 14.5 14H4.5C4.22386 14 4 13.7761 4 13.5Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        ></path>
      </svg>
      <Text component="span" size="md" ml={10}>
        Table of contents
      </Text>

      <nav aria-label="Table of contents">
        <ul>
          {nestedHeadings.map((heading) => (
            <li key={`h-${heading._key}`}>
              <a
                aria-current={
                  activeSection === `h-${heading._key}` ? "true" : undefined
                }
                href={`#h-${heading._key}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#h-${heading._key}`)!.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              >
                {heading.title}
              </a>
              {heading.items.length > 0 && (
                <ul>
                  {heading.items.map((child) => (
                    <li key={`h-${child!._key}`}>
                      <a
                        aria-current={
                          activeSection === `h-${child!._key}`
                            ? "true"
                            : undefined
                        }
                        href={`#h-${child!._key}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .querySelector(`#h-${child!._key}`)!
                            .scrollIntoView({
                              behavior: "smooth"
                            });
                        }}
                      >
                        {child!.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default TableOfContent;
