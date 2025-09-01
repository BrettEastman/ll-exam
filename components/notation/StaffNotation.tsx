"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Stave, StaveNote, TickContext, Accidental } from "vexflow";

interface StaffNotationProps {
  width?: number;
  height?: number;
  clef?: "treble" | "bass";
}

interface PlacedNote {
  line: number;
  accidental?: string;
}

// D Major scale definition: D, E, F#, G, A, B, C# (octave-agnostic)
const D_MAJOR_SCALE = [
  { note: "d", accidental: null },
  { note: "e", accidental: null },
  { note: "f", accidental: "#" },
  { note: "g", accidental: null },
  { note: "a", accidental: null },
  { note: "b", accidental: null },
  { note: "c", accidental: "#" }
];

const MAX_NOTES = 7;

export default function StaffNotation({
  width = 600,
  height = 200,
  clef: initialClef = "treble",
}: StaffNotationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [currentClef, setCurrentClef] = useState<"treble" | "bass">(initialClef);
  const [selectedAccidental, setSelectedAccidental] = useState<string | null>(null);
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<any>(null);

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
    stave.addClef(currentClef);
    stave.setContext(context).draw();

    // If there are placed notes, render them individually
    if (placedNotes.length > 0) {
      try {
        // Draw notes one by one without using TickContext (simpler approach)
        placedNotes.forEach((note, index) => {
          const noteString = getNoteName(note.line, currentClef);
          const vfNote = new StaveNote({
            clef: currentClef,
            keys: [noteString],
            duration: "q",
          });

          if (note.accidental) {
            const accidental = new Accidental(note.accidental);
            vfNote.addModifier(accidental, 0);
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
  }, [placedNotes, width, height, currentClef]);

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
    const noteName = getNoteName(line, currentClef);

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

    if (eraseMode) {
      // In erase mode, find the closest note to the click and remove it
      if (placedNotes.length > 0) {
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        placedNotes.forEach((note, index) => {
          // Calculate distance between click and note position
          const noteX = 50 + (index * 50); // Same positioning logic as rendering
          const noteY = 76.67 + (note.line * 5); // Convert line to Y position (same as getStaffLine logic)
          const clickX = x / 1.5; // Convert click coordinates
          const clickY = y / 1.5;
          
          const distance = Math.sqrt(
            Math.pow(clickX - noteX, 2) + Math.pow(clickY - noteY, 2)
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        // Remove the closest note (with reasonable distance threshold)
        if (closestDistance < 100) { // 100px threshold
          setPlacedNotes((prev) => prev.filter((_, index) => index !== closestIndex));
        }
      }
    } else {
      // Add a new note with selected accidental (if under limit and not submitted)
      if (placedNotes.length < MAX_NOTES && !isSubmitted) {
        setPlacedNotes((prev) => [...prev, { 
          line, 
          accidental: selectedAccidental || undefined 
        }]);
      }
    }
  };

  // Convert a placed note to a comparable format (octave-agnostic)
  const noteToString = (note: PlacedNote): string => {
    const noteName = getNoteName(note.line, currentClef);
    const [noteOnly, octave] = noteName.split('/');
    const accidental = note.accidental || '';
    return `${noteOnly}${accidental}`; // Remove octave from comparison
  };

  // Grade the student's scale entry
  const gradeScale = () => {
    const studentNotes = placedNotes.map(noteToString);
    const correctScale = D_MAJOR_SCALE.map(note => 
      `${note.note}${note.accidental || ''}` // Remove octave from correct scale too
    );

    const results = {
      correct: [] as string[],
      incorrect: [] as string[],
      missing: [] as string[],
      score: 0
    };

    // Check each student note
    studentNotes.forEach((studentNote, index) => {
      if (index < correctScale.length && studentNote === correctScale[index]) {
        results.correct.push(studentNote);
      } else {
        results.incorrect.push(studentNote);
      }
    });

    // Find missing notes
    correctScale.forEach((correctNote, index) => {
      if (!studentNotes[index] || studentNotes[index] !== correctNote) {
        results.missing.push(correctNote);
      }
    });

    results.score = Math.round((results.correct.length / correctScale.length) * 100);
    
    setGradeResult(results);
    setIsSubmitted(true);
  };

  // Reset the exercise
  const resetExercise = () => {
    setPlacedNotes([]);
    setIsSubmitted(false);
    setGradeResult(null);
    setEraseMode(false);
    setSelectedAccidental(null);
  };

  return (
    <div>
      <h3>D Major Scale Exercise</h3>
      <p><strong>Instructions:</strong> Enter the D Major scale notes in order: D, E, F♯, G, A, B, C♯</p>
      <p><em>Note: You can place the notes in any octave - only the note names and accidentals matter!</em></p>
      
      {/* Controls */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Clef Selection */}
        <div>
          <label style={{ marginRight: "10px" }}>Clef:</label>
          <select 
            value={currentClef} 
            onChange={(e) => setCurrentClef(e.target.value as "treble" | "bass")}
            style={{ padding: "5px" }}
            disabled={isSubmitted}
          >
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </div>
        
        {/* Accidental Selection */}
        <div>
          <label style={{ marginRight: "10px" }}>Accidental:</label>
          <button 
            onClick={() => setSelectedAccidental(null)}
            disabled={isSubmitted}
            style={{ 
              padding: "5px 10px", 
              margin: "0 2px",
              backgroundColor: selectedAccidental === null && !eraseMode && !isSubmitted ? "#007bff" : "#f8f9fa",
              color: selectedAccidental === null && !eraseMode && !isSubmitted ? "white" : "black",
              border: "1px solid #ccc",
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            None
          </button>
          <button 
            onClick={() => setSelectedAccidental("#")}
            disabled={isSubmitted}
            style={{ 
              padding: "5px 10px", 
              margin: "0 2px",
              backgroundColor: selectedAccidental === "#" && !eraseMode && !isSubmitted ? "#007bff" : "#f8f9fa",
              color: selectedAccidental === "#" && !eraseMode && !isSubmitted ? "white" : "black",
              border: "1px solid #ccc",
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            ♯ Sharp
          </button>
          <button 
            onClick={() => setSelectedAccidental("b")}
            disabled={isSubmitted}
            style={{ 
              padding: "5px 10px", 
              margin: "0 2px",
              backgroundColor: selectedAccidental === "b" && !eraseMode && !isSubmitted ? "#007bff" : "#f8f9fa",
              color: selectedAccidental === "b" && !eraseMode && !isSubmitted ? "white" : "black",
              border: "1px solid #ccc",
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            ♭ Flat
          </button>
          <button 
            onClick={() => setSelectedAccidental("n")}
            disabled={isSubmitted}
            style={{ 
              padding: "5px 10px", 
              margin: "0 2px",
              backgroundColor: selectedAccidental === "n" && !eraseMode && !isSubmitted ? "#007bff" : "#f8f9fa",
              color: selectedAccidental === "n" && !eraseMode && !isSubmitted ? "white" : "black",
              border: "1px solid #ccc",
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            ♮ Natural
          </button>
        </div>
        
        {/* Erase Mode */}
        {!isSubmitted && (
          <div>
            <button 
              onClick={() => {
                setEraseMode(!eraseMode);
                if (!eraseMode) setSelectedAccidental(null); // Clear accidental when entering erase mode
              }}
              style={{ 
                padding: "5px 15px",
                backgroundColor: eraseMode ? "#dc3545" : "#f8f9fa",
                color: eraseMode ? "white" : "black",
                border: "1px solid #ccc",
                fontWeight: eraseMode ? "bold" : "normal"
              }}
            >
              {eraseMode ? "🗑️ ERASE MODE" : "🗑️ Erase"}
            </button>
          </div>
        )}
        
        {/* Submit/Reset Buttons */}
        <div>
          {!isSubmitted ? (
            <button 
              onClick={gradeScale}
              disabled={placedNotes.length === 0}
              style={{ 
                padding: "8px 20px",
                backgroundColor: placedNotes.length > 0 ? "#28a745" : "#f8f9fa",
                color: placedNotes.length > 0 ? "white" : "black",
                border: "1px solid #ccc",
                fontWeight: "bold",
                opacity: placedNotes.length === 0 ? 0.5 : 1
              }}
            >
              Submit Scale ({placedNotes.length}/{MAX_NOTES})
            </button>
          ) : (
            <button 
              onClick={resetExercise}
              style={{ 
                padding: "8px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "1px solid #007bff",
                fontWeight: "bold"
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
      
      <p>
        {isSubmitted 
          ? "Exercise submitted - view results below" 
          : eraseMode 
          ? "🗑️ ERASE MODE: Click on notes to remove them" 
          : placedNotes.length >= MAX_NOTES 
          ? "Maximum 7 notes reached - click Submit to grade your scale" 
          : `Click on the staff to place notes (${placedNotes.length}/${MAX_NOTES})`}
      </p>
      
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
        {/* Grading Results */}
        {isSubmitted && gradeResult && (
          <div style={{ 
            padding: "20px", 
            border: "2px solid #ccc", 
            borderRadius: "8px",
            backgroundColor: gradeResult.score >= 70 ? "#d4edda" : "#f8d7da",
            marginBottom: "20px"
          }}>
            <h4>Scale Exercise Results</h4>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>
              Score: {gradeResult.score}% 
              {gradeResult.score >= 90 ? " 🎉 Excellent!" : 
               gradeResult.score >= 70 ? " 👍 Good!" : " 📚 Keep practicing!"}
            </p>
            
            {gradeResult.correct.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <strong style={{ color: "green" }}>✓ Correct notes:</strong> {gradeResult.correct.join(", ")}
              </div>
            )}
            
            {gradeResult.incorrect.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <strong style={{ color: "red" }}>✗ Incorrect notes:</strong> {gradeResult.incorrect.join(", ")}
              </div>
            )}
            
            {gradeResult.missing.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <strong style={{ color: "orange" }}>⚠ Missing notes:</strong> {gradeResult.missing.join(", ")}
              </div>
            )}
            
            <div style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
              <strong>Correct D Major Scale:</strong> D, E, F♯, G, A, B, C♯ (any octave)
            </div>
          </div>
        )}

        {/* Current Notes Display */}
        {!isSubmitted && (
          <div>
            <p>Current notes: {placedNotes.length}/{MAX_NOTES}</p>
            <div>
              {placedNotes.map((note, index) => (
                <div key={index}>
                  {index + 1}. {getNoteName(note.line, currentClef)}
                  {note.accidental && ` (${note.accidental === '#' ? 'Sharp' : note.accidental === 'b' ? 'Flat' : 'Natural'})`}
                </div>
              ))}
            </div>
            {placedNotes.length > 0 && (
              <button onClick={() => setPlacedNotes([])} style={{ marginTop: "10px", padding: "10px 20px" }}>
                Clear All Notes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
