"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  type Locale,
  languageLabels,
  locales,
} from "@repo/internationalization/locales";
import { Languages } from "lucide-react";

export function LanguageSwitcher({
  currentLocale,
  label,
  onLocaleChange,
}: {
  readonly currentLocale: Locale;
  readonly label: string;
  readonly onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label={label} size="icon" title={label} variant="ghost">
            <Languages aria-hidden data-icon="inline-start" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {locales.map((locale) => (
            <DropdownMenuItem
              aria-current={locale === currentLocale ? "page" : undefined}
              key={locale}
              onClick={() => onLocaleChange(locale)}
            >
              {languageLabels[locale]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
