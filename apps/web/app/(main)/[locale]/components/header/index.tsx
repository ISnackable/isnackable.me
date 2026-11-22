"use client";

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@repo/design-system/components/ui/navigation-menu";
import { useScroll } from "@repo/design-system/hooks/use-scroll";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary, Locale } from "@repo/internationalization";
import { Link } from "@repo/internationalization/navigation";
import { Suspense, useState } from "react";
import { Logo } from "../logo";
import { SiteLanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  dictionary: Dictionary;
  locale: Locale;
  siteName: string;
}

export function Header({ dictionary, locale, siteName }: HeaderProps) {
  const scrolled = useScroll(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      title: dictionary.web.header.home,
      href: "/",
    },
    {
      title: dictionary.web.header.blog,
      href: "/blog",
    },
    {
      title: dictionary.web.header.projects,
      href: "/projects",
    },
  ];

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled && !mobileMenuOpen,
      })}
    >
      <nav
        aria-label={dictionary.web.header.navigation}
        className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 md:px-6"
      >
        <Link
          className="flex max-w-full select-none flex-row items-center gap-2 rounded-md p-2 px-0"
          href="/"
        >
          <Logo className="size-5 shrink-0" />
          <span className="truncate font-semibold text-foreground tracking-tight">
            {siteName}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-4">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <Link
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      href={item.href}
                      prefetch={true}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <Suspense
            fallback={<div aria-hidden="true" className="size-9 shrink-0" />}
          >
            <SiteLanguageSwitcher
              label={dictionary.common.switchLanguage}
              locale={locale}
            />
          </Suspense>
          <ModeToggle label={dictionary.web.header.toggleTheme} />
          <MobileNav
            closeLabel={dictionary.web.header.closeMenu}
            navigationItems={navigationItems}
            navigationLabel={dictionary.web.header.navigation}
            onOpenChange={setMobileMenuOpen}
            open={mobileMenuOpen}
            toggleLabel={dictionary.web.header.toggleMenu}
          />
        </div>
      </nav>
    </header>
  );
}
