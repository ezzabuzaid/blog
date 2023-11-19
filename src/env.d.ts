/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// extends Window object to have plausible
interface Window {
  fathom: {
    trackEvent: (name: string, options?: any) => void;
  };
}
