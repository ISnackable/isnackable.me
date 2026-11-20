const WHITESPACE = /\s+/;

/** Path IDs are valid HTML, but injected autofill scripts can misuse their quotes as CSS. */
export function studioInputId(id: string): string {
  return encodeURIComponent(id);
}

export function studioIdReferences(
  ids: string | undefined
): string | undefined {
  return ids?.split(WHITESPACE).map(studioInputId).join(" ");
}
