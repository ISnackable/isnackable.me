import {
  createLanyardRenderer,
  type LanyardConfiguration,
  type LanyardEvent,
  type LanyardRenderer,
  type LanyardSize,
} from "../app/(main)/[locale]/(home)/components/lanyard-renderer";

let runtime: LanyardRenderer | undefined;
let revision = 0;
let prepared: ((event: LanyardEvent) => void) | undefined;

declare global {
  interface Window {
    captureLanyard(
      configuration: LanyardConfiguration,
      size: LanyardSize
    ): Promise<void>;
  }
}

window.captureLanyard = async (configuration, size) => {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("The snapshot canvas is missing");
  }
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  const current = ++revision;
  await new Promise<void>((resolve, reject) => {
    prepared = (event) => {
      if (event.type === "ready" && event.revision === current) {
        resolve();
      } else if (event.type === "error") {
        reject(new Error(event.message));
      }
    };
    if (runtime) {
      runtime.configure(configuration, size, current);
    } else {
      try {
        runtime = createLanyardRenderer(
          canvas,
          configuration,
          size,
          (event) => prepared?.(event),
          current
        );
      } catch (error) {
        reject(error);
      }
    }
  });
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
};
