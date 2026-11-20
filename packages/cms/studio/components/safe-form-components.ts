import type { FieldProps, InputProps, ItemProps } from "sanity";
import { studioIdReferences, studioInputId } from "../input-id";

/** Keep native IDs and their labels consistent when field paths contain quotes. */
function withSafeInputIds<T extends InputProps>(props: T): T {
  return {
    ...props,
    id: studioInputId(props.id),
    elementProps: {
      ...props.elementProps,
      id: studioInputId(props.elementProps.id),
      "aria-describedby": studioIdReferences(
        props.elementProps["aria-describedby"]
      ),
    },
  };
}

export function SafeStudioInput(props: InputProps) {
  return props.renderDefault(withSafeInputIds(props));
}

export function SafeStudioField(props: FieldProps) {
  return props.renderDefault({
    ...props,
    inputId: studioInputId(props.inputId),
  });
}

export function SafeStudioItem(props: ItemProps) {
  return props.renderDefault({
    ...props,
    inputId: studioInputId(props.inputId),
  });
}
