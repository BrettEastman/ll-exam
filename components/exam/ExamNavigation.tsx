import { Box, Button, HStack, Text, Circle } from '@chakra-ui/react';

interface ExamNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function ExamNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onFinish
}: ExamNavigationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <Box
      borderTopWidth="2px"
      borderColor="gray.200"
      bg="gray.50"
      p={5}
    >
      <HStack justify="space-between" align="center">
        {/* Previous Button */}
        <Button
          onClick={onPrevious}
          disabled={isFirstPage}
          variant="outline"
          colorScheme="gray"
          size="lg"
        >
          ← Previous
        </Button>

        {/* Progress Indicator */}
        <HStack gap={3} align="center">
          {Array.from({ length: totalPages }, (_, i) => (
            <Circle
              key={i + 1}
              size="3"
              bg={
                i + 1 === currentPage
                  ? 'blue.500'
                  : i + 1 < currentPage
                  ? 'green.500'
                  : 'gray.300'
              }
              transition="all 0.3s"
            />
          ))}
          <Text ml={2} color="gray.600">
            {currentPage} of {totalPages}
          </Text>
        </HStack>

        {/* Next/Finish Button */}
        {isLastPage ? (
          <Button
            onClick={onFinish}
            colorScheme="green"
            size="lg"
            fontWeight="bold"
          >
            Finish Exam ✓
          </Button>
        ) : (
          <Button
            onClick={onNext}
            colorScheme="blue"
            size="lg"
          >
            Next →
          </Button>
        )}
      </HStack>
    </Box>
  );
}
