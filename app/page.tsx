"use client";

import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Card,
  VStack,
  HStack,
} from "@chakra-ui/react";

export default function Home() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4} color="gray.700">
            LydianLab Music Theory Entrance Exam
          </Heading>
        </Box>

        <Card.Root bg="gray.50" borderWidth="1px" borderColor="gray.200">
          <Card.Body p={8}>
            <VStack gap={6} align="stretch">
              <Box textAlign="center">
                <Heading size="lg" color="gray.600" mb={3}>
                  Welcome to the Music Theory Assessment
                </Heading>
                <Text fontSize="md" lineHeight="tall" color="gray.600">
                  This exam consists of <strong>2 sections</strong> designed to
                  assess your music theory knowledge and determine appropriate
                  class placement for music camp.
                </Text>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                  <Card.Body>
                    <VStack align="start" gap={2}>
                      <Heading size="md" color="green.600">
                        📝 Section 1
                      </Heading>
                      <Heading size="sm">Scale Notation</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Enter the D Major scale notes with proper accidentals
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                  <Card.Body>
                    <VStack align="start" gap={2}>
                      <Heading size="md" color="blue.600">
                        🎼 Section 2
                      </Heading>
                      <Heading size="sm">Key Signature Notation</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Place the correct sharps or flats for key signatures
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </Grid>

              <Card.Root
                bg="yellow.50"
                borderWidth="1px"
                borderColor="yellow.200"
              >
                <Card.Body py={4}>
                  <HStack
                    gap={4}
                    wrap="wrap"
                    justify="center"
                    fontSize="sm"
                    color="yellow.800"
                  >
                    <HStack>
                      <Text>⏱️</Text>
                      <Text>
                        <strong>Time Limit:</strong> 60 minutes
                      </Text>
                    </HStack>
                    <HStack>
                      <Text>💾</Text>
                      <Text>
                        <strong>Auto-save:</strong> Progress saved automatically
                      </Text>
                    </HStack>
                    <HStack>
                      <Text>🎯</Text>
                      <Text>
                        <strong>Grading:</strong> Immediate feedback
                      </Text>
                    </HStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Box textAlign="center">
          <Button
            asChild
            size="lg"
            colorScheme="blue"
            fontSize="lg"
            px={8}
            py={6}
          >
            <Link
              href="/exam/1"
              style={{
                display: "inline-block",
                padding: "15px 30px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#007bff",
                textDecoration: "none",
                borderRadius: "6px",
                border: "2px solid #007bff",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#0056b3";
                e.currentTarget.style.borderColor = "#0056b3";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#007bff";
                e.currentTarget.style.borderColor = "#007bff";
              }}
            >
              Start Exam →
            </Link>
          </Button>
        </Box>

        <Box textAlign="center" fontSize="sm" color="gray.600">
          <VStack gap={2}>
            <Text>
              <strong>Need help?</strong> Contact your music instructor before
              starting the exam.
            </Text>
            <Text>
              Make sure you have a stable internet connection and uninterrupted
              time to complete both sections.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
