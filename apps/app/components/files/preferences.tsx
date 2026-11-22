"use client";

import { useTheme } from "@repo/design-system/client";
import type { FileSystemView } from "@repo/design-system/components/extend/file-system";
import { LanguageSwitcher } from "@repo/design-system/components/language-switcher";
import { Button } from "@repo/design-system/components/ui/button";
import { isLocale, type Locale } from "@repo/internationalization/locales";
import { MoonIcon, SunIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const viewKey = "files:view";
const viewEvent = "files:view-changed";
let fallbackView: FileSystemView | undefined;

function subscribeView(change: () => void) {
  window.addEventListener("storage", change);
  window.addEventListener(viewEvent, change);
  return () => {
    window.removeEventListener("storage", change);
    window.removeEventListener(viewEvent, change);
  };
}

function readView(): FileSystemView {
  if (fallbackView) {
    return fallbackView;
  }
  try {
    return window.localStorage.getItem(viewKey) === "icons" ? "icons" : "list";
  } catch {
    return "list";
  }
}

function writeView(view: FileSystemView) {
  try {
    window.localStorage.setItem(viewKey, view);
    fallbackView = undefined;
  } catch {
    fallbackView = view;
  }
  window.dispatchEvent(new Event(viewEvent));
}

export function useDirectoryView() {
  const view = useSyncExternalStore<FileSystemView>(
    subscribeView,
    readView,
    () => "list"
  );
  return [view, writeView] as const;
}

export function FilesLanguageSwitcher({
  label,
  locale,
}: {
  readonly label: string;
  readonly locale: Locale;
}) {
  const router = useRouter();

  return (
    <LanguageSwitcher
      currentLocale={locale}
      label={label}
      onLocaleChange={(target) => {
        const { pathname, search, hash } = window.location;
        const [, prefix, ...segments] = pathname.split("/");
        if (!isLocale(prefix) || target === prefix) {
          return;
        }
        const path = ["", target, ...segments].join("/");
        const href = `${path}${search}${hash}`;
        if (hash) {
          // Next can append a second fragment when revisiting a cached URL.
          window.location.assign(href);
        } else {
          router.push(href);
        }
      }}
    />
  );
}

export function ThemeToggle({ label }: { readonly label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon-sm"
      title={label}
      variant="ghost"
    >
      <MoonIcon aria-hidden className="dark:hidden" />
      <SunIcon aria-hidden className="hidden dark:block" />
    </Button>
  );
}
