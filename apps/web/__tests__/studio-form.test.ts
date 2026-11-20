import {
  SafeStudioField,
  SafeStudioInput,
  SafeStudioItem,
} from "@repo/cms/studio/components/safe-form-components";
import { studioInputId } from "@repo/cms/studio/input-id";
import { createElement } from "react";
import { expect, test, vi } from "vitest";

test("Studio input wrappers keep IDs, labels, descriptions and primitive array items in sync", () => {
  const id = 'sections[_key=="hero"].nameGraphic.paths[0]';
  const path = ["sections", { _key: "hero" }, "nameGraphic", "paths", 0];
  const onChange = vi.fn();
  const onFocus = vi.fn();
  const ref = { current: null };
  const renderInput = vi.fn((_props: unknown) => createElement("input"));
  const renderField = vi.fn(() => createElement("label"));
  const renderItem = vi.fn(() => createElement("div"));
  SafeStudioInput({
    id,
    path,
    value: "M 0 0 L 10 10",
    onChange,
    elementProps: { id, onFocus, ref, "aria-describedby": `desc_${id}` },
    renderDefault: renderInput,
  } as unknown as Parameters<typeof SafeStudioInput>[0]);
  SafeStudioField({
    inputId: id,
    path,
    renderDefault: renderField,
  } as unknown as Parameters<typeof SafeStudioField>[0]);
  SafeStudioItem({
    inputId: id,
    path,
    renderDefault: renderItem,
  } as unknown as Parameters<typeof SafeStudioItem>[0]);
  const input = renderInput.mock.calls[0]?.[0];
  expect(input).toMatchObject({
    id: studioInputId(id),
    path,
    value: "M 0 0 L 10 10",
    onChange,
    elementProps: {
      id: studioInputId(id),
      onFocus,
      ref,
      "aria-describedby": `desc_${studioInputId(id)}`,
    },
  });
  expect(renderField).toHaveBeenCalledWith(
    expect.objectContaining({ inputId: studioInputId(id), path })
  );
  expect(renderItem).toHaveBeenCalledWith(
    expect.objectContaining({ inputId: studioInputId(id), path })
  );
});
