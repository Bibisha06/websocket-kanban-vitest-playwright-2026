import React from "react";
import { UserButton } from "@clerk/clerk-react";
import { Box, Flex, VStack, Button, Text, Icon, Spacer } from "@chakra-ui/react";
import { RiLayoutGridFill, RiBarChart2Fill, RiAddLine, RiKanbanView2 } from "react-icons/ri";

function Layout({ currentView, onNavigate, onNewTask, children }) {
  return (
    <Flex h="100vh" overflow="hidden" bg="gray.900">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="gray.800"
        borderRight="1px"
        borderColor="gray.700"
        display={{ base: "none", md: "block" }}
        flexShrink={0}
      >
        <Flex direction="column" h="full">
          {/* Logo */}
          <Flex align="center" p={6} borderBottom="1px" borderColor="gray.700">
            <Icon as={RiKanbanView2} boxSize={8} color="brand.500" mr={3} sx={{ filter: "drop-shadow(0 0 8px rgba(255, 0, 255, 0.6))" }} />
            <Text fontSize="xl" fontWeight="bold" color="white">
              Kanban Flow
            </Text>
          </Flex>

          {/* Navigation */}
          <VStack spacing={2} align="stretch" p={4} flex={1}>
            <Button
              variant={currentView === "board" ? "solid" : "ghost"}
              colorScheme="brand"
              justifyContent="flex-start"
              leftIcon={<Icon as={RiLayoutGridFill} />}
              onClick={() => onNavigate("board")}
              size="lg"
              _hover={{ bg: "brand.900" }}
            >
              Kanban Board
            </Button>
            <Button
              variant={currentView === "analytics" ? "solid" : "ghost"}
              colorScheme="brand"
              justifyContent="flex-start"
              leftIcon={<Icon as={RiBarChart2Fill} />}
              onClick={() => onNavigate("analytics")}
              size="lg"
              _hover={{ bg: "brand.900" }}
            >
              Analytics
            </Button>

            <Box pt={4}>
              <Button
                w="full"
                colorScheme="brand"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Icon as={RiAddLine} />}
                onClick={onNewTask}
                size="md"
                _hover={{ bg: "brand.900", boxShadow: "0 0 10px rgba(255, 0, 255, 0.4)" }}
              >
                New Task
              </Button>
            </Box>
          </VStack>

          {/* Footer */}
          <Box p={6} borderTop="1px" borderColor="gray.700">
            <Text fontSize="xs" color="gray.400" mb={2}>
              © 2024 Kanban Flow Inc.
            </Text>
            <Flex align="center">
              <Box w={2} h={2} borderRadius="full" bg="green.400" mr={2} boxShadow="0 0 5px #48BB78" />
              <Text fontSize="xs" color="gray.400">
                Connected to Real-time Sync
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex={1} overflow="hidden">
        {/* Header */}
        <Flex
          as="header"
          h="16"
          align="center"
          justify="space-between"
          px={8}
          bg="gray.800"
          borderBottom="1px"
          borderColor="gray.700"
        >
          {/* Mobile Logo View (if needed later) */}
          <Box display={{ base: "block", md: "none" }}>
            <Icon as={RiKanbanView2} boxSize={8} color="brand.500" />
          </Box>

          <Spacer />

          <Box>
            <UserButton />
          </Box>
        </Flex>

        {/* Content Area */}
        <Box flex={1} overflowY="auto" p={8}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

export default Layout;
