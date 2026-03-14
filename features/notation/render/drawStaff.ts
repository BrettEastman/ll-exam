import { Accidental, Renderer, Stave, StaveNote, TickContext } from "vexflow";
import {
  KEYSIG_X_START,
  KEYSIG_X_STEP,
  SCALE_NOTE_X_START,
  SCALE_NOTE_X_STEP,
  STAFF_HEIGHT,
  STAFF_WIDTH,
} from "../model/constants";
import type { ClefType, NotationItem } from "../model/types";
import { ensureVexFlowFonts } from "@/lib/vexflow-fonts";

export interface DrawStaffOptions {
  container: HTMLDivElement;
  clef: ClefType;
  items: NotationItem[];
  kind: "scale" | "keysig";
}

export async function drawStaff(options: DrawStaffOptions): Promise<void> {
  const { container, clef, items, kind } = options;

  await ensureVexFlowFonts();
  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(STAFF_WIDTH, STAFF_HEIGHT);
  const context = renderer.getContext();

  const stave = new Stave(10, 44, STAFF_WIDTH - 20);
  stave.addClef(clef);
  stave.setContext(context).draw();

  const startX = kind === "keysig" ? KEYSIG_X_START : SCALE_NOTE_X_START;
  const stepX = kind === "keysig" ? KEYSIG_X_STEP : SCALE_NOTE_X_STEP;

  items.forEach((item, index) => {
    const note = new StaveNote({
      clef,
      keys: [item.key],
      duration: "q",
    });

    if (item.accidental) {
      note.addModifier(new Accidental(item.accidental), 0);
    }

    const tick = new TickContext();
    tick.addTickable(note).preFormat().setX(startX + index * stepX);
    note.setStave(stave);
    note.setContext(context);
    note.draw();
  });
}
