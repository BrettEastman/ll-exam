"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Renderer, Stave } from "vexflow";
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

interface PlacedAccidental {
  note: string; // e.g., 'f/5', 'c/5' (VexFlow notation)
  type: "#" | "b"; // sharp or flat
}

// D Major key signature using proper VexFlow notation
const D_MAJOR_KEY_SIGNATURE = [
  { note: "f/5", type: "#" as const }, // F# (top line in treble)
  { note: "c/5", type: "#" as const }, // C# (third space in treble)
];

const MAX_ACCIDENTALS = 7; // Most key signatures have 7 sharps or flats

export default function KeySignatureExercise() {
  const containerRef = useRef<HTMLDivElement>(null);
  const staveRef = useRef<InstanceType<typeof Stave> | null>(null);
  const [placedAccidentals, setPlacedAccidentals] = useState<
    PlacedAccidental[]
  >([]);
  const [selectedAccidental, setSelectedAccidental] = useState<
    "#" | "b" | null
  >("#"); // Default to sharp for D major
  const [currentClef, setCurrentClef] = useState<"treble" | "bass">("treble");
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<{
    correct: string[];
    incorrect: string[];
    missing: string[];
    score: number;
  } | null>(null);

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
        const renderer = new Renderer(containerRef.current!, Renderer.Backends.SVG);
        renderer.resize(600, 200);
        const context = renderer.getContext();

        // Create a stave
        const stave = new Stave(10, 40, 580);
        stave.addClef(currentClef);
        staveRef.current = stave;

        // Render individual accidentals using text (simpler approach)
        if (placedAccidentals.length > 0) {
          try {
            placedAccidentals.forEach((accidental, index) => {
              // Calculate X position for each accidental (space them out)
              const x = 60 + index * 25; // Start after clef, space 25px apart

              // Calculate Y position using VexFlow's coordinate system
              const noteY = getNoteYPosition(accidental.note, currentClef);

              // Use Unicode symbols for accidentals
              const symbol = accidental.type === "#" ? "♯" : "♭";

              console.log(
                `Rendering text accidental: ${symbol} at x=${x}, y=${noteY}`
              );

              // Render as text directly on SVG
              const svg = containerRef.current?.querySelector("svg");
              if (svg) {
                const textElement = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "text"
                );
                textElement.setAttribute("x", x.toString());
                textElement.setAttribute("y", noteY.toString());
                textElement.setAttribute("font-family", "serif");
                textElement.setAttribute("font-size", "24");
                textElement.setAttribute("text-anchor", "middle");
                textElement.setAttribute("dominant-baseline", "central");
                textElement.setAttribute("fill", "black");
                textElement.textContent = symbol;

                svg.appendChild(textElement);
                console.log(`Successfully rendered text accidental: ${symbol}`);
              } else {
                console.error(`SVG not available in container`);
              }
            });
          } catch (error) {
            console.error("Error rendering accidentals:", error);
          }
        }

    // // Add debug labels to show staff positions
    // if (placedAccidentals.length === 0) {
    //   const svg = svgRef.current;
    //   if (svg) {
    //     // Use the actual coordinates based on click positions
    //     const debugLabels = [
    //       { note: "F", y: 76.67 }, // Top line
    //       { note: "E", y: 86.67 }, // E space (from y=129, scaledY=86)
    //       { note: "D", y: 96.67 }, // D line (estimated)
    //       { note: "C", y: 106.67 }, // C space (estimated)
    //       { note: "B", y: 116.67 }, // B line (from y=150, scaledY=100)
    //       { note: "A", y: 126.67 }, // A space (estimated)
    //       { note: "G", y: 136.67 }, // G line (estimated)
    //     ];

    //     debugLabels.forEach((label) => {
    //       const textElement = document.createElementNS(
    //         "http://www.w3.org/2000/svg",
    //         "text"
    //       );
    //       textElement.setAttribute("x", "500");
    //       textElement.setAttribute("y", label.y.toString());
    //       textElement.setAttribute("font-family", "Arial");
    //       textElement.setAttribute("font-size", "12");
    //       textElement.setAttribute("fill", "red");
    //       textElement.textContent = label.note;
    //       svg.appendChild(textElement);
    //     });
    //   }
    // }

        stave.setContext(context).draw();
      } catch (error) {
        console.error("Error loading VexFlow fonts:", error);
      }
    };

    loadAndRender();
  }, [placedAccidentals, currentClef]);

  // Get Y position for a note on the staff
  const getNoteYPosition = (note: string, clef: "treble" | "bass"): number => {
    // Use VexFlow's coordinate system for the stave
    // Get the actual Y positions for lines and spaces from VexFlow
    const topLineY = staveRef.current?.getYForLine(0) || 76.67; // Top line
    const spacing = staveRef.current?.getSpacingBetweenLines() || 10;

    // Calculate positions for all notes based on VexFlow's coordinate system
    const positions: { [key: string]: number } = {
      "f/5": topLineY, // Top line (F)
      "e/5": topLineY + spacing / 2, // Space above first line (E)
      "d/5": topLineY + spacing, // Second line (D)
      "c/5": topLineY + spacing + spacing / 2, // Third space (C)
      "b/4": topLineY + spacing * 2, // Third line (B)
      "a/4": topLineY + spacing * 2 + spacing / 2, // Fourth space (A)
      "g/4": topLineY + spacing * 3, // Fourth line (G)
      "f/4": topLineY + spacing * 3 + spacing / 2, // Fifth space (F)
      "e/4": topLineY + spacing * 4, // Bottom line (E)
    };

    const position = positions[note] || topLineY + spacing * 2; // Default to B line
    console.log(`Note ${note} (${clef}) maps to Y=${position}`);
    return position;
  };

  // Convert click position to note name based on staff position
  const getNoteFromClick = (y: number): string | null => {
    // Account for the 1.5x scale
    const scaledY = y / 1.5;

    // Use VexFlow's coordinate system for the stave
    // Get the actual Y positions for lines and spaces from VexFlow
    const topLineY = staveRef.current?.getYForLine(0) || 76.67; // Top line
    const spacing = staveRef.current?.getSpacingBetweenLines() || 10;

    // Calculate positions for all notes based on VexFlow's coordinate system
    const positions: { [key: string]: number } = {
      "f/5": topLineY, // Top line (F)
      "e/5": topLineY + spacing / 2, // Space above first line (E)
      "d/5": topLineY + spacing, // Second line (D)
      "c/5": topLineY + spacing + spacing / 2, // Third space (C)
      "b/4": topLineY + spacing * 2, // Third line (B)
      "a/4": topLineY + spacing * 2 + spacing / 2, // Fourth space (A)
      "g/4": topLineY + spacing * 3, // Fourth line (G)
      "f/4": topLineY + spacing * 3 + spacing / 2, // Fifth space (F)
      "e/4": topLineY + spacing * 4, // Bottom line (E)
    };

    // Find closest position
    let closestNote = null;
    let minDistance = Infinity;

    Object.entries(positions).forEach(([note, posY]) => {
      const distance = Math.abs(scaledY - posY);
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = note;
      }
    });

    // Only accept clicks within 8px of a position
    if (minDistance < 8) {
      console.log(
        `Click detected: y=${y}, scaledY=${scaledY}, closest=${closestNote}, distance=${minDistance}`
      );
      return closestNote;
    }

    console.log(
      `Click detected: y=${y}, scaledY=${scaledY}, no valid note found (distance=${minDistance})`
    );
    return null;
  };

  // Validate that the accidental is musically valid
  const isValidAccidental = (note: string, accidental: string): boolean => {
    // Prevent invalid combinations like B#, E#, Fb, Cb
    const invalidCombinations = [
      "b#",
      "e#",
      "fb",
      "cb", // These don't exist in standard music theory
    ];

    const combination = `${note}${accidental}`.toLowerCase();
    return !invalidCombinations.includes(combination);
  };

  const handleStaffClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Get the SVG that VexFlow created inside the container
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const note = getNoteFromClick(y);

    console.log(
      `Click detected: y=${y}, note=${note}, accidental=${selectedAccidental}`
    );

    if (!note) return;

    if (eraseMode) {
      // Find and remove accidental for this note
      setPlacedAccidentals((prev) => prev.filter((acc) => acc.note !== note));
    } else {
      // Add accidental if under limit and not submitted
      if (
        placedAccidentals.length < MAX_ACCIDENTALS &&
        !isSubmitted &&
        selectedAccidental
      ) {
        // Validate the accidental before adding
        if (!isValidAccidental(note, selectedAccidental)) {
          console.log(`Invalid accidental: ${note}${selectedAccidental}`);
          return; // Don't add invalid accidentals
        }

        // Check if note already has an accidental
        const existingIndex = placedAccidentals.findIndex(
          (acc) => acc.note === note
        );

        if (existingIndex >= 0) {
          // Update existing accidental
          setPlacedAccidentals((prev) =>
            prev.map((acc, index) =>
              index === existingIndex
                ? { ...acc, type: selectedAccidental }
                : acc
            )
          );
          console.log(
            `Updated existing accidental: ${note}${selectedAccidental}`
          );
        } else {
          // Add new accidental
          setPlacedAccidentals((prev) => {
            const newAccidentals = [
              ...prev,
              { note, type: selectedAccidental },
            ];
            console.log(
              `Added new accidental: ${note}${selectedAccidental}`,
              newAccidentals
            );
            return newAccidentals;
          });
        }
      }
    }
  };

  // Grade the key signature
  const gradeKeySignature = () => {
    const results = {
      correct: [] as string[],
      incorrect: [] as string[],
      missing: [] as string[],
      score: 0,
    };

    // Convert placed accidentals to comparable format
    const studentAccidentals = placedAccidentals.map(
      (acc) => `${acc.note}${acc.type}`
    );
    const correctAccidentals = D_MAJOR_KEY_SIGNATURE.map(
      (acc) => `${acc.note}${acc.type}`
    );

    // Check each student accidental
    studentAccidentals.forEach((studentAcc) => {
      if (correctAccidentals.includes(studentAcc)) {
        results.correct.push(studentAcc);
      } else {
        results.incorrect.push(studentAcc);
      }
    });

    // Find missing accidentals
    correctAccidentals.forEach((correctAcc) => {
      if (!studentAccidentals.includes(correctAcc)) {
        results.missing.push(correctAcc);
      }
    });

    results.score = Math.round(
      (results.correct.length / correctAccidentals.length) * 100
    );

    setGradeResult(results);
    setIsSubmitted(true);
  };

  // Reset the exercise
  const resetExercise = () => {
    setPlacedAccidentals([]);
    setIsSubmitted(false);
    setGradeResult(null);
    setEraseMode(false);
    setSelectedAccidental("#");
  };

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Text fontWeight="bold" mb={2}>
          Instructions:
        </Text>
        <Text mb={2}>
          Place the correct accidentals for D Major key signature
        </Text>
        <Text fontSize="sm" fontStyle="italic" color="gray.600">
          Hint: D Major has 2 sharps - F♯ and C♯
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

        {/* Submit/Reset Button */}
        <Box ml="auto">
          {!isSubmitted ? (
            <Button
              onClick={gradeKeySignature}
              disabled={placedAccidentals.length === 0}
              colorScheme="green"
              size="md"
              fontWeight="bold"
            >
              Submit Key Signature ({placedAccidentals.length}/{MAX_ACCIDENTALS}
              )
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
          ? "🗑️ ERASE MODE: Click on accidentals to remove them"
          : placedAccidentals.length >= MAX_ACCIDENTALS
          ? "Maximum accidentals reached - click Submit to grade"
          : `Click on the staff to place accidentals (${placedAccidentals.length}/${MAX_ACCIDENTALS})`}
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
            width: "600px",
            height: "200px",
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
              <Heading size="md">Key Signature Exercise Results</Heading>
              <Text fontSize="2xl" fontWeight="bold">
                Score: {gradeResult.score}%
                {gradeResult.score >= 90
                  ? " 🎉 Perfect!"
                  : gradeResult.score >= 70
                  ? " 👍 Good!"
                  : " 📚 Keep practicing!"}
              </Text>

              {gradeResult.correct.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="green.700">
                    ✓ Correct accidentals placed
                  </Text>
                </Box>
              )}

              {gradeResult.incorrect.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="red.700">
                    ✗ Incorrect accidentals placed
                  </Text>
                </Box>
              )}

              {gradeResult.missing.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="orange.700">
                    ⚠ Missing required accidentals
                  </Text>
                </Box>
              )}

              <Box pt={3} borderTopWidth="1px" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600">
                  <strong>D Major Key Signature:</strong> F♯ and C♯ (2 sharps)
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Current Accidentals Display */}
      {!isSubmitted && (
        <Box>
          <Text fontWeight="bold" mb={2}>
            Current accidentals: {placedAccidentals.length}/{MAX_ACCIDENTALS}
          </Text>
          <VStack align="start" gap={1}>
            {placedAccidentals.map((accidental, index) => (
              <Text key={index} fontSize="sm">
                {index + 1}. {accidental.note.toUpperCase()}
                {accidental.type === "#" ? "♯" : "♭"}
              </Text>
            ))}
          </VStack>
          {placedAccidentals.length > 0 && (
            <Button
              onClick={() => setPlacedAccidentals([])}
              mt={3}
              size="sm"
              variant="outline"
              colorScheme="red"
            >
              Clear All Accidentals
            </Button>
          )}
        </Box>
      )}
    </VStack>
  );
}
