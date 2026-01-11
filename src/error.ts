export class NativeSFCError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "NativeSFCError";
  }
}

export function warn(...args: any[]) {
  console.warn("NativeSFC Warning:", ...args);
}
