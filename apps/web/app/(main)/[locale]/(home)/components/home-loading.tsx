import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { cn } from "@repo/design-system/lib/utils";
import layout from "./hero-layout.module.css";

export function HomeLoading({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className={cn(
        layout.loading,
        "motion-reduce:[&_[data-slot=skeleton]]:animate-none"
      )}
      data-loading-layout="home"
      role="status"
    >
      <div aria-hidden="true" className={cn(layout.scene, "hero-scene")}>
        <div className={layout.stage}>
          <div className={layout.topRow}>
            <div className={layout.lanyard}>
              {/* Match the renderer's hanging point and portrait card ratio. */}
              <Skeleton className={cn(layout.lanyardStrap, "rounded-none")} />
              <Skeleton className={cn(layout.lanyardCard, "rounded-xl")} />
            </div>
            <div className={layout.media}>
              <Skeleton className={cn(layout.feature, "rotate-[4deg]")} />
              <Skeleton className={cn(layout.music, "rounded-2xl")} />
            </div>
          </div>
          <div className={cn(layout.identityRow, layout.hasBadge)}>
            <Skeleton className={cn(layout.github, "rounded-full")} />
            <div className={layout.identity}>
              <Skeleton className={layout.nameGraphic} />
              <Skeleton className={layout.taglinePlaceholder} />
            </div>
            <Skeleton className={layout.folder} />
          </div>
          <div className={layout.terminal}>
            <Skeleton className={layout.terminalPlaceholder} />
          </div>
          <div className={layout.contributions}>
            <Skeleton className={layout.contributionsPlaceholder} />
          </div>
          <Skeleton
            className={cn(
              layout.sticker,
              layout.stickerWithCollage,
              "-rotate-[6deg]"
            )}
          />
          <div className={layout.collage}>
            <Skeleton className={layout.collageBoard} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeSectionLoading({ kind }: { kind: string }) {
  return (
    <section
      aria-hidden="true"
      className="flex flex-col gap-9 motion-reduce:[&_[data-slot=skeleton]]:animate-none"
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-64 max-w-full" />
      </div>
      {kind === "writingSection" ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div className="flex flex-col gap-4" key={index}>
              <Skeleton className="aspect-[16/10] w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        </div>
      )}
    </section>
  );
}
