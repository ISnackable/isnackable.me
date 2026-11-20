"use client";

import { NotFound } from "@repo/design-system/components/ui/not-found";
import { useTranslations } from "@repo/internationalization/client";
import { defaultLocale, isLocale } from "@repo/internationalization/locales";
import { captureClientException } from "@repo/observability/client";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function RouteError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations("web.errors");
  const { locale } = useParams<{ locale: string }>();
  const homeHref = `/${isLocale(locale) ? locale : defaultLocale}`;

  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return (
    <NotFound
      actionLabel={t("retry")}
      description={t("serverDescription")}
      errorCode="500"
      onAction={retry}
      secondaryActionLabel={t("home")}
      secondaryHref={homeHref}
      title={t("serverTitle")}
    />
  );
}
