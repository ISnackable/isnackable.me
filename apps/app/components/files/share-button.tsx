"use client";

import { Button } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import { CheckIcon, CircleAlertIcon, LinkIcon } from "lucide-react";
import { useState } from "react";

export function ShareButton({
  compact = false,
  href,
  label,
  messages,
}: {
  readonly compact?: boolean;
  readonly href: string | readonly string[];
  readonly label?: string;
  readonly messages: Pick<
    FilesMessages,
    "copied" | "copy" | "copyError" | "linksCopied"
  >;
}) {
  const [status, setStatus] = useState("");
  async function copyLink() {
    try {
      const links = typeof href === "string" ? [href] : href;
      await navigator.clipboard.writeText(
        links
          .map((link) => new URL(link, window.location.origin).href)
          .join("\n")
      );
      setStatus(links.length > 1 ? messages.linksCopied : messages.copied);
    } catch {
      setStatus(messages.copyError);
    }
  }
  const name = label ?? messages.copy;
  let Icon = LinkIcon;
  if (compact && status) {
    Icon = status === messages.copyError ? CircleAlertIcon : CheckIcon;
  }
  return (
    <>
      <Button
        aria-label={compact ? name : undefined}
        onClick={copyLink}
        size={compact ? "icon-sm" : "sm"}
        title={compact ? status || name : undefined}
        variant={compact ? "ghost" : "outline"}
      >
        <Icon aria-hidden data-icon={compact ? undefined : "inline-start"} />
        {!compact && name}
      </Button>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
      {!compact && status && (
        <span aria-hidden className="text-muted-foreground text-xs">
          {status}
        </span>
      )}
    </>
  );
}
