import {
  createLanyardRenderer,
  type LanyardCommand,
  type LanyardEvent,
  type LanyardRenderer,
} from "./lanyard-renderer";

let renderer: Promise<LanyardRenderer> | null = null;
const emit = (event: LanyardEvent) => postMessage(event);

addEventListener("message", (event: MessageEvent<LanyardCommand>) => {
  const command = event.data;
  if (command.type === "init") {
    renderer = Promise.resolve().then(() =>
      createLanyardRenderer(
        command.canvas,
        command.configuration,
        command.size,
        emit,
        command.revision
      )
    );
    renderer.catch((error: unknown) =>
      emit({ type: "error", message: String(error) })
    );
    return;
  }
  renderer
    ?.then((runtime) => {
      switch (command.type) {
        case "configure":
          runtime.configure(
            command.configuration,
            command.size,
            command.revision
          );
          break;
        case "reveal":
          runtime.reveal(command.revision);
          break;
        case "pointer":
          runtime.pointer(command.pointer);
          break;
        case "visibility":
          runtime.setVisible(command.visible);
          break;
        default:
          break;
      }
    })
    .catch(() => emit({ type: "error" }));
});
