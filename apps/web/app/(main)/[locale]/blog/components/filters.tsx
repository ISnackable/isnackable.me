"use client";

import type { BlogFilters } from "@repo/cms/data/blog";
import {
  Button,
  buttonVariants,
} from "@repo/design-system/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@repo/design-system/components/ui/field";
import { Input } from "@repo/design-system/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@repo/design-system/components/ui/native-select";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary } from "@repo/internationalization";
import Link from "next/link";
import { useId } from "react";

export function BlogFiltersForm({
  copy,
  filters,
  locale,
  tags,
}: {
  copy: Dictionary["web"]["blog"]["discovery"];
  filters: BlogFilters;
  locale: string;
  tags: string[];
}) {
  const id = useId();
  return (
    <search>
      <form
        action={`/${locale}/blog`}
        key={JSON.stringify([filters.q, filters.tag])}
      >
        <FieldGroup className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_auto]">
          <Field className="min-w-0">
            <FieldLabel htmlFor={`${id}-query`}>{copy.search}</FieldLabel>
            <Input
              className="min-h-11"
              defaultValue={filters.q}
              id={`${id}-query`}
              maxLength={100}
              name="q"
              type="search"
            />
          </Field>
          <Field className="min-w-0">
            <FieldLabel htmlFor={`${id}-topic`}>{copy.topic}</FieldLabel>
            <NativeSelect
              className="w-full min-w-0 [&_select]:min-h-11"
              defaultValue={filters.tag}
              id={`${id}-topic`}
              name="tag"
            >
              <NativeSelectOption value="">{copy.allTopics}</NativeSelectOption>
              {filters.tag && !tags.includes(filters.tag) ? (
                <NativeSelectOption value={filters.tag}>
                  {filters.tag}
                </NativeSelectOption>
              ) : null}
              {tags.map((tag) => (
                <NativeSelectOption key={tag} value={tag}>
                  {tag}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field className="w-auto" orientation="horizontal">
            <Button className="min-h-11" type="submit">
              {copy.apply}
            </Button>
            {filters.q || filters.tag ? (
              <Link
                className={cn(buttonVariants({ variant: "ghost" }), "min-h-11")}
                href={`/${locale}/blog`}
              >
                {copy.clear}
              </Link>
            ) : null}
          </Field>
        </FieldGroup>
      </form>
    </search>
  );
}
