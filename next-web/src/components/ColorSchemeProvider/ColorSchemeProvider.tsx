/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// The (ColorSchemeProvider) caused the re-render twice! #814
// https://github.com/mantinedev/mantine/issues/814
// As I did not need to use local-storage to update theme
import type { ColorScheme } from "@mantine/core";
import React, { createContext, useContext } from "react";

interface ColorSchemeContextProps {
  colorScheme: ColorScheme;
  toggleColorScheme(colorScheme?: ColorScheme): void;
}

const ColorSchemeContext = createContext<ColorSchemeContextProps | null>(null);

export function useMantineColorScheme() {
  const ctx = useContext(ColorSchemeContext);

  if (!ctx) {
    throw new Error(
      "useMantineColorScheme hook was called outside of context, make sure your app is wrapped with ColorSchemeProvider component"
    );
  }

  return ctx;
}

interface ColorSchemeProviderProps extends ColorSchemeContextProps {
  children: React.ReactNode;
}

export function ColorSchemeProvider({
  colorScheme,
  toggleColorScheme,
  children
}: ColorSchemeProviderProps) {
  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
