import type { DefaultTheme, ThemeProviderProps } from "@wrksz/themes/next";
import { ThemeProvider as NextThemeProvider } from "@wrksz/themes/next";

export function ThemeProvider<Themes extends string = DefaultTheme>({
  children,
  ...properties
}: ThemeProviderProps<Themes>) {
  return (
    <NextThemeProvider<Themes>
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      {...properties}
    >
      {children}
    </NextThemeProvider>
  );
}
