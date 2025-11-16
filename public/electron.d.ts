// This tells TypeScript that the global Window object has an 'electron' property
// with an 'apiKey' string, which we are defining in our preload script.

export {};

declare global {
  interface Window {
    electron?: {
      apiKey?: string;
    };
  }
}
