"use client";

import type { CommonMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { useScroll } from "../hooks/use-scroll";
import { cn } from "../lib/utils";
import { DialogPopup } from "./dialog-popup";
import { ModeToggle } from "./mode-toggle";
import { SiteLogo } from "./site-logo";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";

interface HeaderDestination {
  href: string;
  navigation?: "client" | "document";
  current?: boolean;
}

interface HeaderNavigationItem extends HeaderDestination {
  title: string;
}

function HeaderLink({
  children,
  className,
  destination,
  onNavigate,
}: {
  children: ReactNode;
  className: string;
  destination: HeaderDestination;
  onNavigate?: () => void;
}) {
  const { current, href, navigation } = destination;
  const props = {
    "aria-current": current ? ("location" as const) : undefined,
    className,
    href,
  };

  return navigation === "document" ? (
    <a {...props} onClick={onNavigate}>
      {children}
    </a>
  ) : (
    <Link {...props} onNavigate={onNavigate} prefetch={!current}>
      {children}
    </Link>
  );
}

function MobileNav({
  closeLabel,
  items,
  navigationLabel,
  onOpenChange,
  open,
  toggleLabel,
}: {
  closeLabel: string;
  items: readonly HeaderNavigationItem[];
  navigationLabel: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  toggleLabel: string;
}) {
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        onOpenChange(false);
      }
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={toggleLabel}
            className="md:hidden"
            size="icon"
            variant="ghost"
          />
        }
      >
        {open ? null : <MenuIcon />}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-40 bg-background/95 supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-sm motion-reduce:animate-none" />
        <DialogPopup className="pointer-events-none fixed inset-0 z-50 outline-none">
          <DialogTitle className="sr-only">{navigationLabel}</DialogTitle>
          <DialogClose
            render={
              <Button
                aria-label={closeLabel}
                className="pointer-events-auto absolute top-2.5 right-4"
                size="icon"
                variant="ghost"
              />
            }
          >
            <XIcon />
          </DialogClose>
          <nav
            aria-label={navigationLabel}
            className="pointer-events-auto absolute inset-x-0 top-14 bottom-0 overflow-y-auto p-4"
          >
            <div className="grid gap-y-2">
              {items.map((item) => (
                <HeaderLink
                  className={buttonVariants({
                    className: "justify-start",
                    variant: "ghost",
                  })}
                  destination={item}
                  key={item.href}
                  onNavigate={() => onOpenChange(false)}
                >
                  {item.title}
                </HeaderLink>
              ))}
            </div>
          </nav>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}

export function SiteHeader({
  filesLink,
  languageSwitcher,
  locale,
  messages,
  portfolioHome,
  siteName,
}: {
  filesLink: HeaderDestination;
  languageSwitcher: ReactNode;
  locale: Locale;
  messages: CommonMessages;
  portfolioHome?: HeaderDestination;
  siteName: ReactNode;
}) {
  const scrolled = useScroll(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { header, navigation } = messages;
  const home = portfolioHome ?? { href: `/${locale}` };
  const items = [
    { ...home, title: navigation.home },
    { ...home, href: `${home.href}/blog`, title: navigation.blog },
    { ...home, href: `${home.href}/projects`, title: navigation.projects },
    { ...filesLink, title: navigation.files },
  ];

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled && !mobileMenuOpen,
      })}
    >
      <nav
        aria-label={navigation.label}
        className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-6"
      >
        <HeaderLink
          className="flex min-w-0 select-none items-center gap-2 rounded-md py-2"
          destination={home}
        >
          <SiteLogo className="size-5 shrink-0" />
          <span className="truncate font-semibold text-foreground tracking-tight">
            {siteName}
          </span>
        </HeaderLink>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex gap-4">
              {items.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <HeaderLink
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                    destination={item}
                  >
                    {item.title}
                  </HeaderLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          {languageSwitcher}
          <ModeToggle label={header.toggleTheme} />
          <MobileNav
            closeLabel={header.closeMenu}
            items={items}
            navigationLabel={navigation.label}
            onOpenChange={setMobileMenuOpen}
            open={mobileMenuOpen}
            toggleLabel={header.toggleMenu}
          />
        </div>
      </nav>
    </header>
  );
}
