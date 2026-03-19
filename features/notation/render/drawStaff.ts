import {
  Accidental,
  Element,
  Renderer,
  Stave,
  StaveNote,
  TickContext,
  VexFlow,
} from "vexflow";
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

function accidentalGlyph(accidental: NotationItem["accidental"]): string | null {
  switch (accidental) {
    case "#":
      return VexFlow.Glyphs.accidentalSharp;
    case "b":
      return VexFlow.Glyphs.accidentalFlat;
    case "n":
      return VexFlow.Glyphs.accidentalNatural;
    default:
      return null;
  }
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

  if (kind === "keysig") {
    items.forEach((item, index) => {
      if (!item.accidental) return;

      const glyphText = accidentalGlyph(item.accidental);
      if (!glyphText) return;

      const keyProps = VexFlow.keyProperties(item.key, clef);
      if (!keyProps || typeof keyProps.line !== "number") return;

      const glyph = new Element("KeySignature");
      glyph.setText(glyphText);
      glyph.setContext(context);
      glyph.setYShift(stave.getYForNote(keyProps.line));
      glyph.renderText(context, startX + index * stepX, 0);
    });

    return;
  }

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
