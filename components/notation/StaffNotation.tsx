"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Renderer, Stave, StaveNote, TickContext, Accidental } from "vexflow";
import { ensureVexFlowFonts } from "@/lib/vexflow-fonts";
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Select,
  Card,
  Heading,
  createListCollection,
} from "@chakra-ui/react";

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
  { note: "c", accidental: "#" },
];

const MAX_NOTES = 7;

export default function StaffNotation({
  width = 600,
  height = 200,
  clef: initialClef = "treble",
}: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);
  const [currentClef, setCurrentClef] = useState<"treble" | "bass">(
    initialClef
  );
  const [selectedAccidental, setSelectedAccidental] = useState<string | null>(
    null
  );
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<any>(null);

  const clefCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { value: "treble", label: "Treble" },
          { value: "bass", label: "Bass" },
        ],
      }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Load VexFlow fonts before rendering
    const loadAndRender = async () => {
      try {
        // Ensure fonts are loaded (only loads once globally)
        await ensureVexFlowFonts();

        // Clear previous content
        containerRef.current!.innerHTML = "";

        // Create VexFlow renderer using SVG backend
        const renderer = new Renderer(
          containerRef.current!,
          Renderer.Backends.SVG
        );
        renderer.resize(width, height);
        const context = renderer.getContext();

        // Create a stave
        const stave = new Stave(10, 40, width - 20);
        stave.addClef(currentClef);
        stave.setContext(context).draw();

        // If there are placed notes, render them individually
        if (placedNotes.length > 0) {
          try {
            // Draw notes one by one
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
              const noteX = 40 + index * 45; // Start closer to clef, space 45px apart
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
      } catch (error) {
        console.error("Error loading VexFlow fonts:", error);
      }
    };

    loadAndRender();

    loadAndRender();
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

  const handleStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Get the SVG that VexFlow created inside the container
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
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
          const noteX = 40 + index * 45; // Same positioning logic as rendering
          const noteY = 76.67 + note.line * 5; // Convert line to Y position (same as getStaffLine logic)
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
        if (closestDistance < 100) {
          // 100px threshold
          setPlacedNotes((prev) =>
            prev.filter((_, index) => index !== closestIndex)
          );
        }
      }
    } else {
      // Add a new note with selected accidental (if under limit and not submitted)
      if (placedNotes.length < MAX_NOTES && !isSubmitted) {
        setPlacedNotes((prev) => [
          ...prev,
          {
            line,
            accidental: selectedAccidental || undefined,
          },
        ]);
      }
    }
  };

  // Convert a placed note to a comparable format (octave-agnostic)
  const noteToString = (note: PlacedNote): string => {
    const noteName = getNoteName(note.line, currentClef);
    const [noteOnly, octave] = noteName.split("/");
    const accidental = note.accidental || "";
    return `${noteOnly}${accidental}`; // Remove octave from comparison
  };

  // Grade the student's scale entry
  const gradeScale = () => {
    const studentNotes = placedNotes.map(noteToString);
    const correctScale = D_MAJOR_SCALE.map(
      (note) => `${note.note}${note.accidental || ""}` // Remove octave from correct scale too
    );

    const results = {
      correct: [] as string[],
      incorrect: [] as string[],
      missing: [] as string[],
      score: 0,
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

    results.score = Math.round(
      (results.correct.length / correctScale.length) * 100
    );

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
    <VStack align="stretch" gap={6}>
      <Box>
        <Text fontWeight="bold" mb={2}>
          Instructions:
        </Text>
        <Text mb={2}>
          Enter the D Major scale notes in order: D, E, F♯, G, A, B, C♯
        </Text>
        <Text fontSize="sm" fontStyle="italic" color="gray.600">
          Note: You can place the notes in any octave - only the note names and
          accidentals matter!
        </Text>
      </Box>

      {/* Controls */}
      <HStack wrap="wrap" gap={6} align="center">
        {/* Clef Selection */}
        <HStack>
          <Text fontWeight="medium">Clef:</Text>
          <Select.Root
            value={[currentClef]}
            collection={clefCollection}
            onValueChange={(e) =>
              setCurrentClef(e.value[0] as "treble" | "bass")
            }
            disabled={isSubmitted}
            width="140px"
            size="md"
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Select clef" />
            </Select.Trigger>
            <Select.Content>
              {clefCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </HStack>

        {/* Accidental Selection */}
        <HStack>
          <Text fontWeight="medium">Accidental:</Text>
          <HStack gap={1}>
            <Button
              onClick={() => setSelectedAccidental(null)}
              disabled={isSubmitted}
              size="sm"
              variant={
                selectedAccidental === null && !eraseMode && !isSubmitted
                  ? "solid"
                  : "outline"
              }
              colorScheme={
                selectedAccidental === null && !eraseMode && !isSubmitted
                  ? "blue"
                  : "gray"
              }
            >
              None
            </Button>
            <Button
              onClick={() => setSelectedAccidental("#")}
              disabled={isSubmitted}
              size="sm"
              variant={
                selectedAccidental === "#" && !eraseMode && !isSubmitted
                  ? "solid"
                  : "outline"
              }
              colorScheme={
                selectedAccidental === "#" && !eraseMode && !isSubmitted
                  ? "blue"
                  : "gray"
              }
            >
              ♯ Sharp
            </Button>
            <Button
              onClick={() => setSelectedAccidental("b")}
              disabled={isSubmitted}
              size="sm"
              variant={
                selectedAccidental === "b" && !eraseMode && !isSubmitted
                  ? "solid"
                  : "outline"
              }
              colorScheme={
                selectedAccidental === "b" && !eraseMode && !isSubmitted
                  ? "blue"
                  : "gray"
              }
            >
              ♭ Flat
            </Button>
            <Button
              onClick={() => setSelectedAccidental("n")}
              disabled={isSubmitted}
              size="sm"
              variant={
                selectedAccidental === "n" && !eraseMode && !isSubmitted
                  ? "solid"
                  : "outline"
              }
              colorScheme={
                selectedAccidental === "n" && !eraseMode && !isSubmitted
                  ? "blue"
                  : "gray"
              }
            >
              ♮ Natural
            </Button>
          </HStack>
        </HStack>

        {/* Erase Mode */}
        {!isSubmitted && (
          <Button
            onClick={() => {
              setEraseMode(!eraseMode);
              if (!eraseMode) setSelectedAccidental(null);
            }}
            variant={eraseMode ? "solid" : "outline"}
            colorScheme={eraseMode ? "red" : "gray"}
            size="sm"
            fontWeight={eraseMode ? "bold" : "normal"}
          >
            {eraseMode ? "🗑️ ERASE MODE" : "🗑️ Erase"}
          </Button>
        )}

        {/* Submit/Reset Buttons */}
        <Box ml="auto">
          {!isSubmitted ? (
            <Button
              onClick={gradeScale}
              disabled={placedNotes.length === 0}
              colorScheme="green"
              size="md"
              fontWeight="bold"
            >
              Submit Scale ({placedNotes.length}/{MAX_NOTES})
            </Button>
          ) : (
            <Button
              onClick={resetExercise}
              colorScheme="blue"
              size="md"
              fontWeight="bold"
            >
              Try Again
            </Button>
          )}
        </Box>
      </HStack>

      <Text
        color={eraseMode ? "red.600" : "gray.700"}
        fontWeight={eraseMode ? "bold" : "normal"}
      >
        {isSubmitted
          ? "Exercise submitted - view results below"
          : eraseMode
          ? "🗑️ ERASE MODE: Click on notes to remove them"
          : placedNotes.length >= MAX_NOTES
          ? "Maximum 7 notes reached - click Submit to grade your scale"
          : `Click on the staff to place notes (${placedNotes.length}/${MAX_NOTES})`}
      </Text>

      <div style={{ marginBottom: "100px" }}>
        <div
          ref={containerRef}
          onClick={handleStaffClick}
          className="vexflow-container"
          style={{
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: "4px",
            transform: "scale(1.5)",
            transformOrigin: "top left",
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      </div>

      {/* Grading Results */}
      {isSubmitted && gradeResult && (
        <Card.Root
          bg={gradeResult.score >= 70 ? "green.50" : "red.50"}
          borderWidth="2px"
          borderColor={gradeResult.score >= 70 ? "green.200" : "red.200"}
        >
          <Card.Body>
            <VStack align="stretch" gap={4}>
              <Heading size="md">Scale Exercise Results</Heading>
              <Text fontSize="2xl" fontWeight="bold">
                Score: {gradeResult.score}%
                {gradeResult.score >= 90
                  ? " 🎉 Excellent!"
                  : gradeResult.score >= 70
                  ? " 👍 Good!"
                  : " 📚 Keep practicing!"}
              </Text>

              {gradeResult.correct.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="green.700">
                    ✓ Correct notes:
                  </Text>
                  <Text color="green.700">
                    {gradeResult.correct.join(", ")}
                  </Text>
                </Box>
              )}

              {gradeResult.incorrect.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="red.700">
                    ✗ Incorrect notes:
                  </Text>
                  <Text color="red.700">
                    {gradeResult.incorrect.join(", ")}
                  </Text>
                </Box>
              )}

              {gradeResult.missing.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="orange.700">
                    ⚠ Missing notes:
                  </Text>
                  <Text color="orange.700">
                    {gradeResult.missing.join(", ")}
                  </Text>
                </Box>
              )}

              <Box pt={3} borderTopWidth="1px" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600">
                  <strong>Correct D Major Scale:</strong> D, E, F♯, G, A, B, C♯
                  (any octave)
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Current Notes Display */}
      {!isSubmitted && (
        <Box>
          <Text fontWeight="bold" mb={2}>
            Current notes: {placedNotes.length}/{MAX_NOTES}
          </Text>
          <VStack align="start" gap={1}>
            {placedNotes.map((note, index) => (
              <Text key={index} fontSize="sm">
                {index + 1}. {getNoteName(note.line, currentClef)}
                {note.accidental &&
                  ` (${
                    note.accidental === "#"
                      ? "Sharp"
                      : note.accidental === "b"
                      ? "Flat"
                      : "Natural"
                  })`}
              </Text>
            ))}
          </VStack>
          {placedNotes.length > 0 && (
            <Button
              onClick={() => setPlacedNotes([])}
              mt={3}
              size="sm"
              variant="outline"
              colorScheme="red"
            >
              Clear All Notes
            </Button>
          )}
        </Box>
      )}
    </VStack>
  );
}
