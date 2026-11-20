interface GiscusEnvironment {
  GISCUS_CATEGORY?: string;
  GISCUS_CATEGORY_ID?: string;
  GISCUS_REPO?: string;
  GISCUS_REPO_ID?: string;
}

const repositoryPattern = /^[\w.-]+\/[\w.-]+$/;

export interface GiscusConfig {
  category: string;
  categoryId: string;
  repo: `${string}/${string}`;
  repoId: string;
}

/** An optional integration: incomplete configuration never loads a third party. */
export function getGiscusConfig(env: GiscusEnvironment): GiscusConfig | null {
  const repo = env.GISCUS_REPO?.trim();
  const repoId = env.GISCUS_REPO_ID?.trim();
  const category = env.GISCUS_CATEGORY?.trim();
  const categoryId = env.GISCUS_CATEGORY_ID?.trim();
  if (
    !(repo && repositoryPattern.test(repo) && repoId && category && categoryId)
  ) {
    return null;
  }
  return { repo: repo as `${string}/${string}`, repoId, category, categoryId };
}

export function giscusLanguage(locale: string) {
  if (locale === "zh") {
    return "zh-CN";
  }
  return locale === "ja" ? "ja" : "en";
}
