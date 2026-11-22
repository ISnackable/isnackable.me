import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@repo/design-system/components/ui/empty";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import { CloudOffIcon, FolderOpenIcon } from "lucide-react";
import Link from "next/link";

export type PreviewMessages = Pick<
  FilesMessages,
  "downloadInstead" | "unsupported"
>;

export function PreviewUnavailable({
  messages,
}: {
  readonly messages: PreviewMessages;
}) {
  return (
    <Alert>
      <AlertTitle>{messages.unsupported}</AlertTitle>
      <AlertDescription>{messages.downloadInstead}</AlertDescription>
    </Alert>
  );
}

export function FilesLoading({ label }: { readonly label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-4"
      role="status"
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 rounded-xl border p-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>
    </div>
  );
}

export function FilesStatus({
  description,
  home,
  title,
  unavailable = false,
}: {
  readonly description?: string;
  readonly home?: { readonly href: string; readonly label: string };
  readonly title: string;
  readonly unavailable?: boolean;
}) {
  return (
    <Empty className="min-h-56 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {unavailable ? (
            <CloudOffIcon aria-hidden />
          ) : (
            <FolderOpenIcon aria-hidden />
          )}
        </EmptyMedia>
        <h1 className="font-semibold text-lg">{title}</h1>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {home && (
        <EmptyContent>
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href={home.href}
          >
            {home.label}
          </Link>
        </EmptyContent>
      )}
    </Empty>
  );
}
