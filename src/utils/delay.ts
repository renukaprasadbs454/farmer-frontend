export const wait = (ms = 600) => new Promise<void>((r) => setTimeout(r, ms));
