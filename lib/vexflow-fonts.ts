import { VexFlow } from "vexflow";

let fontsLoaded = false;
let fontsLoading = false;
let fontsLoadPromise: Promise<void> | null = null;

/**
 * Load VexFlow fonts once globally.
 * Returns a promise that resolves when fonts are loaded.
 */
export async function ensureVexFlowFonts(): Promise<void> {
  // If fonts are already loaded, return immediately
  if (fontsLoaded) {
    return Promise.resolve();
  }

  // If fonts are currently loading, return the existing promise
  if (fontsLoading && fontsLoadPromise) {
    return fontsLoadPromise;
  }

  // Start loading fonts
  fontsLoading = true;
  fontsLoadPromise = (async () => {
    try {
      // Load both Bravura and Academico fonts
      await VexFlow.loadFonts("Bravura", "Academico");
      VexFlow.setFonts("Bravura", "Academico");
      fontsLoaded = true;
      fontsLoading = false;
      console.log("VexFlow fonts loaded successfully");
    } catch (error) {
      console.error("Failed to load VexFlow fonts:", error);
      fontsLoading = false;
      throw error;
    }
  })();

  return fontsLoadPromise;
}

