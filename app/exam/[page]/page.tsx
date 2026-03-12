"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import ScaleExercise from "../../../components/exam/ScaleExercise";
import KeySignatureExercise from "../../../components/exam/KeySignatureExercise";
import ExamNavigation from "../../../components/exam/ExamNavigation";

const EXAM_PAGES = [
  {
    id: 1,
    title: "Scale Notation",
    description: "Enter the D Major scale notes in order",
  },
  {
    id: 2,
    title: "Key Signature Notation",
    description: "Place the correct sharps or flats for the key signature",
  },
];

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const currentPage = parseInt(params.page as string);
  const [examStartTime] = useState(Date.now());

  // Redirect invalid pages
  useEffect(() => {
    if (
      isNaN(currentPage) ||
      currentPage < 1 ||
      currentPage > EXAM_PAGES.length
    ) {
      router.push("/exam/1");
    }
  }, [currentPage, router]);

  if (
    isNaN(currentPage) ||
    currentPage < 1 ||
    currentPage > EXAM_PAGES.length
  ) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
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
    alert("Exam completed! (This would normally save results)");
  };

  return (
    <Container maxW="container.xl" py={8} px={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box borderBottomWidth="2px" borderColor="gray.200" pb={5}>
          <VStack align="stretch" gap={3}>
            <Heading size="xl">Lydian Lab Music Theory Exam</Heading>
            <HStack justify="space-between" align="center">
              <Heading size="lg">{currentExam.title}</Heading>
              <Text fontSize="sm" color="gray.600">
                Page {currentPage} of {EXAM_PAGES.length}
              </Text>
            </HStack>
            <Text color="gray.600">{currentExam.description}</Text>
          </VStack>
        </Box>

        {/* Current Exercise */}
        <Box>
          {currentPage === 1 && <ScaleExercise />}
          {currentPage === 2 && <KeySignatureExercise />}
        </Box>

        {/* Navigation */}
        <ExamNavigation
          currentPage={currentPage}
          totalPages={EXAM_PAGES.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </VStack>
    </Container>
  );
}
