import { toast } from "@repo/design-system/components/ui/toast";
import type { FilesMessages } from "@repo/internationalization/dictionaries";

export type CopyLinkMessages = Pick<
  FilesMessages,
  "copied" | "copyError" | "linksCopied" | "openOneLink"
>;

export async function copyFileLinks(
  href: string | readonly string[],
  messages: CopyLinkMessages
) {
  const links = typeof href === "string" ? [href] : href;
  try {
    await navigator.clipboard.writeText(
      links.map((link) => new URL(link, window.location.origin).href).join("\n")
    );
    toast.add({
      description: links.length > 1 ? messages.openOneLink : undefined,
      title: links.length > 1 ? messages.linksCopied : messages.copied,
      type: "success",
    });
  } catch {
    toast.add({ title: messages.copyError, type: "error" });
  }
}
