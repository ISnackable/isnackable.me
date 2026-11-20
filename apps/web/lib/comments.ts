const draftsPrefix = /^drafts\./;

/** Article discussions belong to document identities, independent of URL or title. */
export function articleDiscussionTerm(documentId: string) {
  return `post:${documentId.replace(draftsPrefix, "")}`;
}
