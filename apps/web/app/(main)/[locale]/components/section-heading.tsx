import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

interface SectionHeadingProps {
  action?: { href: string; label: string };
  description: string;
  label: string;
  title: string;
}

export function SectionHeading({
  action,
  description,
  label,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex max-w-2xl flex-col gap-4">
        <p className="section-label">{label}</p>
        <h2 className="section-title">{title}</h2>
        {description ? (
          <p className="max-w-xl text-muted-foreground leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          href={action.href}
        >
          {action.label}
          <ArrowUpRightIcon data-icon="inline-end" />
        </Link>
      ) : null}
    </div>
  );
}
