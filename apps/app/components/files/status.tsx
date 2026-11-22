import { buttonVariants } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@repo/design-system/components/ui/empty";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { CloudOffIcon, FolderOpenIcon } from "lucide-react";
import Link from "next/link";

export function FilesLoading({ label }: { readonly label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-5"
      role="status"
    >
      <div className="flex h-8 justify-end gap-2">
        <Skeleton className="h-8 w-32 motion-reduce:animate-none" />
        <Skeleton className="h-8 w-24 motion-reduce:animate-none" />
      </div>
      <div
        className="grid min-h-56 content-start gap-3 rounded-xl border bg-card p-4 sm:p-6"
        data-slot="files-loading-panel"
      >
        <Skeleton className="h-5 w-40 max-w-full motion-reduce:animate-none" />
        <Skeleton className="h-4 w-full motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
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
