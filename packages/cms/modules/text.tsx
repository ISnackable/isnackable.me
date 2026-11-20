import type { TypedObject } from "@portabletext/types";
import { PortableText } from "next-sanity";

/** Leaf text uses the standard renderer, keeping nested modules out of this dependency path. */
export function ModuleText({ value }: { value?: TypedObject[] | null }) {
  return (
    <div className="flex flex-col gap-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc">
      <PortableText value={value ?? []} />
    </div>
  );
}
