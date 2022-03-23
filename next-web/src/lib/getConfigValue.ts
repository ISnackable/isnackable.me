/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import rawSiteConfig from "../../site.config";

if (!rawSiteConfig) {
  throw new Error(`Config error: invalid site.config.ts`);
}

let siteConfigOverrides;

try {
  if (process.env.NEXT_PUBLIC_SITE_CONFIG) {
    siteConfigOverrides = JSON.parse(process.env.NEXT_PUBLIC_SITE_CONFIG);
  }
} catch (err) {
  console.error('Invalid config "NEXT_PUBLIC_SITE_CONFIG" failed to parse');
  throw err;
}

const siteConfig = {
  ...rawSiteConfig,
  ...siteConfigOverrides
};

export function getSiteConfig<T>(key: string, defaultValue?: T): T {
  const value: T = siteConfig[key];

  if (value !== undefined) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Config error: missing required site config value "${key}"`);
}

export function getEnv(
  key: string,
  defaultValue?: string,
  env = process.env
): string {
  const value = env[key];

  if (value !== undefined) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Config error: missing required env variable "${key}"`);
}
