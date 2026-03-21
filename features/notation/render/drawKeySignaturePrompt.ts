import { Renderer, Stave } from "vexflow";
import { ensureVexFlowFonts } from "@/lib/vexflow-fonts";

interface DrawKeySignaturePromptOptions {
  container: HTMLDivElement;
  keySpec: string;
  width?: number;
}

export async function drawKeySignaturePrompt(
  options: DrawKeySignaturePromptOptions,
): Promise<void> {
  const { container, keySpec, width = 270 } = options;

  await ensureVexFlowFonts();
  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, 130);

  const context = renderer.getContext();
  const stave = new Stave(8, 26, width - 16);
  stave.addClef("treble");
  stave.addKeySignature(keySpec);
  stave.setContext(context).draw();
}
