"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { languageLabels, locales } from "@repo/internationalization/locales";
import { usePathname, useRouter } from "@repo/internationalization/navigation";
import { Languages } from "lucide-react";
import { getLanguageSwitchPath } from "@/i18n/switch-path";

export const LanguageSwitcher = ({ label }: { label: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="shrink-0 text-foreground"
            size="icon"
            variant="ghost"
          >
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{label}</span>
          </Button>
        }
      />

      <DropdownMenuContent>
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              const alternates = Object.fromEntries(
                Array.from(
                  document.querySelectorAll<HTMLLinkElement>(
                    'link[rel="alternate"][hreflang]'
                  )
                ).map((link) => [link.hreflang, link.href])
              );
              router.replace(
                getLanguageSwitchPath(pathname, value, alternates),
                { locale: value }
              );
            }}
          >
            {languageLabels[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
