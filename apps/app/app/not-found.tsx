import { NotFound } from "@repo/design-system/components/ui/not-found";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function AppNotFound() {
  return <NotFound className="min-h-svh" />;
}
