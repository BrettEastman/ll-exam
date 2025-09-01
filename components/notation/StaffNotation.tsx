"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Stave, StaveNote, TickContext } from "vexflow";

interface StaffNotationProps {
  width?: number;
  height?: number;
  clef?: "treble" | "bass";
}

interface PlacedNote {
  line: number;
  accidental?: string;
}

export default function StaffNotation({
  width = 600,
  height = 200,
  clef = "treble",
}: StaffNotationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    svgRef.current.innerHTML = "";

    // Create VexFlow renderer
    const renderer = new Renderer(svgRef.current, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    // Create a stave
    const stave = new Stave(10, 40, width - 20);
    stave.addClef(clef);
    stave.setContext(context).draw();

    // If there are placed notes, render them individually
    if (placedNotes.length > 0) {
      try {
        // Draw notes one by one without using TickContext (simpler approach)
        placedNotes.forEach((note, index) => {
          const noteString = getNoteName(note.line, clef);
          const vfNote = new StaveNote({
            clef,
            keys: [noteString],
            duration: "q",
          });

          if (note.accidental) {
            vfNote.addModifier(note.accidental);
          }

          // Set position and render
          const noteX = 50 + index * 50; // Start at 50, space 50px apart
          vfNote.setStave(stave);
          vfNote.setContext(context);

          // Create individual tick context for each note
          const tickContext = new TickContext();
          tickContext.addTickable(vfNote);
          tickContext.preFormat().setX(noteX);

          vfNote.draw();
        });
      } catch (error) {
        console.error("Error rendering notes:", error);
      }
    }
  }, [placedNotes, width, height, clef]);

  // Convert staff line position to note name
  const getNoteName = (line: number, clef: "treble" | "bass"): string => {
    // Treble clef mapping from top to bottom
    const trebleNotes = [
      "g/5", // space above staff
      "f/5", // line5 - top line
      "e/5", // space4 - space
      "d/5", // line4 - line
      "c/5", // space3 - space
      "b/4", // line3 - line
      "a/4", // space2 - space
      "g/4", // line2 - line
      "f/4", // space1 - space
      "e/4", // line1 - bottom line
      "d/4", // space below staff
      "c/4", // middle C ledger line
      "b/3", // first space below C ledger line
    ];

    const bassNotes = [
      "b/3", // space above staff
      "a/3", // line5 - top line
      "g/3", // space4 - space
      "f/3", // line4 - line
      "e/3", // space3 - space
      "d/3", // line3- line
      "c/3", // space2 - space
      "b/2", // line2 - line
      "a/2", // space1 - space
      "g/2", // line1 - bottom line
      "f/2", // space below staff
      "e/2", // first ledger line below staff
      "d/2", // first space below E ledger line
    ];

    const notes = clef === "treble" ? trebleNotes : bassNotes;
    return notes[line] || notes[7]; // Default to middle line (G4 for treble) if out of range
  };

  // Convert click position to staff line
  const getStaffLine = (y: number): number => {
    // The SVG is scaled 1.5x, so we need to convert click coordinates back to VexFlow coordinates
    // Click Y is in scaled space, so divide by scale to get VexFlow coordinates
    const vexflowY = y / 1.5;

    // Using F and E line data to calculate correct spacing:
    // F: VexFlow Y = 81.67, should be index 1
    // E: VexFlow Y = 121, should be index 9
    // Distance between F and E: 121 - 81.67 = 39.33
    // Index difference: 9 - 1 = 8
    // So lineSpacing = 39.33 / 8 = 4.92 ≈ 5
    const staveTop = 76.67; // 81.67 - (1 * 5) = 76.67
    const lineSpacing = 5;
    const relativeY = vexflowY - staveTop;
    const line = Math.round(relativeY / lineSpacing);

    return Math.max(0, Math.min(12, line)); // Clamp to valid range
  };

  const handleStaffClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const line = getStaffLine(y);
    const noteName = getNoteName(line, clef);

    // Detailed debugging
    const vexflowY = y / 1.5;
    const relativeY = vexflowY - 76.67;

    // console.log("=== CLICK DEBUG ===");
    // console.log("Raw click position:", { clientX: event.clientX, clientY: event.clientY });
    // console.log("SVG rect:", { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    // console.log("Click in SVG space:", { x, y });
    // console.log("Converted to VexFlow Y:", vexflowY);
    // console.log("Relative to staff top (76.67):", relativeY);
    // console.log("Calculated line index:", line);
    // console.log("Resulting note:", noteName);
    // console.log("==================");

    // Check if there's already a note on this line
    const existingNoteIndex = placedNotes.findIndex(
      (note) => note.line === line
    );

    if (existingNoteIndex >= 0) {
      // Remove the note if it exists
      setPlacedNotes((prev) =>
        prev.filter((_, index) => index !== existingNoteIndex)
      );
    } else {
      // Add a new note
      setPlacedNotes((prev) => [...prev, { line }]);
    }
  };

  return (
    <div>
      <h3>Click on the staff to place/remove notes</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={handleStaffClick}
        style={{
          cursor: "pointer",
          border: "1px solid #ccc",
          transform: "scale(1.5)",
          transformOrigin: "top left",
          marginBottom: "20px",
        }}
      />
      <div style={{ marginTop: "100px" }}>
        <p>Placed notes: {placedNotes.length}</p>
        <div>
          {placedNotes.map((note, index) => (
            <div key={index}>
              Line {note.line}: {getNoteName(note.line, clef)}
            </div>
          ))}
        </div>
        <button onClick={() => setPlacedNotes([])}>Clear All Notes</button>
      </div>
    </div>
  );
}
