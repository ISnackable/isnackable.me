"use client";

import { parseError } from "@repo/observability/error";
import { toast } from "../components/ui/toast";

export const handleError = (error: unknown): void => {
  toast.add({ title: parseError(error), type: "error" });
};
