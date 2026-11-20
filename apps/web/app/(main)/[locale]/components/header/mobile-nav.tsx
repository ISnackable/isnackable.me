import { DialogPopup } from "@repo/design-system/components/dialog-popup";
import {
  Button,
  buttonVariants,
} from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Link } from "@repo/internationalization/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { useEffect } from "react";

export function MobileNav({
  navigationItems,
  toggleLabel,
  closeLabel,
  navigationLabel,
  onOpenChange,
  open,
}: {
  navigationItems: { title: string; href: string }[];
  toggleLabel: string;
  closeLabel: string;
  navigationLabel: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        onOpenChange(false);
      }
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={toggleLabel}
            className="md:hidden"
            size="icon"
            variant="ghost"
          />
        }
      >
        {open ? null : <MenuIcon />}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-40 bg-background/95 supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-sm motion-reduce:animate-none" />
        <DialogPopup className="pointer-events-none fixed inset-0 z-50 outline-none">
          <DialogTitle className="sr-only">{navigationLabel}</DialogTitle>
          <DialogClose
            render={
              <Button
                aria-label={closeLabel}
                className="pointer-events-auto absolute top-2.5 right-4"
                size="icon"
                variant="ghost"
              />
            }
          >
            <XIcon />
          </DialogClose>
          <nav
            aria-label={navigationLabel}
            className="pointer-events-auto absolute inset-x-0 top-14 bottom-0 overflow-y-auto p-4"
          >
            <div className="grid gap-y-2">
              {navigationItems.map((item) => (
                <Link
                  className={buttonVariants({
                    className: "justify-start",
                    variant: "ghost",
                  })}
                  href={item.href}
                  key={item.href}
                  onNavigate={() => onOpenChange(false)}
                  prefetch={true}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
