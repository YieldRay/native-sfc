export class WCLoaderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WCLoaderError";
  }
}

export function warn(...args: any[]) {
  console.warn("WCLoader Warning:", ...args);
}
