'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScaleExercise from '../../../components/exam/ScaleExercise';
import KeySignatureExercise from '../../../components/exam/KeySignatureExercise';
import ExamNavigation from '../../../components/exam/ExamNavigation';

const EXAM_PAGES = [
  {
    id: 1,
    title: "Scale Notation",
    description: "Enter the D Major scale notes in order"
  },
  {
    id: 2, 
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for the key signature"
  }
];

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const currentPage = parseInt(params.page as string);
  const [examStartTime] = useState(Date.now());
  
  // Redirect invalid pages
  useEffect(() => {
    if (isNaN(currentPage) || currentPage < 1 || currentPage > EXAM_PAGES.length) {
      router.push('/exam/1');
    }
  }, [currentPage, router]);

  if (isNaN(currentPage) || currentPage < 1 || currentPage > EXAM_PAGES.length) {
    return <div>Loading...</div>;
  }

  const currentExam = EXAM_PAGES[currentPage - 1];

  const handleNext = () => {
    if (currentPage < EXAM_PAGES.length) {
      router.push(`/exam/${currentPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(`/exam/${currentPage - 1}`);
    }
  };

  const handleFinish = () => {
    // TODO: Handle exam completion
    alert('Exam completed! (This would normally save results)');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h1>LydianLab Music Theory Exam</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{currentExam.title}</h2>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Page {currentPage} of {EXAM_PAGES.length}
          </div>
        </div>
        <p style={{ color: '#666', margin: '10px 0' }}>{currentExam.description}</p>
      </div>

      {/* Current Exercise */}
      <div style={{ marginBottom: '40px' }}>
        {currentPage === 1 && <ScaleExercise />}
        {currentPage === 2 && <KeySignatureExercise />}
      </div>

      {/* Navigation */}
      <ExamNavigation
        currentPage={currentPage}
        totalPages={EXAM_PAGES.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={handleFinish}
      />
    </div>
  );
}