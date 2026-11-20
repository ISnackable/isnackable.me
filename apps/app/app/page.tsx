import { buttonVariants } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "App",
  description: "A clean starting point for your application.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/" },
  twitter: { card: "summary_large_image" },
};

const App = () => (
  <main className="min-h-dvh bg-background">
    <section className="container mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="max-w-2xl space-y-4">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
          Application
        </p>
        <h1 className="font-semibold text-4xl tracking-tight md:text-6xl">
          Start building your app here.
        </h1>
        <p className="text-lg text-muted-foreground leading-8">
          This workspace provides a clean foundation while removing the bundled
          auth, database, collaboration, notifications, webhooks, and
          feature-flag starter flows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Design system",
          "Analytics and observability",
          "Security and SEO",
        ].map((item) => (
          <Card key={item}>
            <CardContent className="p-6">
              <p className="font-medium">{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Link className={buttonVariants()} href={env.NEXT_PUBLIC_WEB_URL}>
          Visit website
        </Link>
      </div>
    </section>
  </main>
);

export default App;
