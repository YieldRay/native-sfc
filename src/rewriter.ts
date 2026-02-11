import { parse as parseESM } from "es-module-lexer/js";
import { parse as parseStackTrace } from "stacktrace-parser";
import { config, type ModuleObject } from "./config.ts";

async function rewriteModule(code: string, sourceUrl: string): Promise<string> {
  const [imports] = parseESM(code);

  const rewritableImports = imports.filter((i) => {
    const specifier = code.slice(i.s, i.e);
    return !isBrowserUrl(specifier); // absolute browser URLs are not rewritten, ./xxx or /xxx must be rewritten
  });

  for (const importEntry of rewritableImports.reverse()) {
    // imports like "./xxx" or "/xxx" will be rewritten to absolute URLs
    const specifier = code.slice(importEntry.s, importEntry.e);
    let rewritten = specifier;
    // TODO: we make sure only handle static import syntax and static import(string) here

    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      rewritten = new URL(specifier, sourceUrl).href;
    } else if (specifier.startsWith("node:")) {
      // use @jspm/core for node built-in modules
      const module = specifier.slice(5);
      rewritten = `https://raw.esm.sh/@jspm/core/nodelibs/browser/${module}.js`;
    } else if (specifier.startsWith("npm:")) {
      rewritten = `https://esm.sh/${specifier.slice(4)}`;
    } else {
      // bare module specifier, since the module will NOT follow import maps,
      // we use esm.sh instead
      rewritten = `https://esm.sh/${specifier}`;
    }
    code = code.slice(0, importEntry.s) + rewritten + code.slice(importEntry.e);
  }

  const { rewriteModule } = config;
  // we also rewrite import.meta.url by default, which will then be used in `getImporterUrl` function
  return await rewriteModule(code, sourceUrl);
}

// browser and blob URLs, but not data URLs
function isBrowserUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:http://") ||
    url.startsWith("blob:https://")
  );
}

// track blob URLs to their original source URLs
export const blobMap = new Map<string, string>();
// track components loaded by loadComponent(), name -> {url, component}

export async function esm(code: string, sourceUrl: string): Promise<ModuleObject> {
  code = await rewriteModule(code, sourceUrl);

  const blob = new Blob([code], { type: "text/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  blobMap.set(blobUrl, sourceUrl);

  try {
    const module: ModuleObject = await import(blobUrl);
    return module;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * IMPORTANT: we split functions into files, but there will be eventually
 * single bundled file, so this function will work.
 */
export function getImporterUrl() {
  const stack = parseStackTrace(new Error().stack!);
  for (const { file } of stack) {
    if (file && file !== import.meta.url) {
      if (file.startsWith("blob:")) {
        if (blobMap.has(file)) {
          return blobMap.get(file);
        }
        // skip if it is not a esm blob module we created
        continue;
      }
      return file;
    }
  }

  return null;
}
