import { on } from "./events.ts";

const config = {
  fetch: globalThis.fetch,
  rewriteModule: (code: string, sourceUrl: string): Awaitable<string> =>
    `import.meta.url=${JSON.stringify(sourceUrl)};\n${code}`,
  on,
};

Object.preventExtensions(config);

export { config };

export type Awaitable<T> = T | Promise<T>;

export type ModuleObject = Record<string, any>;
