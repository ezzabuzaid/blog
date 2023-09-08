/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// extends Window object to have plausible
interface Window {
  plausible: any;
}
