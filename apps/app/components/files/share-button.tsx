"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { LinkIcon } from "lucide-react";
import { type CopyLinkMessages, copyFileLinks } from "@/lib/files/copy-links";

export function ShareButton({
  compact = false,
  href,
  label,
  messages,
}: {
  readonly compact?: boolean;
  readonly href: string;
  readonly label: string;
  readonly messages: CopyLinkMessages;
}) {
  return (
    <Button
      aria-label={compact ? label : undefined}
      onClick={() => copyFileLinks(href, messages)}
      size={compact ? "icon-sm" : "sm"}
      title={compact ? label : undefined}
      type="button"
      variant={compact ? "ghost" : "outline"}
    >
      <LinkIcon aria-hidden data-icon={compact ? undefined : "inline-start"} />
      {!compact && label}
    </Button>
  );
}
