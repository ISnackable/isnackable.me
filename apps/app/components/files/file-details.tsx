import { formatFileSize } from "@repo/design-system/components/extend/file-format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import {
  CalendarDaysIcon,
  FileTypeIcon,
  HardDriveIcon,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { type ReactNode, useMemo } from "react";
import type { FileDetails } from "@/lib/files/types";

function FileProperty({
  children,
  icon: Icon,
  label,
}: {
  readonly children: ReactNode;
  readonly icon: LucideIcon;
  readonly label: string;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon aria-hidden className="size-4 shrink-0" />
        {label}
      </dt>
      <dd className="wrap-anywhere">{children}</dd>
    </div>
  );
}

export function FileDetailsFallback({
  file,
  locale,
  messages,
}: {
  readonly file: FileDetails;
  readonly locale: Locale;
  readonly messages: FilesMessages;
}) {
  const { hashes, mimeType, modifiedAt, size } = file;
  const hasModifiedDate = modifiedAt && Number.isFinite(Date.parse(modifiedAt));
  const hasProperties = hasModifiedDate || size !== undefined || mimeType;
  const modifiedDateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        timeZone: "UTC",
        timeZoneName: "short",
        year: "numeric",
      }),
    [locale]
  );
  const checksums = [
    { label: "QuickXorHash", value: hashes?.quickXorHash },
    { label: "SHA-1", value: hashes?.sha1Hash },
  ].filter(({ value }) => value);

  return (
    <Card className="grid min-h-56 gap-0 py-0 sm:grid-cols-[minmax(10rem,1fr)_minmax(0,3fr)]">
      <div className="grid min-h-32 place-items-center bg-(--brand-soft) sm:min-h-56">
        <Image
          alt=""
          className="size-28 sm:size-48"
          fetchPriority="high"
          height={384}
          loading="eager"
          src="/assets/file-details.webp"
          unoptimized
          width={384}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4 py-5 sm:py-6">
        <CardHeader>
          <CardTitle>
            <h2>{messages.fileDetails}</h2>
          </CardTitle>
          <CardDescription>{messages.unsupported}</CardDescription>
        </CardHeader>
        {(hasProperties || checksums.length > 0) && (
          <CardContent className="gap-4">
            {hasProperties && (
              <dl className="grid gap-3">
                {hasModifiedDate && (
                  <FileProperty
                    icon={CalendarDaysIcon}
                    label={messages.modified}
                  >
                    <time dateTime={modifiedAt}>
                      {modifiedDateFormat.format(new Date(modifiedAt))}
                    </time>
                  </FileProperty>
                )}
                {size !== undefined && (
                  <FileProperty icon={HardDriveIcon} label={messages.size}>
                    {formatFileSize(size, locale)}
                  </FileProperty>
                )}
                {mimeType && (
                  <FileProperty icon={FileTypeIcon} label={messages.mimeType}>
                    {mimeType}
                  </FileProperty>
                )}
              </dl>
            )}
            {checksums.length > 0 && (
              <div className="grid gap-2 border-t pt-4">
                <h3 className="font-medium">{messages.checksums}</h3>
                <dl className="grid gap-2">
                  {checksums.map(({ label, value }) => (
                    <div
                      className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"
                      key={label}
                    >
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd>
                        <code className="break-all text-xs">{value}</code>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </CardContent>
        )}
      </div>
    </Card>
  );
}
