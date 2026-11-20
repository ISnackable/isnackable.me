import type { DefaultTheme, ThemeProviderProps } from "@wrksz/themes/next";
import { Toaster } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./providers/theme";

export function DesignSystemProvider<Themes extends string = DefaultTheme>({
  children,
  ...properties
}: ThemeProviderProps<Themes>) {
  return (
    <ThemeProvider<Themes> {...properties}>
      <Toaster>
        <TooltipProvider>{children}</TooltipProvider>
      </Toaster>
    </ThemeProvider>
  );
}

export { useTheme } from "./client";
