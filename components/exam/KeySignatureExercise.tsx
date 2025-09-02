'use client';

import { useEffect, useRef, useState } from 'react';
import { Renderer, Stave } from 'vexflow';

interface PlacedAccidental {
  line: number;
  type: '#' | 'b'; // sharp or flat
}

// D Major key signature: F# and C# (2 sharps)
const D_MAJOR_KEY_SIGNATURE = [
  { line: 7, type: '#' as const }, // F# (top line in treble clef)
  { line: 3, type: '#' as const }  // C# (3rd line in treble clef) 
];

const MAX_ACCIDENTALS = 7; // Most key signatures have 7 sharps or flats

export default function KeySignatureExercise() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [placedAccidentals, setPlacedAccidentals] = useState<PlacedAccidental[]>([]);
  const [selectedAccidental, setSelectedAccidental] = useState<'#' | 'b' | null>('#'); // Default to sharp for D major
  const [currentClef, setCurrentClef] = useState<'treble' | 'bass'>('treble');
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    svgRef.current.innerHTML = '';

    // Create VexFlow renderer
    const renderer = new Renderer(svgRef.current, Renderer.Backends.SVG);
    renderer.resize(600, 200);
    const context = renderer.getContext();

    // Create a stave (no clef initially - we'll add it manually)
    const stave = new Stave(10, 40, 580);
    stave.addClef(currentClef);
    stave.setContext(context).draw();

    // Render placed accidentals as text symbols directly on SVG
    if (placedAccidentals.length > 0) {
      try {
        placedAccidentals.forEach((accidental, index) => {
          // Use the EXACT same coordinate system as ScaleExercise
          const x = 60 + (index * 25); // Start closer to clef, space 25px apart  
          
          // Copy exact logic from ScaleExercise erase functionality
          const accidentalY = 76.67 + (accidental.line * 5); // Same as ScaleExercise noteY calculation
          const y = accidentalY * 1.5; // Apply 1.5x scale (convert to scaled coordinates)
          
          // Get the SVG element to add text directly
          const svg = svgRef.current;
          if (svg) {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', (x * 1.5).toString()); // Account for 1.5x scale
            textElement.setAttribute('y', y.toString()); // Already in scaled coordinates
            textElement.setAttribute('font-family', 'serif');
            textElement.setAttribute('font-size', '24');
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'central');
            textElement.setAttribute('fill', 'black');
            
            // Use Unicode musical symbols
            const symbol = accidental.type === '#' ? '♯' : '♭';
            textElement.textContent = symbol;
            
            svg.appendChild(textElement);
          }
        });
      } catch (error) {
        console.error('Error rendering key signature:', error);
      }
    }

  }, [placedAccidentals, currentClef]);

  // Convert staff line position to note name (same as ScaleExercise)
  const getNoteName = (line: number, clef: 'treble' | 'bass'): string => {
    const trebleNotes = [
      'g/5', 'f/5', 'e/5', 'd/5', 'c/5', 'b/4', 'a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4', 'b/3'
    ];
    
    const bassNotes = [
      'b/3', 'a/3', 'g/3', 'f/3', 'e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2', 'f/2', 'e/2', 'd/2'
    ];
    
    const notes = clef === 'treble' ? trebleNotes : bassNotes;
    return notes[line] || notes[7];
  };

  // Convert click position to staff line (exact same logic as working ScaleExercise)
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

    if (eraseMode) {
      // Find and remove closest accidental
      if (placedAccidentals.length > 0) {
        let closestIndex = 0;
        let closestDistance = Infinity;

        placedAccidentals.forEach((accidental, index) => {
          // Copy EXACT logic from ScaleExercise erase functionality
          const accX = 60 + (index * 25); // Same positioning logic as rendering
          const accY = 76.67 + (accidental.line * 5); // Convert line to Y position (same as getStaffLine logic)
          const clickX = x / 1.5; // Convert click coordinates (same as ScaleExercise)
          const clickY = y / 1.5; // Convert click coordinates (same as ScaleExercise)
          
          const distance = Math.sqrt(
            Math.pow(clickX - accX, 2) + Math.pow(clickY - accY, 2)
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        if (closestDistance < 100) {
          setPlacedAccidentals(prev => prev.filter((_, index) => index !== closestIndex));
        }
      }
    } else {
      // Add accidental if under limit and not submitted
      if (placedAccidentals.length < MAX_ACCIDENTALS && !isSubmitted && selectedAccidental) {
        setPlacedAccidentals(prev => [...prev, { line, type: selectedAccidental }]);
      }
    }
  };

  // Grade the key signature
  const gradeKeySignature = () => {
    const results = {
      correct: [] as string[],
      incorrect: [] as string[],
      missing: [] as string[],
      score: 0
    };

    // Convert placed accidentals to comparable format
    const studentAccidentals = placedAccidentals.map(acc => `${acc.line}${acc.type}`);
    const correctAccidentals = D_MAJOR_KEY_SIGNATURE.map(acc => `${acc.line}${acc.type}`);

    // Check each student accidental
    studentAccidentals.forEach(studentAcc => {
      if (correctAccidentals.includes(studentAcc)) {
        results.correct.push(studentAcc);
      } else {
        results.incorrect.push(studentAcc);
      }
    });

    // Find missing accidentals
    correctAccidentals.forEach(correctAcc => {
      if (!studentAccidentals.includes(correctAcc)) {
        results.missing.push(correctAcc);
      }
    });

    results.score = Math.round((results.correct.length / correctAccidentals.length) * 100);
    
    setGradeResult(results);
    setIsSubmitted(true);
  };

  // Reset the exercise
  const resetExercise = () => {
    setPlacedAccidentals([]);
    setIsSubmitted(false);
    setGradeResult(null);
    setEraseMode(false);
    setSelectedAccidental('#');
  };

  return (
    <div>
      <p><strong>Instructions:</strong> Place the correct accidentals for D Major key signature</p>
      <p><em>Hint: D Major has 2 sharps - F♯ and C♯</em></p>
      
      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Clef Selection */}
        <div>
          <label style={{ marginRight: '10px' }}>Clef:</label>
          <select 
            value={currentClef} 
            onChange={(e) => setCurrentClef(e.target.value as 'treble' | 'bass')}
            style={{ padding: '5px' }}
            disabled={isSubmitted}
          >
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </div>

        {/* Accidental Selection */}
        <div>
          <label style={{ marginRight: '10px' }}>Accidental:</label>
          <button 
            onClick={() => setSelectedAccidental('#')}
            disabled={isSubmitted}
            style={{ 
              padding: '5px 10px', 
              margin: '0 2px',
              backgroundColor: selectedAccidental === '#' && !eraseMode && !isSubmitted ? '#007bff' : '#f8f9fa',
              color: selectedAccidental === '#' && !eraseMode && !isSubmitted ? 'white' : 'black',
              border: '1px solid #ccc',
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            ♯ Sharp
          </button>
          <button 
            onClick={() => setSelectedAccidental('b')}
            disabled={isSubmitted}
            style={{ 
              padding: '5px 10px', 
              margin: '0 2px',
              backgroundColor: selectedAccidental === 'b' && !eraseMode && !isSubmitted ? '#007bff' : '#f8f9fa',
              color: selectedAccidental === 'b' && !eraseMode && !isSubmitted ? 'white' : 'black',
              border: '1px solid #ccc',
              opacity: isSubmitted ? 0.5 : 1
            }}
          >
            ♭ Flat
          </button>
        </div>

        {/* Erase Mode */}
        {!isSubmitted && (
          <div>
            <button 
              onClick={() => {
                setEraseMode(!eraseMode);
                if (!eraseMode) setSelectedAccidental(null);
              }}
              style={{ 
                padding: '5px 15px',
                backgroundColor: eraseMode ? '#dc3545' : '#f8f9fa',
                color: eraseMode ? 'white' : 'black',
                border: '1px solid #ccc',
                fontWeight: eraseMode ? 'bold' : 'normal'
              }}
            >
              {eraseMode ? '🗑️ ERASE MODE' : '🗑️ Erase'}
            </button>
          </div>
        )}

        {/* Submit/Reset Button */}
        <div>
          {!isSubmitted ? (
            <button 
              onClick={gradeKeySignature}
              disabled={placedAccidentals.length === 0}
              style={{ 
                padding: '8px 20px',
                backgroundColor: placedAccidentals.length > 0 ? '#28a745' : '#f8f9fa',
                color: placedAccidentals.length > 0 ? 'white' : 'black',
                border: '1px solid #ccc',
                fontWeight: 'bold',
                opacity: placedAccidentals.length === 0 ? 0.5 : 1
              }}
            >
              Submit Key Signature ({placedAccidentals.length}/{MAX_ACCIDENTALS})
            </button>
          ) : (
            <button 
              onClick={resetExercise}
              style={{ 
                padding: '8px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: '1px solid #007bff',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
      
      <p>
        {isSubmitted 
          ? 'Exercise submitted - view results below' 
          : eraseMode 
          ? '🗑️ ERASE MODE: Click on accidentals to remove them' 
          : placedAccidentals.length >= MAX_ACCIDENTALS 
          ? 'Maximum accidentals reached - click Submit to grade' 
          : `Click on the staff to place accidentals (${placedAccidentals.length}/${MAX_ACCIDENTALS})`}
      </p>
      
      <svg
        ref={svgRef}
        width={600}
        height={200}
        onClick={handleStaffClick}
        style={{
          cursor: 'pointer',
          border: '1px solid #ccc',
          transform: 'scale(1.5)',
          transformOrigin: 'top left',
          marginBottom: '20px',
        }}
      />

      <div style={{ marginTop: '100px' }}>
        {/* Grading Results */}
        {isSubmitted && gradeResult && (
          <div style={{ 
            padding: '20px', 
            border: '2px solid #ccc', 
            borderRadius: '8px',
            backgroundColor: gradeResult.score >= 70 ? '#d4edda' : '#f8d7da',
            marginBottom: '20px'
          }}>
            <h4>Key Signature Exercise Results</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
              Score: {gradeResult.score}% 
              {gradeResult.score >= 90 ? ' 🎉 Perfect!' : 
               gradeResult.score >= 70 ? ' 👍 Good!' : ' 📚 Keep practicing!'}
            </p>
            
            {gradeResult.correct.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'green' }}>✓ Correct accidentals placed</strong>
              </div>
            )}
            
            {gradeResult.incorrect.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'red' }}>✗ Incorrect accidentals placed</strong>
              </div>
            )}
            
            {gradeResult.missing.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'orange' }}>⚠ Missing required accidentals</strong>
              </div>
            )}
            
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <strong>D Major Key Signature:</strong> F♯ and C♯ (2 sharps)
            </div>
          </div>
        )}

        {/* Current Accidentals Display */}
        {!isSubmitted && (
          <div>
            <p>Current accidentals: {placedAccidentals.length}/{MAX_ACCIDENTALS}</p>
            <div>
              {placedAccidentals.map((accidental, index) => (
                <div key={index}>
                  {index + 1}. {accidental.type === '#' ? 'Sharp' : 'Flat'} on line {accidental.line}
                </div>
              ))}
            </div>
            {placedAccidentals.length > 0 && (
              <button onClick={() => setPlacedAccidentals([])} style={{ marginTop: '10px', padding: '10px 20px' }}>
                Clear All Accidentals
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}